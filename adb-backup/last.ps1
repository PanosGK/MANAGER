# Android Backup Tool - GUI
# Run in Windows PowerShell 5.1+ or PowerShell 7+

$OutputEncoding = [System.Text.Encoding]::UTF8

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class ConsoleWindow {
    [DllImport("kernel32.dll")] static extern IntPtr GetConsoleWindow();
    [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    public static void Hide() { ShowWindow(GetConsoleWindow(), 0); }
}
public class AdbDeviceItem {
    public string Model { get; set; }
    public string SerialNumber { get; set; }
    public string DisplayName { get; set; }
    public override string ToString() { return DisplayName ?? SerialNumber ?? ""; }
}
"@

# --- Configuration ---
$Script:BackupBaseDir = "F:\SMARTPHONES\ADB_SCRIPT"
$Script:BackupFolders = @(
    "sdcard/DCIM",
    "sdcard/Pictures",
    "sdcard/Movies",
    "sdcard/Viber",
    "sdcard/whatsapp",
    "sdcard/Download",
    "sdcard/Downloads",
    "sdcard/Documents"
)

$Script:StateFileName = "_transfer_state.log"
$Script:CompletionMarker = "_TRANSFER_SESSION_FULLY_COMPLETED_"
$Script:CancelBackupRequested = $false
$Script:PauseBackupRequested = $false

# --- Helpers ---
function Format-BytesHuman {
    param([decimal]$Bytes)
    if ($Bytes -lt 1KB) { return "{0:N0} B" -f $Bytes }
    if ($Bytes -lt 1MB) { return "{0:N2} KB" -f ($Bytes / 1KB) }
    if ($Bytes -lt 1GB) { return "{0:N2} MB" -f ($Bytes / 1MB) }
    return "{0:N2} GB" -f ($Bytes / 1GB)
}

function Format-SpeedHuman {
    param([double]$BytesPerSecond)
    if ($BytesPerSecond -lt 1KB) { return "{0:N0} B/s" -f $BytesPerSecond }
    if ($BytesPerSecond -lt 1MB) { return "{0:N1} KB/s" -f ($BytesPerSecond / 1KB) }
    if ($BytesPerSecond -lt 1GB) { return "{0:N1} MB/s" -f ($BytesPerSecond / 1MB) }
    return "{0:N2} GB/s" -f ($BytesPerSecond / 1GB)
}

function Format-DurationShort {
    param([TimeSpan]$Duration)
    if ($Duration.TotalHours -ge 1) {
        return "{0}h {1}m" -f [int][Math]::Floor($Duration.TotalHours), $Duration.Minutes
    }
    if ($Duration.TotalMinutes -ge 1) {
        return "{0}m {1}s" -f [int][Math]::Floor($Duration.TotalMinutes), $Duration.Seconds
    }
    return "{0}s" -f [Math]::Max(1, [int][Math]::Ceiling($Duration.TotalSeconds))
}

function Get-BackupEtaText {
    param(
        [decimal]$CurrentBytes,
        [decimal]$TotalBytes,
        $StartTime,
        [double]$MinElapsedSeconds = 3
    )

    if ($null -eq $StartTime) { return "Estimating time remaining..." }

    $elapsed = ((Get-Date) - $StartTime).TotalSeconds
    if ($elapsed -lt $MinElapsedSeconds -or $CurrentBytes -le 0) {
        return "Estimating time remaining..."
    }

    $speed = [double]($CurrentBytes / $elapsed)
    if ($speed -lt 1024) { return "Estimating time remaining..." }

    $speedText = Format-SpeedHuman $speed
    if ($TotalBytes -gt 0) {
        $remainingBytes = [Math]::Max(0, [double]($TotalBytes - $CurrentBytes))
        if ($remainingBytes -le 0) { return "Finishing up · $speedText" }
        $etaSeconds = $remainingBytes / $speed
        return "~$(Format-DurationShort ([TimeSpan]::FromSeconds($etaSeconds))) remaining · $speedText"
    }

    return "Speed: $speedText"
}

function Get-ScriptDirectory {
    if ($PSScriptRoot) { return $PSScriptRoot }
    return Split-Path -Parent $MyInvocation.MyCommand.Definition
}

function Get-BackupSettingsPath {
    return Join-Path (Get-ScriptDirectory) "backup_settings.json"
}

function Get-DriveFreeSpaceBytes {
    param([string]$Path)
    try {
        $fullPath = [System.IO.Path]::GetFullPath($Path)
        $root = [System.IO.Path]::GetPathRoot($fullPath)
        if ([string]::IsNullOrWhiteSpace($root)) { return [long]0 }
        $drive = New-Object System.IO.DriveInfo($root)
        if (-not $drive.IsReady) { return [long]0 }
        return [long]$drive.AvailableFreeSpace
    } catch {
        return [long]0
    }
}

function Test-BackupDiskSpace {
    param(
        [string]$DestinationPath,
        [decimal]$RequiredBytes,
        [double]$BufferRatio = 0.05
    )
    $freeBytes = [decimal](Get-DriveFreeSpaceBytes -Path $DestinationPath)
    $requiredWithBuffer = $RequiredBytes * (1 + $BufferRatio)
    return @{
        Ok = ($RequiredBytes -le 0) -or ($freeBytes -ge $requiredWithBuffer)
        FreeBytes = $freeBytes
        RequiredBytes = $RequiredBytes
        RequiredWithBuffer = $requiredWithBuffer
    }
}

function Get-DeviceSubfolders {
    param(
        [string]$DeviceID,
        [string]$DeviceFolderPath
    )
    $normalized = $DeviceFolderPath.Trim().TrimStart('/').Replace('\', '/')
    if ([string]::IsNullOrWhiteSpace($normalized)) { $normalized = "sdcard" }
    $remotePath = "/$normalized"
    $escapedPath = $remotePath.Replace("'", "'\''")
    $findCmd = "find '$escapedPath' -maxdepth 1 -mindepth 1 -type d ! -name '.*' 2>/dev/null"
    $result = Invoke-AdbShellFind -DeviceID $DeviceID -FindCommandString $findCmd
    if ($result.ExitCode -ne 0 -and [string]::IsNullOrWhiteSpace($result.Output)) {
        return @()
    }
    $folders = @()
    foreach ($line in ($result.Output -split "`n")) {
        $trimmed = $line.Trim()
        if ([string]::IsNullOrWhiteSpace($trimmed)) { continue }
        $relative = $trimmed.TrimStart('/')
        $folders += $relative
    }
    return ,($folders | Sort-Object)
}

function Show-BackupToast {
    param(
        [string]$Title,
        [string]$Message
    )
    try {
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null
        $safeTitle = [System.Security.SecurityElement]::Escape($Title)
        $safeMessage = [System.Security.SecurityElement]::Escape($Message)
        $template = "<toast><visual><binding template=`"ToastGeneric`"><text>$safeTitle</text><text>$safeMessage</text></binding></visual></toast>"
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($template)
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("Android Backup Tool").Show($toast) | Out-Null
        return
    } catch { }

    try {
        $balloon = New-Object System.Windows.Forms.NotifyIcon
        $balloon.Icon = [System.Drawing.SystemIcons]::Information
        $balloon.Visible = $true
        $balloon.ShowBalloonTip(6000, $Title, $Message, [System.Windows.Forms.ToolTipIcon]::Info)
        Start-Sleep -Milliseconds 500
        $balloon.Visible = $false
        $balloon.Dispose()
    } catch { }
}

function Check-ADB {
    if (Get-Command adb -ErrorAction SilentlyContinue) { return $true }

    $ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $InstallerPath = Join-Path $ScriptPath "Latest-ADB-Installer.bat"
    if (-not (Test-Path $InstallerPath)) {
        [System.Windows.Forms.MessageBox]::Show(
            "ADB was not found and 'Latest-ADB-Installer.bat' is missing from the script folder.",
            "ADB Required",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        ) | Out-Null
        return $false
    }

    $answer = [System.Windows.Forms.MessageBox]::Show(
        "ADB is not installed. Run the ADB installer now? (Administrator approval required)",
        "Install ADB",
        [System.Windows.Forms.MessageBoxButtons]::YesNo,
        [System.Windows.Forms.MessageBoxIcon]::Question
    )
    if ($answer -ne [System.Windows.Forms.DialogResult]::Yes) { return $false }

    try {
        Start-Process -FilePath $InstallerPath -Wait -Verb RunAs
        if ($LASTEXITCODE -eq 0) {
            [System.Windows.Forms.MessageBox]::Show(
                "ADB installed. Please restart this application.",
                "Installation Complete",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Information
            ) | Out-Null
        }
        return (Get-Command adb -ErrorAction SilentlyContinue) -ne $null
    } catch {
        [System.Windows.Forms.MessageBox]::Show(
            "Failed to run ADB installer: $($_.Exception.Message)",
            "Installation Failed",
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        ) | Out-Null
        return $false
    }
}

function Get-ConnectedDevices {
    $DevicesOutput = adb devices | Out-String
    $ConnectedDevices = @()
    foreach ($line in ($DevicesOutput -split "`n")) {
        if ($line -match "^([a-zA-Z0-9]+)\s+device.*$") {
            $DeviceSerial = $Matches[1]
            try {
                $DeviceModel = ((adb -s $DeviceSerial shell getprop ro.product.model) -replace "[\r\n]+", "").Trim()
                if (-not $DeviceModel) { $DeviceModel = $DeviceSerial }
            } catch {
                $DeviceModel = $DeviceSerial
            }
            $ConnectedDevices += New-Object AdbDeviceItem -Property @{
                SerialNumber = $DeviceSerial
                Model        = $DeviceModel
                DisplayName  = "$DeviceModel  ·  $DeviceSerial"
            }
        }
    }
    return ,$ConnectedDevices
}

function Invoke-AdbShellFind {
    param(
        [string]$DeviceID,
        [string]$FindCommandString
    )
    $AdbFindArgs = @('-s', $DeviceID, 'shell', $FindCommandString)
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "adb"
    $processInfo.Arguments = ($AdbFindArgs[0..2] + ('"' + $AdbFindArgs[3] + '"')) -join " "
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true
    $processInfo.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $processInfo.StandardErrorEncoding = [System.Text.Encoding]::UTF8
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    $process.Start() | Out-Null
    $output = $process.StandardOutput.ReadToEnd()
    $errors = $process.StandardError.ReadToEnd()
    $process.WaitForExit()
    return @{
        Output   = $output
        Errors   = $errors
        ExitCode = $process.ExitCode
    }
}

function Backup-FolderContents {
    param(
        [string]$DeviceID,
        [string]$SourceFolderOnDevice,
        [string]$BaseBackupDir,
        [System.Collections.Generic.HashSet[string]]$AlreadyTransferredFiles,
        [string]$StateFilePath,
        [scriptblock]$OnProgress,
        [scriptblock]$ShouldCancel = { $false },
        [scriptblock]$WaitIfPaused = {}
    )

    $SourceFolderLeafName = Split-Path -Leaf $SourceFolderOnDevice
    $LocalTargetFolderForThisSource = Join-Path $BaseBackupDir $SourceFolderLeafName
    if (-not (Test-Path $LocalTargetFolderForThisSource -PathType Container)) {
        try {
            New-Item -ItemType Directory -Path $LocalTargetFolderForThisSource -Force -ErrorAction Stop | Out-Null
        } catch {
            return [PSCustomObject]@{
                SourceFolder = $SourceFolderOnDevice
                FilesBackedUp = 0
                FilesSkipped = 0
                FilesFailed = 0
                Success = $false
                Message = "Failed to create local directory."
            }
        }
    }

    $RemotePathForFind = "/$SourceFolderOnDevice"
    $FindCommandString = "find '$RemotePathForFind' \( -type d -name '.*' -prune \) -o \( -type f `! -name '.*' -print \)"
    $findResult = Invoke-AdbShellFind -DeviceID $DeviceID -FindCommandString $FindCommandString

    if ($findResult.ExitCode -ne 0 -and [string]::IsNullOrWhiteSpace($findResult.Output)) {
        return [PSCustomObject]@{
            SourceFolder = $SourceFolderOnDevice
            FilesBackedUp = 0
            FilesSkipped = 0
            FilesFailed = 0
            Success = $false
            Message = "Failed to list files."
        }
    }

    $FilesOnDevice = $findResult.Output.Split("`n") | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_.Trim() }
    if ($FilesOnDevice.Count -eq 0) {
        return [PSCustomObject]@{
            SourceFolder = $SourceFolderOnDevice
            FilesBackedUp = 0
            FilesSkipped = 0
            FilesFailed = 0
            Success = $true
            Message = "No non-hidden files found."
        }
    }

    $FilesSuccessfullyBackedUpInFolder = 0
    $FilesSkippedInFolder = 0
    $FilesFailedInFolder = 0
    $fileIndex = 0
    $totalFiles = $FilesOnDevice.Count

    foreach ($RemoteFileFullPath in $FilesOnDevice) {
        & $WaitIfPaused | Out-Null
        if (& $ShouldCancel) {
            return [PSCustomObject]@{
                SourceFolder = $SourceFolderOnDevice
                FilesBackedUp = $FilesSuccessfullyBackedUpInFolder
                FilesSkipped = $FilesSkippedInFolder
                FilesFailed = $FilesFailedInFolder
                Success = $false
                Message = "Cancelled."
                Cancelled = $true
            }
        }

        $fileIndex++
        $RemoteFileFullPathClean = $RemoteFileFullPath
        if ($AlreadyTransferredFiles.Contains($RemoteFileFullPathClean)) {
            $FilesSkippedInFolder++
            continue
        }

        $RelativePath = $RemoteFileFullPathClean.Substring($RemotePathForFind.Length).TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($RelativePath)) {
            $FilesFailedInFolder++
            continue
        }

        $LocalFileDestPath = Join-Path $LocalTargetFolderForThisSource $RelativePath
        $LocalFileDestDir = Split-Path -Path $LocalFileDestPath
        if (-not (Test-Path $LocalFileDestDir -PathType Container)) {
            try {
                New-Item -ItemType Directory -Path $LocalFileDestDir -Force -ErrorAction Stop | Out-Null
            } catch {
                $FilesFailedInFolder++
                continue
            }
        }

        if ($OnProgress) {
            & $OnProgress @{
                Type = "File"
                Folder = $SourceFolderLeafName
                File = Split-Path -Leaf $RelativePath
                FileIndex = $fileIndex
                FileTotal = $totalFiles
                BackupDir = $BaseBackupDir
            }
        }

        $adbPullOutput = adb -s $DeviceID pull "$RemoteFileFullPathClean" "$LocalFileDestPath" 2>&1
        if ($LASTEXITCODE -eq 0) {
            if ($AlreadyTransferredFiles.Add($RemoteFileFullPathClean)) {
                try {
                    Add-Content -Path $StateFilePath -Value $RemoteFileFullPathClean -Encoding UTF8
                } catch {
                    $FilesFailedInFolder++
                    continue
                }
            }
            $FilesSuccessfullyBackedUpInFolder++
        } else {
            $FilesFailedInFolder++
        }
    }

    return [PSCustomObject]@{
        SourceFolder = $SourceFolderOnDevice
        FilesBackedUp = $FilesSuccessfullyBackedUpInFolder
        FilesSkipped = $FilesSkippedInFolder
        FilesFailed = $FilesFailedInFolder
        Success = ($FilesFailedInFolder -eq 0)
    }
}

function Get-FolderSizeBytesOnDevice {
    param(
        [string]$DeviceID,
        [string]$FolderPathKey
    )
    $RemotePathForCalc = "/$FolderPathKey"
    $EscapedRemotePath = $RemotePathForCalc.Replace("'", "'\''")
    $AwkScript = "'{s = s + `$1} END {if (NR > 0 && s > 0) print s; else if (NR > 0 && s == 0) print 0; else if (NR == 0) print 0}'"
    $FindAndSumCommand = "find '$EscapedRemotePath' \( -type d -name '.*' -prune \) -o \( -type f `! -name '.*' -exec stat -c %s {} \; \) 2>/dev/null | awk $AwkScript"
    $findResult = Invoke-AdbShellFind -DeviceID $DeviceID -FindCommandString $FindAndSumCommand
    if ($findResult.ExitCode -eq 0 -and $findResult.Output.Trim() -match "^\d+$") {
        return [decimal]$findResult.Output.Trim()
    }
    return $null
}

function Get-LocalBackupSizeBytes {
    param([string]$Path)
    if (-not (Test-Path $Path -PathType Container)) { return [decimal]0 }
    $stats = Get-ChildItem $Path -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum -ErrorAction SilentlyContinue
    if ($stats.Count -gt 0) { return [decimal]$stats.Sum }
    return [decimal]0
}

function Normalize-DeviceFolderPath {
    param([string]$Path)
    $normalized = $Path.Trim().TrimStart('/').Replace('\', '/')
    if ([string]::IsNullOrWhiteSpace($normalized)) { return $null }
    if ($normalized -notmatch '^sdcard/') { $normalized = "sdcard/$normalized" }
    return $normalized
}

function Show-AndroidBackupForm {
    $form = New-Object System.Windows.Forms.Form
    $form.Text = "Android Backup"
    $form.Size = New-Object System.Drawing.Size(720, 750)
    $form.StartPosition = "CenterScreen"
    $form.FormBorderStyle = "FixedDialog"
    $form.MaximizeBox = $false
    $form.Font = New-Object System.Drawing.Font("Segoe UI", 9)
    $form.BackColor = [System.Drawing.Color]::FromArgb(250, 250, 252)

    $titleLabel = New-Object System.Windows.Forms.Label
    $titleLabel.Location = New-Object System.Drawing.Point(24, 16)
    $titleLabel.Size = New-Object System.Drawing.Size(660, 32)
    $titleLabel.Text = "Android Device Backup"
    $titleLabel.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 16)
    $titleLabel.ForeColor = [System.Drawing.Color]::FromArgb(30, 30, 30)

    $subtitleLabel = New-Object System.Windows.Forms.Label
    $subtitleLabel.Location = New-Object System.Drawing.Point(26, 48)
    $subtitleLabel.Size = New-Object System.Drawing.Size(660, 20)
    $subtitleLabel.Text = "Back up photos, videos, and documents from your phone to this PC."
    $subtitleLabel.ForeColor = [System.Drawing.Color]::FromArgb(90, 90, 90)

    $deviceGroup = New-Object System.Windows.Forms.GroupBox
    $deviceGroup.Location = New-Object System.Drawing.Point(24, 82)
    $deviceGroup.Size = New-Object System.Drawing.Size(660, 88)
    $deviceGroup.Text = " Device "

    $deviceCombo = New-Object System.Windows.Forms.ComboBox
    $deviceCombo.Location = New-Object System.Drawing.Point(16, 28)
    $deviceCombo.Size = New-Object System.Drawing.Size(480, 28)
    $deviceCombo.DropDownStyle = "DropDownList"
    $deviceCombo.DisplayMember = "DisplayName"

    $refreshButton = New-Object System.Windows.Forms.Button
    $refreshButton.Location = New-Object System.Drawing.Point(508, 26)
    $refreshButton.Size = New-Object System.Drawing.Size(130, 30)
    $refreshButton.Text = "Refresh"

    $deviceStatusLabel = New-Object System.Windows.Forms.Label
    $deviceStatusLabel.Location = New-Object System.Drawing.Point(16, 58)
    $deviceStatusLabel.Size = New-Object System.Drawing.Size(620, 20)
    $deviceStatusLabel.ForeColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
    $deviceStatusLabel.Text = "Connect your phone via USB and enable USB debugging."

    $settingsGroup = New-Object System.Windows.Forms.GroupBox
    $settingsGroup.Location = New-Object System.Drawing.Point(24, 178)
    $settingsGroup.Size = New-Object System.Drawing.Size(660, 96)
    $settingsGroup.Text = " Backup Location "

    $backupPathText = New-Object System.Windows.Forms.TextBox
    $backupPathText.Location = New-Object System.Drawing.Point(16, 28)
    $backupPathText.Size = New-Object System.Drawing.Size(480, 24)
    $backupPathText.Text = $Script:BackupBaseDir

    $browseBackupButton = New-Object System.Windows.Forms.Button
    $browseBackupButton.Location = New-Object System.Drawing.Point(508, 26)
    $browseBackupButton.Size = New-Object System.Drawing.Size(130, 28)
    $browseBackupButton.Text = "Browse..."

    $importSettingsButton = New-Object System.Windows.Forms.Button
    $importSettingsButton.Location = New-Object System.Drawing.Point(16, 58)
    $importSettingsButton.Size = New-Object System.Drawing.Size(100, 28)
    $importSettingsButton.Text = "Import..."

    $exportSettingsButton = New-Object System.Windows.Forms.Button
    $exportSettingsButton.Location = New-Object System.Drawing.Point(122, 58)
    $exportSettingsButton.Size = New-Object System.Drawing.Size(100, 28)
    $exportSettingsButton.Text = "Export..."

    $foldersGroup = New-Object System.Windows.Forms.GroupBox
    $foldersGroup.Location = New-Object System.Drawing.Point(24, 282)
    $foldersGroup.Size = New-Object System.Drawing.Size(660, 248)
    $foldersGroup.Text = " Folders to Back Up "

    $foldersHintLabel = New-Object System.Windows.Forms.Label
    $foldersHintLabel.Location = New-Object System.Drawing.Point(16, 22)
    $foldersHintLabel.Size = New-Object System.Drawing.Size(626, 18)
    $foldersHintLabel.Text = "Check the folders you want included in this backup."
    $foldersHintLabel.ForeColor = [System.Drawing.Color]::FromArgb(90, 90, 90)

    $foldersList = New-Object System.Windows.Forms.ListView
    $foldersList.Location = New-Object System.Drawing.Point(16, 42)
    $foldersList.Size = New-Object System.Drawing.Size(626, 96)
    $foldersList.View = "Details"
    $foldersList.FullRowSelect = $true
    $foldersList.GridLines = $true
    $foldersList.HeaderStyle = "Nonclickable"
    $foldersList.CheckBoxes = $true
    $foldersList.Columns.Add("Folder", 130) | Out-Null
    $foldersList.Columns.Add("Size", 80) | Out-Null
    $foldersList.Columns.Add("Status", 100) | Out-Null
    $foldersList.Columns.Add("Device Path", 290) | Out-Null

    $Script:FolderSizeCache = @{}

    function Add-FolderListItem {
        param(
            [string]$FolderPath,
            [string]$SizeText = "-",
            [decimal]$SizeBytes = -1
        )
        foreach ($existing in $foldersList.Items) {
            if ($existing.Tag -eq $FolderPath) { return $false }
        }
        $item = New-Object System.Windows.Forms.ListViewItem((Split-Path -Leaf $FolderPath))
        $item.SubItems.Add($SizeText) | Out-Null
        $item.SubItems.Add("Ready") | Out-Null
        $item.SubItems.Add($FolderPath) | Out-Null
        $item.Tag = $FolderPath
        $item.Checked = $true
        $foldersList.Items.Add($item) | Out-Null
        if ($SizeBytes -ge 0) {
            $Script:FolderSizeCache[$FolderPath] = $SizeBytes
        }
        return $true
    }

    function Clear-FolderList {
        $foldersList.Items.Clear()
        $Script:FolderSizeCache = @{}
    }

    function Load-FolderPathsIntoList {
        param([string[]]$FolderPaths)
        Clear-FolderList
        foreach ($folder in $FolderPaths) {
            Add-FolderListItem -FolderPath $folder | Out-Null
        }
    }

    foreach ($folder in $Script:BackupFolders) {
        Add-FolderListItem -FolderPath $folder | Out-Null
    }

    $selectAllButton = New-Object System.Windows.Forms.Button
    $selectAllButton.Location = New-Object System.Drawing.Point(16, 146)
    $selectAllButton.Size = New-Object System.Drawing.Size(90, 26)
    $selectAllButton.Text = "Select All"

    $clearAllButton = New-Object System.Windows.Forms.Button
    $clearAllButton.Location = New-Object System.Drawing.Point(112, 146)
    $clearAllButton.Size = New-Object System.Drawing.Size(90, 26)
    $clearAllButton.Text = "Clear All"

    $addFolderButton = New-Object System.Windows.Forms.Button
    $addFolderButton.Location = New-Object System.Drawing.Point(208, 146)
    $addFolderButton.Size = New-Object System.Drawing.Size(110, 26)
    $addFolderButton.Text = "Add Folder..."

    $removeFolderButton = New-Object System.Windows.Forms.Button
    $removeFolderButton.Location = New-Object System.Drawing.Point(324, 146)
    $removeFolderButton.Size = New-Object System.Drawing.Size(90, 26)
    $removeFolderButton.Text = "Remove"
    $removeFolderButton.Enabled = $false

    $scanDeviceButton = New-Object System.Windows.Forms.Button
    $scanDeviceButton.Location = New-Object System.Drawing.Point(16, 178)
    $scanDeviceButton.Size = New-Object System.Drawing.Size(120, 26)
    $scanDeviceButton.Text = "Scan Device..."

    $previewSizesButton = New-Object System.Windows.Forms.Button
    $previewSizesButton.Location = New-Object System.Drawing.Point(142, 178)
    $previewSizesButton.Size = New-Object System.Drawing.Size(120, 26)
    $previewSizesButton.Text = "Preview Sizes"

    $folderTotalLabel = New-Object System.Windows.Forms.Label
    $folderTotalLabel.Location = New-Object System.Drawing.Point(16, 208)
    $folderTotalLabel.Size = New-Object System.Drawing.Size(626, 20)
    $folderTotalLabel.ForeColor = [System.Drawing.Color]::FromArgb(90, 90, 90)
    $folderTotalLabel.Text = "Total (selected): not calculated"

    $progressGroup = New-Object System.Windows.Forms.GroupBox
    $progressGroup.Location = New-Object System.Drawing.Point(24, 540)
    $progressGroup.Size = New-Object System.Drawing.Size(660, 116)
    $progressGroup.Text = " Progress "

    $phaseLabel = New-Object System.Windows.Forms.Label
    $phaseLabel.Location = New-Object System.Drawing.Point(16, 24)
    $phaseLabel.Size = New-Object System.Drawing.Size(626, 20)
    $phaseLabel.Text = "Ready."

    $progressBar = New-Object System.Windows.Forms.ProgressBar
    $progressBar.Location = New-Object System.Drawing.Point(16, 48)
    $progressBar.Size = New-Object System.Drawing.Size(626, 22)
    $progressBar.Style = "Continuous"
    $progressBar.Minimum = 0
    $progressBar.Maximum = 1000
    $progressBar.Value = 0

    $progressDetailLabel = New-Object System.Windows.Forms.Label
    $progressDetailLabel.Location = New-Object System.Drawing.Point(16, 76)
    $progressDetailLabel.Size = New-Object System.Drawing.Size(626, 20)
    $progressDetailLabel.Text = "0.00 GB / Unknown"

    $etaLabel = New-Object System.Windows.Forms.Label
    $etaLabel.Location = New-Object System.Drawing.Point(16, 96)
    $etaLabel.Size = New-Object System.Drawing.Size(626, 20)
    $etaLabel.ForeColor = [System.Drawing.Color]::FromArgb(90, 90, 90)
    $etaLabel.Text = ""

    $logBox = New-Object System.Windows.Forms.TextBox
    $logBox.Location = New-Object System.Drawing.Point(24, 516)
    $logBox.Size = New-Object System.Drawing.Size(660, 0)
    $logBox.Multiline = $true
    $logBox.ReadOnly = $true
    $logBox.ScrollBars = "Vertical"
    $logBox.Visible = $false

    $startButton = New-Object System.Windows.Forms.Button
    $startButton.Location = New-Object System.Drawing.Point(24, 668)
    $startButton.Size = New-Object System.Drawing.Size(150, 36)
    $startButton.Text = "Start Backup"
    $startButton.BackColor = [System.Drawing.Color]::FromArgb(0, 103, 192)
    $startButton.ForeColor = [System.Drawing.Color]::White
    $startButton.FlatStyle = "Flat"
    $startButton.Font = New-Object System.Drawing.Font("Segoe UI Semibold", 9)

    $openFolderButton = New-Object System.Windows.Forms.Button
    $openFolderButton.Location = New-Object System.Drawing.Point(376, 668)
    $openFolderButton.Size = New-Object System.Drawing.Size(130, 36)
    $openFolderButton.Text = "Open Backup Folder"
    $openFolderButton.Enabled = $false

    $pauseButton = New-Object System.Windows.Forms.Button
    $pauseButton.Location = New-Object System.Drawing.Point(184, 668)
    $pauseButton.Size = New-Object System.Drawing.Size(90, 36)
    $pauseButton.Text = "Pause"
    $pauseButton.Enabled = $false

    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Location = New-Object System.Drawing.Point(280, 668)
    $cancelButton.Size = New-Object System.Drawing.Size(90, 36)
    $cancelButton.Text = "Cancel"
    $cancelButton.Enabled = $false

    $closeButton = New-Object System.Windows.Forms.Button
    $closeButton.Location = New-Object System.Drawing.Point(514, 668)
    $closeButton.Size = New-Object System.Drawing.Size(150, 36)
    $closeButton.Text = "Close"
    $form.CancelButton = $closeButton

    $deviceGroup.Controls.AddRange(@($deviceCombo, $refreshButton, $deviceStatusLabel))
    $settingsGroup.Controls.AddRange(@($backupPathText, $browseBackupButton, $importSettingsButton, $exportSettingsButton))
    $foldersGroup.Controls.AddRange(@($foldersHintLabel, $foldersList, $selectAllButton, $clearAllButton, $addFolderButton, $removeFolderButton, $scanDeviceButton, $previewSizesButton, $folderTotalLabel))
    $progressGroup.Controls.AddRange(@($phaseLabel, $progressBar, $progressDetailLabel, $etaLabel))
    $form.Controls.AddRange(@(
        $titleLabel, $subtitleLabel,
        $deviceGroup, $settingsGroup, $foldersGroup, $progressGroup,
        $startButton, $pauseButton, $cancelButton, $openFolderButton, $closeButton, $logBox
    ))

    $Script:CurrentBackupDir = $null
    $Script:EstimatedTotalGB = -1
    $Script:EstimatedTotalBytes = [decimal]0
    $Script:TransferStartTime = $null
    $Script:BackupRunning = $false

    function Add-LogLine {
        param([string]$Message)
        $timestamp = Get-Date -Format "HH:mm:ss"
        $logBox.AppendText("[$timestamp] $Message`r`n")
    }

    function Set-UiBusy {
        param([bool]$Busy)
        $startButton.Enabled = -not $Busy
        $pauseButton.Enabled = $Busy
        $cancelButton.Enabled = $Busy
        $refreshButton.Enabled = -not $Busy
        $deviceCombo.Enabled = -not $Busy
        $foldersList.Enabled = -not $Busy
        $backupPathText.Enabled = -not $Busy
        $browseBackupButton.Enabled = -not $Busy
        $selectAllButton.Enabled = -not $Busy
        $clearAllButton.Enabled = -not $Busy
        $addFolderButton.Enabled = -not $Busy
        $removeFolderButton.Enabled = (-not $Busy) -and ($foldersList.SelectedItems.Count -gt 0)
        $scanDeviceButton.Enabled = -not $Busy
        $previewSizesButton.Enabled = -not $Busy
        $importSettingsButton.Enabled = -not $Busy
        $exportSettingsButton.Enabled = -not $Busy
        if ($Busy) {
            $startButton.Text = "Backup Running..."
            $startButton.BackColor = [System.Drawing.Color]::FromArgb(120, 120, 120)
        } else {
            $startButton.Text = "Start Backup"
            $startButton.BackColor = [System.Drawing.Color]::FromArgb(0, 103, 192)
            $Script:PauseBackupRequested = $false
            $pauseButton.Text = "Pause"
        }
    }

    function Wait-IfBackupPaused {
        while ($Script:PauseBackupRequested -and -not $Script:CancelBackupRequested) {
            $phaseLabel.Text = "Paused. Click Resume to continue."
            $etaLabel.Text = "Paused"
            [System.Windows.Forms.Application]::DoEvents()
            Start-Sleep -Milliseconds 100
        }
    }

    function Test-BackupShouldStop {
        Wait-IfBackupPaused | Out-Null
        return [bool]$Script:CancelBackupRequested
    }

    function New-CancelledBackupResult {
        param(
            [string]$BackupDir,
            [int]$TotalNew = 0,
            [int]$TotalSkipped = 0,
            [int]$TotalFailed = 0,
            [array]$SkippedFolders = @()
        )
        $diskBytes = if ($BackupDir) { Get-LocalBackupSizeBytes -Path $BackupDir } else { [decimal]0 }
        $diskSizeText = Format-BytesHuman $diskBytes
        Update-BackupProgress @{
            Type = "Summary"
            Message = "Backup cancelled."
            Detail = "$TotalNew new files, $TotalSkipped skipped, $diskSizeText on disk before stop"
        }
        return @{
            Success = $false
            Cancelled = $true
            Message = "Backup cancelled."
            BackupDir = $BackupDir
            NewFiles = $TotalNew
            SkippedFiles = $TotalSkipped
            FailedFiles = $TotalFailed
            DiskBytes = $diskBytes
            SkippedFolders = $SkippedFolders
        }
    }

    function Get-SelectedFolderPaths {
        $selected = @()
        foreach ($item in $foldersList.Items) {
            if ($item.Checked) { $selected += [string]$item.Tag }
        }
        return ,$selected
    }
    function Update-FolderListItem {
        param(
            [string]$FolderPath,
            [string]$Status,
            [string]$Details
        )
        foreach ($item in $foldersList.Items) {
            if ($item.Tag -eq $FolderPath) {
                $item.SubItems[2].Text = $Status
                if ($Details) { $item.SubItems[3].Text = $Details }
                return
            }
        }
    }

    function Update-FolderListSize {
        param(
            [string]$FolderPath,
            [string]$SizeText,
            [decimal]$SizeBytes = -1
        )
        foreach ($item in $foldersList.Items) {
            if ($item.Tag -eq $FolderPath) {
                $item.SubItems[1].Text = $SizeText
                if ($SizeBytes -ge 0) {
                    $Script:FolderSizeCache[$FolderPath] = $SizeBytes
                } else {
                    $Script:FolderSizeCache.Remove($FolderPath) | Out-Null
                }
                return
            }
        }
    }

    function Update-SelectedFoldersTotalLabel {
        $totalBytes = [decimal]0
        $hasUnknown = $false
        $selectedCount = 0
        foreach ($item in $foldersList.Items) {
            if (-not $item.Checked) { continue }
            $selectedCount++
            $path = [string]$item.Tag
            if ($Script:FolderSizeCache.ContainsKey($path)) {
                $totalBytes += $Script:FolderSizeCache[$path]
            } else {
                $hasUnknown = $true
            }
        }
        if ($selectedCount -eq 0) {
            $folderTotalLabel.Text = "Total (selected): none selected"
        } elseif ($hasUnknown) {
            $folderTotalLabel.Text = "Total (selected): $(Format-BytesHuman $totalBytes)+ (some folders unknown)"
        } else {
            $folderTotalLabel.Text = "Total (selected): $(Format-BytesHuman $totalBytes)"
        }
        return $totalBytes
    }

    function Get-SelectedFoldersTotalBytes {
        $totalBytes = [decimal]0
        $hasUnknown = $false
        foreach ($item in $foldersList.Items) {
            if (-not $item.Checked) { continue }
            $path = [string]$item.Tag
            if ($Script:FolderSizeCache.ContainsKey($path)) {
                $totalBytes += $Script:FolderSizeCache[$path]
            } else {
                $hasUnknown = $true
            }
        }
        return @{
            TotalBytes = $totalBytes
            HasUnknown = $hasUnknown
        }
    }

    function Export-BackupSettingsFromUi {
        param([string]$FilePath)
        $folderPaths = @()
        foreach ($item in $foldersList.Items) {
            $folderPaths += [string]$item.Tag
        }
        $settings = @{
            BackupBaseDir = $backupPathText.Text.Trim()
            BackupFolders = $folderPaths
        }
        ($settings | ConvertTo-Json -Depth 4) | Set-Content -Path $FilePath -Encoding UTF8
    }

    function Import-BackupSettingsToUi {
        param([string]$FilePath)
        if (-not (Test-Path $FilePath)) {
            throw "Settings file not found: $FilePath"
        }
        $settings = Get-Content $FilePath -Raw -Encoding UTF8 | ConvertFrom-Json
        if ($settings.BackupBaseDir) {
            $backupPathText.Text = [string]$settings.BackupBaseDir
            $Script:BackupBaseDir = [string]$settings.BackupBaseDir
        }
        if ($settings.BackupFolders) {
            Load-FolderPathsIntoList -FolderPaths @($settings.BackupFolders | ForEach-Object { [string]$_ })
        }
        Update-SelectedFoldersTotalLabel | Out-Null
    }

    function Show-DeviceFolderBrowser {
        param([string]$DeviceID)
        $browseForm = New-Object System.Windows.Forms.Form
        $browseForm.Text = "Browse Device Folders"
        $browseForm.Size = New-Object System.Drawing.Size(560, 480)
        $browseForm.StartPosition = "CenterParent"
        $browseForm.Font = $form.Font

        $currentPath = "sdcard"
        $pathLabel = New-Object System.Windows.Forms.Label
        $pathLabel.Location = New-Object System.Drawing.Point(16, 16)
        $pathLabel.Size = New-Object System.Drawing.Size(520, 20)
        $pathLabel.Text = "Current: /$currentPath"

        $folderBrowseList = New-Object System.Windows.Forms.ListView
        $folderBrowseList.Location = New-Object System.Drawing.Point(16, 44)
        $folderBrowseList.Size = New-Object System.Drawing.Size(520, 330)
        $folderBrowseList.View = "Details"
        $folderBrowseList.FullRowSelect = $true
        $folderBrowseList.GridLines = $true
        $folderBrowseList.MultiSelect = $true
        $folderBrowseList.Columns.Add("Name", 180) | Out-Null
        $folderBrowseList.Columns.Add("Path", 320) | Out-Null

        $refreshBrowse = {
            $folderBrowseList.Items.Clear()
            $pathLabel.Text = "Current: /$script:currentBrowsePath"
            $subfolders = Get-DeviceSubfolders -DeviceID $DeviceID -DeviceFolderPath $script:currentBrowsePath
            foreach ($sub in $subfolders) {
                $name = Split-Path -Leaf $sub
                $item = New-Object System.Windows.Forms.ListViewItem($name)
                $item.SubItems.Add($sub) | Out-Null
                $item.Tag = $sub
                $folderBrowseList.Items.Add($item) | Out-Null
            }
            if ($folderBrowseList.Items.Count -eq 0) {
                $empty = New-Object System.Windows.Forms.ListViewItem("(No subfolders)")
                $empty.SubItems.Add("/$script:currentBrowsePath") | Out-Null
                $empty.Tag = $script:currentBrowsePath
                $folderBrowseList.Items.Add($empty) | Out-Null
            }
        }

        $script:currentBrowsePath = $currentPath
        & $refreshBrowse

        $upButton = New-Object System.Windows.Forms.Button
        $upButton.Location = New-Object System.Drawing.Point(16, 384)
        $upButton.Size = New-Object System.Drawing.Size(80, 30)
        $upButton.Text = "Up"
        $upButton.Add_Click({
            if ($script:currentBrowsePath -eq "sdcard") { return }
            $parent = Split-Path $script:currentBrowsePath -Parent
            if ([string]::IsNullOrWhiteSpace($parent)) { $script:currentBrowsePath = "sdcard" }
            else { $script:currentBrowsePath = $parent.Replace('\', '/') }
            & $refreshBrowse
        })

        $refreshBrowseButton = New-Object System.Windows.Forms.Button
        $refreshBrowseButton.Location = New-Object System.Drawing.Point(102, 384)
        $refreshBrowseButton.Size = New-Object System.Drawing.Size(80, 30)
        $refreshBrowseButton.Text = "Refresh"
        $refreshBrowseButton.Add_Click($refreshBrowse)

        $addCurrentButton = New-Object System.Windows.Forms.Button
        $addCurrentButton.Location = New-Object System.Drawing.Point(188, 384)
        $addCurrentButton.Size = New-Object System.Drawing.Size(120, 30)
        $addCurrentButton.Text = "Add Current"
        $addCurrentButton.Add_Click({
            if (Add-FolderListItem -FolderPath $script:currentBrowsePath) {
                Update-SelectedFoldersTotalLabel | Out-Null
            }
        })

        $addSelectedButton = New-Object System.Windows.Forms.Button
        $addSelectedButton.Location = New-Object System.Drawing.Point(314, 384)
        $addSelectedButton.Size = New-Object System.Drawing.Size(110, 30)
        $addSelectedButton.Text = "Add Selected"
        $addSelectedButton.Add_Click({
            foreach ($sel in @($folderBrowseList.SelectedItems)) {
                if ($sel.Text -eq "(No subfolders)") {
                    Add-FolderListItem -FolderPath $script:currentBrowsePath | Out-Null
                } else {
                    Add-FolderListItem -FolderPath ([string]$sel.Tag) | Out-Null
                }
            }
            Update-SelectedFoldersTotalLabel | Out-Null
        })

        $closeBrowseButton = New-Object System.Windows.Forms.Button
        $closeBrowseButton.Location = New-Object System.Drawing.Point(430, 384)
        $closeBrowseButton.Size = New-Object System.Drawing.Size(106, 30)
        $closeBrowseButton.Text = "Close"
        $closeBrowseButton.Add_Click({ $browseForm.Close() })
        $browseForm.CancelButton = $closeBrowseButton

        $folderBrowseList.Add_DoubleClick({
            if ($folderBrowseList.SelectedItems.Count -eq 0) { return }
            $sel = $folderBrowseList.SelectedItems[0]
            if ($sel.Text -eq "(No subfolders)") { return }
            $script:currentBrowsePath = [string]$sel.Tag
            & $refreshBrowse
        })

        $browseForm.Controls.AddRange(@($pathLabel, $folderBrowseList, $upButton, $refreshBrowseButton, $addCurrentButton, $addSelectedButton, $closeBrowseButton))
        [void]$browseForm.ShowDialog($form)
        $browseForm.Dispose()
    }

    function Invoke-FolderSizePreview {
        param([string]$DeviceID)
        $checkedItems = @($foldersList.Items | Where-Object { $_.Checked })
        if ($checkedItems.Count -eq 0) {
            [System.Windows.Forms.MessageBox]::Show(
                "Select at least one folder to preview sizes.",
                "Preview Sizes",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Information
            ) | Out-Null
            return
        }

        $previewSizesButton.Enabled = $false
        $scanDeviceButton.Enabled = $false
        try {
            $index = 0
            foreach ($item in $checkedItems) {
                $index++
                $path = [string]$item.Tag
                $folderTotalLabel.Text = "Calculating size $index / $($checkedItems.Count): $(Split-Path -Leaf $path)..."
                [System.Windows.Forms.Application]::DoEvents()

                $item.SubItems[2].Text = "Sizing..."
                $sizeBytes = Get-FolderSizeBytesOnDevice -DeviceID $DeviceID -FolderPathKey $path
                if ($null -ne $sizeBytes) {
                    Update-FolderListSize -FolderPath $path -SizeText (Format-BytesHuman $sizeBytes) -SizeBytes $sizeBytes
                    $item.SubItems[2].Text = "Ready"
                } else {
                    Update-FolderListSize -FolderPath $path -SizeText "Unknown" -SizeBytes -1
                    $item.SubItems[2].Text = "Ready"
                }
                [System.Windows.Forms.Application]::DoEvents()
            }
            Update-SelectedFoldersTotalLabel | Out-Null
        } finally {
            if (-not $Script:BackupRunning) {
                $previewSizesButton.Enabled = $true
                $scanDeviceButton.Enabled = $true
            }
        }
    }

    function Reset-FolderList {
        foreach ($item in $foldersList.Items) {
            if ($item.Checked) {
                $item.SubItems[2].Text = "Pending"
                $item.SubItems[3].Text = [string]$item.Tag
            } else {
                $item.SubItems[2].Text = "Skipped"
                $item.SubItems[3].Text = "Not selected"
            }
        }
    }

    $foldersList.Add_ItemChecked({
        if (-not $Script:BackupRunning) {
            Update-SelectedFoldersTotalLabel | Out-Null
        }
    })

    $foldersList.Add_SelectedIndexChanged({
        if (-not $Script:BackupRunning) {
            $removeFolderButton.Enabled = ($foldersList.SelectedItems.Count -gt 0)
        }
    })

    $selectAllButton.Add_Click({
        foreach ($item in $foldersList.Items) { $item.Checked = $true }
        Update-SelectedFoldersTotalLabel | Out-Null
    })

    $clearAllButton.Add_Click({
        foreach ($item in $foldersList.Items) { $item.Checked = $false }
        Update-SelectedFoldersTotalLabel | Out-Null
    })

    $addFolderButton.Add_Click({
        $promptForm = New-Object System.Windows.Forms.Form
        $promptForm.Text = "Add Folder"
        $promptForm.Size = New-Object System.Drawing.Size(460, 180)
        $promptForm.StartPosition = "CenterParent"
        $promptForm.FormBorderStyle = "FixedDialog"
        $promptForm.MaximizeBox = $false
        $promptForm.MinimizeBox = $false
        $promptForm.Font = $form.Font

        $promptLabel = New-Object System.Windows.Forms.Label
        $promptLabel.Location = New-Object System.Drawing.Point(16, 16)
        $promptLabel.Size = New-Object System.Drawing.Size(410, 40)
        $promptLabel.Text = "Enter the folder path on the device.`nExample: sdcard/Music  or  Music"

        $promptText = New-Object System.Windows.Forms.TextBox
        $promptText.Location = New-Object System.Drawing.Point(16, 62)
        $promptText.Size = New-Object System.Drawing.Size(410, 24)
        $promptText.Text = "sdcard/"

        $okButton = New-Object System.Windows.Forms.Button
        $okButton.Location = New-Object System.Drawing.Point(256, 100)
        $okButton.Size = New-Object System.Drawing.Size(80, 28)
        $okButton.Text = "Add"
        $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
        $promptForm.AcceptButton = $okButton

        $cancelButton = New-Object System.Windows.Forms.Button
        $cancelButton.Location = New-Object System.Drawing.Point(346, 100)
        $cancelButton.Size = New-Object System.Drawing.Size(80, 28)
        $cancelButton.Text = "Cancel"
        $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
        $promptForm.CancelButton = $cancelButton

        $promptForm.Controls.AddRange(@($promptLabel, $promptText, $okButton, $cancelButton))
        if ($promptForm.ShowDialog($form) -ne [System.Windows.Forms.DialogResult]::OK) {
            $promptForm.Dispose()
            return
        }

        $newPath = Normalize-DeviceFolderPath $promptText.Text
        $promptForm.Dispose()
        if (-not $newPath) { return }

        if (-not (Add-FolderListItem -FolderPath $newPath)) {
            [System.Windows.Forms.MessageBox]::Show(
                "That folder is already in the list.",
                "Duplicate Folder",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Information
            ) | Out-Null
        } else {
            Update-SelectedFoldersTotalLabel | Out-Null
        }
    })

    $removeFolderButton.Add_Click({
        if ($foldersList.SelectedItems.Count -eq 0) { return }
        $toRemove = @($foldersList.SelectedItems)
        foreach ($item in $toRemove) {
            $Script:FolderSizeCache.Remove([string]$item.Tag) | Out-Null
            $foldersList.Items.Remove($item) | Out-Null
        }
        $removeFolderButton.Enabled = $false
        Update-SelectedFoldersTotalLabel | Out-Null
    })

    $scanDeviceButton.Add_Click({
        if ($deviceCombo.SelectedItem -eq $null) {
            [System.Windows.Forms.MessageBox]::Show(
                "Connect a device and click Refresh first.",
                "No Device",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            ) | Out-Null
            return
        }
        Show-DeviceFolderBrowser -DeviceID ([string]$deviceCombo.SelectedItem.SerialNumber)
    })

    $previewSizesButton.Add_Click({
        if ($deviceCombo.SelectedItem -eq $null) {
            [System.Windows.Forms.MessageBox]::Show(
                "Connect a device and click Refresh first.",
                "No Device",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            ) | Out-Null
            return
        }
        Invoke-FolderSizePreview -DeviceID ([string]$deviceCombo.SelectedItem.SerialNumber)
    })

    $exportSettingsButton.Add_Click({
        $dialog = New-Object System.Windows.Forms.SaveFileDialog
        $dialog.Title = "Export backup settings"
        $dialog.Filter = "JSON settings (*.json)|*.json|All files (*.*)|*.*"
        $dialog.FileName = "backup_settings.json"
        $dialog.InitialDirectory = Get-ScriptDirectory
        if ($dialog.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
            try {
                Export-BackupSettingsFromUi -FilePath $dialog.FileName
                [System.Windows.Forms.MessageBox]::Show(
                    "Settings exported to:`n$($dialog.FileName)",
                    "Export Complete",
                    [System.Windows.Forms.MessageBoxButtons]::OK,
                    [System.Windows.Forms.MessageBoxIcon]::Information
                ) | Out-Null
            } catch {
                [System.Windows.Forms.MessageBox]::Show(
                    $_.Exception.Message,
                    "Export Failed",
                    [System.Windows.Forms.MessageBoxButtons]::OK,
                    [System.Windows.Forms.MessageBoxIcon]::Error
                ) | Out-Null
            }
        }
        $dialog.Dispose()
    })

    $importSettingsButton.Add_Click({
        $dialog = New-Object System.Windows.Forms.OpenFileDialog
        $dialog.Title = "Import backup settings"
        $dialog.Filter = "JSON settings (*.json)|*.json|All files (*.*)|*.*"
        $dialog.InitialDirectory = Get-ScriptDirectory
        if ($dialog.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
            try {
                Import-BackupSettingsToUi -FilePath $dialog.FileName
                [System.Windows.Forms.MessageBox]::Show(
                    "Settings imported from:`n$($dialog.FileName)",
                    "Import Complete",
                    [System.Windows.Forms.MessageBoxButtons]::OK,
                    [System.Windows.Forms.MessageBoxIcon]::Information
                ) | Out-Null
            } catch {
                [System.Windows.Forms.MessageBox]::Show(
                    $_.Exception.Message,
                    "Import Failed",
                    [System.Windows.Forms.MessageBoxButtons]::OK,
                    [System.Windows.Forms.MessageBoxIcon]::Error
                ) | Out-Null
            }
        }
        $dialog.Dispose()
    })

    function Get-BackupDestinationPath {
        $path = $backupPathText.Text.Trim()
        if ([string]::IsNullOrWhiteSpace($path)) { return $null }
        try {
            return [System.IO.Path]::GetFullPath($path)
        } catch {
            return $null
        }
    }

    $browseBackupButton.Add_Click({
        $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
        $dialog.Description = "Choose where backups should be saved on this PC"
        $dialog.UseDescriptionForTitle = $true
        $currentPath = Get-BackupDestinationPath
        if ($currentPath -and (Test-Path $currentPath -PathType Container)) {
            $dialog.SelectedPath = $currentPath
        } elseif ($currentPath) {
            $parent = Split-Path $currentPath -Parent
            if ($parent -and (Test-Path $parent -PathType Container)) {
                $dialog.SelectedPath = $parent
            }
        }
        if ($dialog.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
            $backupPathText.Text = $dialog.SelectedPath
        }
        $dialog.Dispose()
    })

    $refreshDevices = {
        $deviceCombo.Items.Clear()
        $devices = Get-ConnectedDevices
        if ($devices.Count -eq 0) {
            $deviceStatusLabel.Text = "No device found. Check USB cable, debugging authorization, and tap Allow on the phone."
            $deviceStatusLabel.ForeColor = [System.Drawing.Color]::FromArgb(180, 60, 40)
            return
        }
        foreach ($device in $devices) {
            $deviceCombo.Items.Add($device) | Out-Null
        }
        $deviceCombo.SelectedIndex = 0
        $deviceStatusLabel.Text = if ($devices.Count -gt 1) {
            "$($devices.Count) devices found. Select the one to back up."
        } else {
            "Device ready for backup."
        }
        $deviceStatusLabel.ForeColor = [System.Drawing.Color]::FromArgb(40, 120, 60)
    }

    $refreshButton.Add_Click($refreshDevices)

    function Update-BackupProgress {
        param($Data)
        try {
            switch ($Data.Type) {
                "Phase" {
                    $phaseLabel.Text = $Data.Message
                    if ($Data.Message -notlike "*Backing up folder*") {
                        $etaLabel.Text = ""
                    }
                }
                "Size" {
                    $Script:EstimatedTotalGB = [double]$Data.TotalGB
                    $Script:EstimatedTotalBytes = [decimal]($Script:EstimatedTotalGB * 1GB)
                    $progressBar.Style = 'Continuous'
                    $progressBar.Maximum = 1000
                    $progressBar.Value = 0
                    $progressDetailLabel.Text = "Estimated total: $($Script:EstimatedTotalGB.ToString('N2')) GB"
                    $etaLabel.Text = "Estimating time remaining..."
                }
                "FolderStart" {
                    Update-FolderListItem -FolderPath $Data.FolderPath -Status "Backing up..." -Details $Data.Message
                    $phaseLabel.Text = "Backing up folder $($Data.Index) of $($Data.Total): $(Split-Path -Leaf $Data.FolderPath)"
                    if ($Data.Index -eq 1) {
                        $Script:TransferStartTime = $null
                        $etaLabel.Text = "Estimating time remaining..."
                    }
                }
                "FolderDone" {
                    $details = "$($Data.New) new, $($Data.Skipped) skipped"
                    if ($Data.Failed -gt 0) { $details += ", $($Data.Failed) failed" }
                    Update-FolderListItem -FolderPath $Data.FolderPath -Status $(if ($Data.Success) { "Done" } else { "Issues" }) -Details $details
                }
                "FolderStatus" {
                    Update-FolderListItem -FolderPath $Data.FolderPath -Status $Data.Status -Details $Data.Details
                }
                "File" {
                    $phaseLabel.Text = "Folder '$($Data.Folder)': file $($Data.FileIndex) / $($Data.FileTotal)"
                    if (-not $Script:TransferStartTime) {
                        $Script:TransferStartTime = Get-Date
                    }
                    $currentBytes = Get-LocalBackupSizeBytes -Path $Data.BackupDir
                    $currentGB = $currentBytes / 1GB
                    if ($Script:EstimatedTotalGB -gt 0) {
                        $percent = [Math]::Max(0, [Math]::Min(1, ($currentGB / $Script:EstimatedTotalGB)))
                        $progressBar.Style = 'Continuous'
                        $progressBar.Value = [Math]::Min($progressBar.Maximum, [int]($percent * $progressBar.Maximum))
                        $progressDetailLabel.Text = "{0:N2} GB / {1:N2} GB ({2:P0})" -f $currentGB, $Script:EstimatedTotalGB, $percent
                    } else {
                        $progressBar.Style = 'Marquee'
                        $progressDetailLabel.Text = "Transferred: $($currentGB.ToString('N2')) GB"
                    }
                    $etaLabel.Text = Get-BackupEtaText -CurrentBytes $currentBytes -TotalBytes $Script:EstimatedTotalBytes -StartTime $Script:TransferStartTime
                }
                "Summary" {
                    $phaseLabel.Text = $Data.Message
                    $progressDetailLabel.Text = $Data.Detail
                    $etaLabel.Text = "Complete"
                    if ($Script:EstimatedTotalGB -gt 0) {
                        $progressBar.Style = 'Continuous'
                        $progressBar.Value = $progressBar.Maximum
                    }
                }
                "Log" {
                    Add-LogLine $Data.Message
                }
            }
            [System.Windows.Forms.Application]::DoEvents()
        } catch {
            $phaseLabel.Text = "Display update error: $($_.Exception.Message)"
        }
    }

    function Show-BackupResult {
        param($Result)
        if ($Result.BackupDir -and (Test-Path $Result.BackupDir)) {
            $openFolderButton.Enabled = $true
            $Script:CurrentBackupDir = $Result.BackupDir
        }

        $phaseLabel.Text = $Result.Message
        $diskText = if ($Result.DiskBytes -gt 0) { Format-BytesHuman $Result.DiskBytes } else { "0 B" }

        $icon = if ($Result.Success) {
            [System.Windows.Forms.MessageBoxIcon]::Information
        } elseif ($Result.Cancelled) {
            [System.Windows.Forms.MessageBoxIcon]::Information
        } elseif ($Result.Message -like "Backup failed:*") {
            [System.Windows.Forms.MessageBoxIcon]::Error
        } else {
            [System.Windows.Forms.MessageBoxIcon]::Warning
        }

        $body = @(
            $Result.Message,
            "",
            "New files: $($Result.NewFiles)",
            "Skipped: $($Result.SkippedFiles)",
            "Failed: $($Result.FailedFiles)",
            "On disk: $diskText"
        )
        if ($Result.BackupDir) {
            $body += ""
            $body += "Location:"
            $body += $Result.BackupDir
        }

        [System.Windows.Forms.MessageBox]::Show(
            ($body -join [Environment]::NewLine),
            $(if ($Result.Success) { "Backup Summary" } elseif ($Result.Cancelled) { "Backup Cancelled" } elseif ($Result.Message -like "Backup failed:*") { "Backup Failed" } else { "Backup Summary" }),
            [System.Windows.Forms.MessageBoxButtons]::OK,
            $icon
        ) | Out-Null

        $toastTitle = if ($Result.Success) { "Backup completed" } elseif ($Result.Cancelled) { "Backup cancelled" } elseif ($Result.Message -like "Backup failed:*") { "Backup failed" } else { "Backup finished" }
        Show-BackupToast -Title $toastTitle -Message $Result.Message
    }

    function Invoke-BackupRun {
        param(
            [string]$DeviceSerial,
            [string]$DeviceModel,
            [string[]]$SelectedFolders,
            [string[]]$UncheckedFolders,
            [string]$BackupBaseDir
        )

        if ([string]::IsNullOrWhiteSpace($DeviceSerial)) {
            throw "No device was selected for backup."
        }
        if ([string]::IsNullOrWhiteSpace($DeviceModel)) {
            $DeviceModel = $DeviceSerial
        }
        if ([string]::IsNullOrWhiteSpace($BackupBaseDir)) {
            throw "Backup destination folder is empty."
        }
        if ($SelectedFolders.Count -eq 0) {
            throw "No folders were selected for backup."
        }

        $DeviceID = $DeviceSerial
        $SanitizedDeviceModel = $DeviceModel -replace '[^a-zA-Z0-9_-]', '_'
        $BackupDir = Join-Path $BackupBaseDir "$($SanitizedDeviceModel)_$($DeviceID)"
        $Script:CurrentBackupDir = $BackupDir

        Update-BackupProgress @{ Type = "Phase"; Message = "Preparing backup folders..." }

        if (-not (Test-Path $BackupBaseDir -PathType Container)) {
            New-Item -ItemType Directory -Path $BackupBaseDir -Force -ErrorAction Stop | Out-Null
        }
        if (-not (Test-Path $BackupDir -PathType Container)) {
            New-Item -ItemType Directory -Path $BackupDir -Force -ErrorAction Stop | Out-Null
        }

        $StateFilePath = Join-Path $BackupDir $Script:StateFileName
        $AlreadyTransferredFiles = New-Object System.Collections.Generic.HashSet[string]([System.StringComparer]::OrdinalIgnoreCase)
        $SessionWasMarkedComplete = $false

        if (Test-Path $StateFilePath) {
            $FileContents = Get-Content $StateFilePath -Encoding UTF8
            $FileContentsWithoutMarker = $FileContents | Where-Object { $_.Trim() -ne $Script:CompletionMarker }
            foreach ($line in $FileContentsWithoutMarker) {
                if (-not [string]::IsNullOrWhiteSpace($line)) {
                    $AlreadyTransferredFiles.Add($line.Trim()) | Out-Null
                }
            }
            if ($FileContents | Where-Object { $_.Trim() -eq $Script:CompletionMarker }) {
                $SessionWasMarkedComplete = $true
            }
            Update-BackupProgress @{
                Type = "Log"
                Message = "Loaded $($AlreadyTransferredFiles.Count) previously transferred file(s)."
            }
        }

        $FoldersToAttempt = @()
        $SkippedFolders = @()
        foreach ($SourceFolder in $SelectedFolders) {
            if (Test-BackupShouldStop) {
                return (New-CancelledBackupResult -BackupDir $BackupDir -SkippedFolders $SkippedFolders)
            }

            $FolderName = Split-Path -Leaf $SourceFolder
            if ($FolderName.StartsWith(".")) {
                $SkippedFolders += "$SourceFolder (Hidden)"
                Update-BackupProgress @{ Type = "FolderStatus"; FolderPath = $SourceFolder; Status = "Skipped"; Details = "Hidden folder" }
                continue
            }

            $RemotePath = "/$SourceFolder/"
            $CheckOutput = adb -s $DeviceID shell "ls -d '$RemotePath'" 2>&1
            if ($LASTEXITCODE -eq 0) {
                $FoldersToAttempt += $SourceFolder
                Update-BackupProgress @{ Type = "FolderStatus"; FolderPath = $SourceFolder; Status = "Ready"; Details = "Found on device" }
            } elseif ($CheckOutput -match "No such file or directory|does not exist") {
                $SkippedFolders += "$SourceFolder (Not Found)"
                Update-BackupProgress @{ Type = "FolderStatus"; FolderPath = $SourceFolder; Status = "Skipped"; Details = "Not found on device" }
            } else {
                $SkippedFolders += "$SourceFolder (Error)"
                Update-BackupProgress @{ Type = "FolderStatus"; FolderPath = $SourceFolder; Status = "Skipped"; Details = "Could not verify" }
            }
        }

        foreach ($uncheckedFolder in $UncheckedFolders) {
            Update-BackupProgress @{
                Type = "FolderStatus"
                FolderPath = $uncheckedFolder
                Status = "Skipped"
                Details = "Not selected"
            }
        }

        if ($FoldersToAttempt.Count -eq 0) {
            return @{
                Success = $false
                Message = "No selected folders were found on the device."
                BackupDir = $BackupDir
                NewFiles = 0
                SkippedFiles = 0
                FailedFiles = 0
                DiskBytes = 0
            }
        }

        Update-BackupProgress @{ Type = "Phase"; Message = "Calculating backup size (this may take a while)..." }
        $totalSizeBytes = [decimal]0
        $sizeCalcOk = $true
        foreach ($folderPathKey in $FoldersToAttempt) {
            if (Test-BackupShouldStop) {
                return (New-CancelledBackupResult -BackupDir $BackupDir -SkippedFolders $SkippedFolders)
            }
            $folderSize = Get-FolderSizeBytesOnDevice -DeviceID $DeviceID -FolderPathKey $folderPathKey
            if ($null -ne $folderSize) {
                $totalSizeBytes += $folderSize
            } else {
                $sizeCalcOk = $false
            }
            [System.Windows.Forms.Application]::DoEvents()
        }

        if ($totalSizeBytes -gt 0) {
            $Script:EstimatedTotalGB = $totalSizeBytes / 1GB
            Update-BackupProgress @{ Type = "Size"; TotalGB = $Script:EstimatedTotalGB }
        } elseif (-not $sizeCalcOk) {
            $Script:EstimatedTotalGB = -1
            Update-BackupProgress @{
                Type = "Log"
                Message = "Could not calculate total size. Progress will show transferred amount only."
            }
        }

        if ($SessionWasMarkedComplete) {
            try {
                $tempContent = Get-Content $StateFilePath -Encoding UTF8 | Where-Object { $_.Trim() -ne $Script:CompletionMarker }
                Set-Content -Path $StateFilePath -Value $tempContent -Encoding UTF8 -Force
            } catch { }
        }

        $OverallSuccess = $true
        $TotalNew = 0
        $TotalSkipped = 0
        $TotalFailed = 0
        $folderIndex = 0
        $onProgress = { param($Data) Update-BackupProgress $Data }
        $shouldCancel = { [bool]$Script:CancelBackupRequested }
        $waitIfPaused = { Wait-IfBackupPaused | Out-Null }

        foreach ($SourceFolderOnDevice in $FoldersToAttempt) {
            if (Test-BackupShouldStop) {
                return (New-CancelledBackupResult -BackupDir $BackupDir -TotalNew $TotalNew -TotalSkipped $TotalSkipped -TotalFailed $TotalFailed -SkippedFolders $SkippedFolders)
            }

            $folderIndex++
            Update-BackupProgress @{
                Type = "FolderStart"
                FolderPath = $SourceFolderOnDevice
                Index = $folderIndex
                Total = $FoldersToAttempt.Count
                Message = "Starting transfer"
            }

            $result = Backup-FolderContents `
                -DeviceID $DeviceID `
                -SourceFolderOnDevice $SourceFolderOnDevice `
                -BaseBackupDir $BackupDir `
                -AlreadyTransferredFiles $AlreadyTransferredFiles `
                -StateFilePath $StateFilePath `
                -OnProgress $onProgress `
                -ShouldCancel $shouldCancel `
                -WaitIfPaused $waitIfPaused

            if ($result.Cancelled) {
                $TotalNew += $result.FilesBackedUp
                $TotalSkipped += $result.FilesSkipped
                $TotalFailed += $result.FilesFailed
                Update-BackupProgress @{
                    Type = "FolderDone"
                    FolderPath = $SourceFolderOnDevice
                    New = $result.FilesBackedUp
                    Skipped = $result.FilesSkipped
                    Failed = $result.FilesFailed
                    Success = $false
                }
                return (New-CancelledBackupResult -BackupDir $BackupDir -TotalNew $TotalNew -TotalSkipped $TotalSkipped -TotalFailed $TotalFailed -SkippedFolders $SkippedFolders)
            }

            $TotalNew += $result.FilesBackedUp
            $TotalSkipped += $result.FilesSkipped
            $TotalFailed += $result.FilesFailed
            if (-not $result.Success -and $result.Message -notlike "No non-hidden files found*") {
                $OverallSuccess = $false
            }

            Update-BackupProgress @{
                Type = "FolderDone"
                FolderPath = $SourceFolderOnDevice
                New = $result.FilesBackedUp
                Skipped = $result.FilesSkipped
                Failed = $result.FilesFailed
                Success = $result.Success
            }
        }

        if ($OverallSuccess -and $TotalFailed -eq 0 -and $folderIndex -eq $FoldersToAttempt.Count) {
            try {
                Add-Content -Path $StateFilePath -Value $Script:CompletionMarker -Encoding UTF8
            } catch { }
        }

        $diskBytes = Get-LocalBackupSizeBytes -Path $BackupDir
        $diskSizeText = Format-BytesHuman $diskBytes
        $summaryMessage = if ($OverallSuccess -and $TotalFailed -eq 0) {
            "Backup completed successfully."
        } elseif ($TotalFailed -gt 0) {
            "Backup finished with $TotalFailed file error(s)."
        } else {
            "Backup finished with warnings."
        }

        Update-BackupProgress @{
            Type = "Summary"
            Message = $summaryMessage
            Detail = "$TotalNew new files, $TotalSkipped skipped, $diskSizeText on disk"
        }

        return @{
            Success = ($OverallSuccess -and $TotalFailed -eq 0)
            Message = $summaryMessage
            BackupDir = $BackupDir
            NewFiles = $TotalNew
            SkippedFiles = $TotalSkipped
            FailedFiles = $TotalFailed
            DiskBytes = $diskBytes
            SkippedFolders = $SkippedFolders
        }
    }
    $startButton.Add_Click({
        if ($deviceCombo.SelectedItem -eq $null) {
            [System.Windows.Forms.MessageBox]::Show(
                "Connect a device and click Refresh before starting the backup.",
                "No Device",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            ) | Out-Null
            return
        }

        $selectedFolders = Get-SelectedFolderPaths
        if ($selectedFolders.Count -eq 0) {
            [System.Windows.Forms.MessageBox]::Show(
                "Select at least one folder to back up.",
                "No Folders Selected",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            ) | Out-Null
            return
        }

        $backupDestination = Get-BackupDestinationPath
        if (-not $backupDestination) {
            [System.Windows.Forms.MessageBox]::Show(
                "Enter a valid backup destination folder, or use Browse to choose one.",
                "Invalid Backup Location",
                [System.Windows.Forms.MessageBoxButtons]::OK,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            ) | Out-Null
            return
        }
        $backupPathText.Text = $backupDestination
        $Script:BackupBaseDir = $backupDestination

        $sizeInfo = Get-SelectedFoldersTotalBytes
        if ($sizeInfo.HasUnknown) {
            $previewAnswer = [System.Windows.Forms.MessageBox]::Show(
                "Folder sizes have not been previewed yet.`n`nPreview sizes now to verify disk space before backup?",
                "Preview Sizes",
                [System.Windows.Forms.MessageBoxButtons]::YesNoCancel,
                [System.Windows.Forms.MessageBoxIcon]::Question
            )
            if ($previewAnswer -eq [System.Windows.Forms.DialogResult]::Cancel) { return }
            if ($previewAnswer -eq [System.Windows.Forms.DialogResult]::Yes) {
                Invoke-FolderSizePreview -DeviceID ([string]$deviceCombo.SelectedItem.SerialNumber)
                $sizeInfo = Get-SelectedFoldersTotalBytes
            }
        }

        if (-not $sizeInfo.HasUnknown -and $sizeInfo.TotalBytes -gt 0) {
            $diskCheck = Test-BackupDiskSpace -DestinationPath $backupDestination -RequiredBytes $sizeInfo.TotalBytes
            if (-not $diskCheck.Ok) {
                $spaceAnswer = [System.Windows.Forms.MessageBox]::Show(
                    @(
                        "Not enough free space on the backup drive.",
                        "",
                        "Required (incl. 5% buffer): $(Format-BytesHuman $diskCheck.RequiredWithBuffer)",
                        "Available: $(Format-BytesHuman $diskCheck.FreeBytes)",
                        "",
                        "Continue anyway?"
                    ) -join [Environment]::NewLine,
                    "Low Disk Space",
                    [System.Windows.Forms.MessageBoxButtons]::YesNo,
                    [System.Windows.Forms.MessageBoxIcon]::Warning
                )
                if ($spaceAnswer -ne [System.Windows.Forms.DialogResult]::Yes) { return }
            }
        }

        $uncheckedFolders = @()
        foreach ($item in $foldersList.Items) {
            if (-not $item.Checked) { $uncheckedFolders += [string]$item.Tag }
        }

        $folderSummary = ($selectedFolders | ForEach-Object { "  • $(Split-Path -Leaf $_)" }) -join [Environment]::NewLine
        $totalLine = ""
        if (-not $sizeInfo.HasUnknown -and $sizeInfo.TotalBytes -gt 0) {
            $totalLine = "`nEstimated size: $(Format-BytesHuman $sizeInfo.TotalBytes)"
        }
        $confirm = [System.Windows.Forms.MessageBox]::Show(
            "Start backup for '$($deviceCombo.SelectedItem.Model)'?`n`nSave to:`n  $backupDestination`n`nFolders ($($selectedFolders.Count)):`n$folderSummary$totalLine`n`nExisting files are skipped automatically (resume supported).",
            "Confirm Backup",
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Question
        )
        if ($confirm -ne [System.Windows.Forms.DialogResult]::Yes) { return }

        Reset-FolderList
        $progressBar.Style = "Continuous"
        $progressBar.Value = 0
        $Script:EstimatedTotalGB = -1
        $Script:EstimatedTotalBytes = [decimal]0
        $Script:TransferStartTime = $null
        $Script:CancelBackupRequested = $false
        $Script:PauseBackupRequested = $false
        $pauseButton.Text = "Pause"
        $phaseLabel.Text = "Starting..."
        $progressDetailLabel.Text = "Preparing..."
        $etaLabel.Text = ""
        $Script:BackupRunning = $true
        Set-UiBusy -Busy $true

        try {
            $result = Invoke-BackupRun `
                -DeviceSerial ([string]$deviceCombo.SelectedItem.SerialNumber) `
                -DeviceModel ([string]$deviceCombo.SelectedItem.Model) `
                -SelectedFolders $selectedFolders `
                -UncheckedFolders $uncheckedFolders `
                -BackupBaseDir $backupDestination
            Show-BackupResult $result
        } catch {
            $errorResult = @{
                Success = $false
                Message = "Backup failed: $($_.Exception.Message)"
                BackupDir = $Script:CurrentBackupDir
                NewFiles = 0
                SkippedFiles = 0
                FailedFiles = 0
                DiskBytes = 0
            }
            $phaseLabel.Text = $errorResult.Message
            $progressDetailLabel.Text = "Backup did not complete."
            $etaLabel.Text = ""
            Show-BackupResult $errorResult
        } finally {
            $Script:BackupRunning = $false
            Set-UiBusy -Busy $false
        }
    })

    $pauseButton.Add_Click({
        if (-not $Script:BackupRunning) { return }
        $Script:PauseBackupRequested = -not $Script:PauseBackupRequested
        if ($Script:PauseBackupRequested) {
            $pauseButton.Text = "Resume"
        } else {
            $pauseButton.Text = "Pause"
            if ($Script:CancelBackupRequested) { return }
            if ($phaseLabel.Text -like "Paused*") {
                $phaseLabel.Text = "Resuming backup..."
            }
        }
    })

    $cancelButton.Add_Click({
        if (-not $Script:BackupRunning) { return }
        $answer = [System.Windows.Forms.MessageBox]::Show(
            "Stop the backup now?`n`nFiles already copied are kept. You can resume later by running backup again.",
            "Cancel Backup",
            [System.Windows.Forms.MessageBoxButtons]::YesNo,
            [System.Windows.Forms.MessageBoxIcon]::Question
        )
        if ($answer -eq [System.Windows.Forms.DialogResult]::Yes) {
            $Script:CancelBackupRequested = $true
            $Script:PauseBackupRequested = $false
            $pauseButton.Text = "Pause"
            $phaseLabel.Text = "Cancelling after current step..."
            $etaLabel.Text = "Stopping..."
        }
    })

    $openFolderButton.Add_Click({
        $path = $Script:CurrentBackupDir
        if ($path -and (Test-Path $path)) {
            Start-Process "explorer.exe" $path
        }
    })

    $closeButton.Add_Click({ $form.Close() })

    $form.Add_FormClosing({
        if ($Script:BackupRunning) {
            $answer = [System.Windows.Forms.MessageBox]::Show(
                "A backup is still running. Cancel it and close?",
                "Backup Running",
                [System.Windows.Forms.MessageBoxButtons]::YesNo,
                [System.Windows.Forms.MessageBoxIcon]::Warning
            )
            if ($answer -eq [System.Windows.Forms.DialogResult]::Yes) {
                $Script:CancelBackupRequested = $true
                $Script:PauseBackupRequested = $false
            } else {
                $_.Cancel = $true
            }
        }
    })

    & $refreshDevices

    $defaultSettingsPath = Get-BackupSettingsPath
    if (Test-Path $defaultSettingsPath) {
        try {
            Import-BackupSettingsToUi -FilePath $defaultSettingsPath
        } catch { }
    } else {
        Update-SelectedFoldersTotalLabel | Out-Null
    }

    [void]$form.ShowDialog()
    $form.Dispose()
}

# --- Entry ---
if ([System.Threading.Thread]::CurrentThread.GetApartmentState() -ne 'STA') {
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = (Get-Process -Id $PID).Path
    $psi.Arguments = "-STA -NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    $psi.UseShellExecute = $false
    $proc = [System.Diagnostics.Process]::Start($psi)
    $proc.WaitForExit()
    exit $proc.ExitCode
}

[ConsoleWindow]::Hide()

if (-not (Check-ADB)) { exit 1 }

[System.Windows.Forms.Application]::EnableVisualStyles()
Show-AndroidBackupForm

exit 0

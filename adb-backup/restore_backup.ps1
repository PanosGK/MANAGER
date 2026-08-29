# Script to RESTORE specified folders from a PC backup to an Android device using ADB
# Run this script in Windows PowerShell

# --- Configuration ---
$RestoreSourceBaseDir = "F:\SMARTPHONES\ADB_SCRIPT" # Base directory WHERE backups are STORED
$DeviceTargetBasePath = "sdcard" # Base path on the Android device to restore TO (e.g., "sdcard", "storage/emulated/0")
# --- Specify the folder NAMES to restore below. These are subfolders within a chosen backup instance. ---
$FoldersToRestoreNames = @(
    "DCIM",
    "Pictures",
    "Movies",
    "Viber",
    "Download",
    "Documents",
    "whatsapp"
)

# --- Functions ---

function ConvertBytesToHumanReadable {
    param([long]$bytes)
    $suffix = @("B", "KB", "MB", "GB", "TB", "PB")
    if ($bytes -eq 0) { return "0 B" }
    $i = 0
    $adjustedBytes = $bytes
    while ($adjustedBytes -ge 1024 -and $i -lt ($suffix.Length - 1) ) {
        $adjustedBytes /= 1024
        $i++
    }
    return "{0:N2} {1}" -f $adjustedBytes, $suffix[$i]
}

function Check-ADB {
    if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
        Write-Host -ForegroundColor Yellow "ADB not found. Attempting to run installer..."
        $ScriptPath = Split-Path -parent $MyInvocation.MyCommand.Definition; $InstallerPath = Join-Path $ScriptPath "Latest-ADB-Installer.bat"
        if (Test-Path $InstallerPath) {
            try { Write-Host "Running ADB Installer (requires elevation)..." -ForegroundColor Cyan; Start-Process -FilePath $InstallerPath -Wait -Verb RunAs
                if ($LASTEXITCODE -eq 0) { Write-Host -ForegroundColor Green "ADB install complete. Restart script required."; Start-Sleep -Seconds 5; exit 0 }
                else { Write-Host -ForegroundColor Red "ADB Installer Error Code: $($LASTEXITCODE). Check PATH."; Start-Sleep -Seconds 5; exit 1 }
            } catch { Write-Host -ForegroundColor Red "Failed to run ADB installer: $($_.Exception.Message)"; Start-Sleep -Seconds 5; exit 1 }
        } else { Write-Host -ForegroundColor Red "ADB Installer not found: 'Latest-ADB-Installer.bat'"; Start-Sleep -Seconds 5; exit 1 }
    }
}

function Get-ConnectedDevice {
    $DevicesOutput = adb devices | Out-String; $ConnectedDevices = @()
    foreach ($line in ($DevicesOutput -split "`n")) { if ($line -match "^([a-zA-Z0-9]+)\s+device.*$") { $DeviceSerial = $Matches[1]; try { $DeviceModel = (adb -s $DeviceSerial shell getprop ro.product.model).Trim(); if (-not $DeviceModel) { $DeviceModel = $DeviceSerial } } catch { $DeviceModel = $DeviceSerial }; $ConnectedDevices += @{ SerialNumber = $DeviceSerial; Model = $DeviceModel } } }
    if ($ConnectedDevices.Count -gt 0) { return , $ConnectedDevices }
    else { Write-Host -ForegroundColor Red "Error: No Android device found or authorized. Check connection and USB debugging."; return $null }
}

function Restore-Files {
    param(
        [string]$DeviceID,
        [string]$SourcePathOnPC,
        [string]$DeviceTargetBasePath
    )
    $SourceFolderName = Split-Path -Leaf $SourcePathOnPC
    $DeviceTargetFolder = "$DeviceTargetBasePath/$SourceFolderName/"
    $AdbSourcePath = "$($SourcePathOnPC.TrimEnd('\').TrimEnd('/'))/."

    $adbOutput = adb -s $DeviceID push "$AdbSourcePath" "/$DeviceTargetFolder" 2>&1

    if ($LASTEXITCODE -eq 0) {
        return $true
    } else {
        $errorMessage = $adbOutput -join "`n"
        # These errors will appear directly after the "Status: FAILED." line from the main loop.
        # Add a slight indent to distinguish them as details of the failure.
        $errorMessage.Split("`n") | ForEach-Object { Write-Host -ForegroundColor Red "    $_" }
        return $false
    }
}

function Update-ProgressFile {
    param(
        [string]$FilePath,
        [hashtable]$ProgressData
    )
    try {
        $ProgressDataJson = $ProgressData | ConvertTo-Json -Depth 3 -Compress
        Set-Content -Path $FilePath -Value $ProgressDataJson -Encoding UTF8 -ErrorAction Stop
    } catch {
        Write-Warning "Could not update progress file: $FilePath. Error: $($_.Exception.Message)"
    }
}

# --- Main Script ---
$SectionSeparator = ("-" * 70) # Define a standard separator width
Check-ADB
$uiJob = $null
$ProgressStatusFile = Join-Path $env:TEMP "restore_status_$(Get-Random -Maximum 99999).json" 
$totalExpectedBytes = [long]0 

try {
    # --- Device Connection Loop ---
    $ConnectedDevices = $null
    Write-Host "`n--- Device Connection ---" -ForegroundColor Yellow
    Write-Host $SectionSeparator
    while (-not $ConnectedDevices) {
        Clear-Host 
        Write-Host "`n--- Device Connection ---" -ForegroundColor Yellow # Repeat header after Clear-Host
        Write-Host $SectionSeparator
        Write-Host "Waiting for an authorized Android device to be connected..."
        $ConnectedDevices = Get-ConnectedDevice 
        
        if (-not $ConnectedDevices) {
            Start-Sleep -Seconds 4 
            continue 
        }
        
        Write-Host -ForegroundColor Green "`nDevice(s) Detected!" # Added newline for spacing
        $deviceIndex = 1
        foreach ($Device in $ConnectedDevices) {
            Write-Host "  $($deviceIndex): Model: $($Device.Model), Serial: $($Device.SerialNumber)"
            $deviceIndex++
        }

        if ($ConnectedDevices.Count -gt 1) {
            Write-Host -ForegroundColor Yellow "`nMultiple devices found. The script will use the first listed device: '$($ConnectedDevices[0].Model)'."
        } else {
            Write-Host "`nUsing device: '$($ConnectedDevices[0].Model)'."
        }
        
        Write-Host "`nProceeding to backup selection..."
        Write-Host $SectionSeparator
        Start-Sleep -Seconds 2 
    }
    $DeviceInfo = $ConnectedDevices[0]
    $DeviceID = $DeviceInfo.SerialNumber
    $DeviceModel = $DeviceInfo.Model

    # --- Select PC Backup Instance ---
    Clear-Host
    Write-Host "`n--- PC Backup Selection ---" -ForegroundColor Yellow
    Write-Host $SectionSeparator
    Write-Host "Available backup instances from '$RestoreSourceBaseDir':" -ForegroundColor Cyan # Changed color for sub-header
    if (-not (Test-Path -Path $RestoreSourceBaseDir -PathType Container)) { Write-Host -ForegroundColor Red "Error: Base directory '$RestoreSourceBaseDir' not found."; pause; exit 1 }
    $AvailableBackupInstances = @(); $DirectoryItems = Get-ChildItem -Path $RestoreSourceBaseDir | Where-Object {$_.PSIsContainer}
    if ($DirectoryItems) { $AvailableBackupInstances = @($DirectoryItems | Select-Object -ExpandProperty Name | ForEach-Object { $_.ToString().Trim() }) }
    if ($AvailableBackupInstances.Count -eq 0) { Write-Host -ForegroundColor Red "No backup instances found in '$RestoreSourceBaseDir'."; Write-Host $SectionSeparator; pause; exit 1 }
    
    for ($i = 0; $i -lt $AvailableBackupInstances.Count; $i++) { Write-Host "  $($i + 1): $($AvailableBackupInstances[$i])" }
    Write-Host $SectionSeparator
    $SelectedBackupInstanceName = $null; $SelectedPcSourcePath = $null
    while (-not $SelectedBackupInstanceName) {
        $Choice = Read-Host -Prompt "Enter number of backup to restore (or 'q' to quit)"; if ($Choice -eq 'q') { Write-Host $SectionSeparator; exit 0 }
        if ($Choice -match '^\d+$' -and [int]$Choice -ge 1 -and [int]$Choice -le $AvailableBackupInstances.Count) {
            $SelectedBackupInstanceName = $AvailableBackupInstances[([int]$Choice - 1)]
            $SelectedPcSourcePath = Join-Path -Path $RestoreSourceBaseDir -ChildPath $SelectedBackupInstanceName
            if (-not (Test-Path -Path $SelectedPcSourcePath -PathType Container)) { Write-Host -ForegroundColor Red "Error with path '$SelectedPcSourcePath'."; $SelectedBackupInstanceName = $null; continue }
            Write-Host -ForegroundColor Green "Selected for restore: '$SelectedPcSourcePath'"
        } else { Write-Host -ForegroundColor Red "Invalid selection." }
    }
    Write-Host -ForegroundColor Blue "Target on device: /$DeviceTargetBasePath/"
    Write-Host $SectionSeparator
    Start-Sleep -Seconds 1

    # --- Pre-check Folders on PC & Calculate Sizes ---
    Write-Host "`n--- PC Backup Source Folder Scan ---" -ForegroundColor Yellow
    Write-Host "Source: $SelectedPcSourcePath"
    
    $ColumnWidthFolder = 25 
    $ColumnWidthStatus = 12
    $ColumnWidthSize   = 12
    
    $headerFormat = "{0,-$ColumnWidthFolder} | {1,-$ColumnWidthStatus} | {2,$ColumnWidthSize}"
    $tableHeader = $headerFormat -f "Folder Name", "Status", "Size" # Renamed to avoid conflict
    Write-Host $tableHeader
    Write-Host ("-" * ($tableHeader.Length)) 

    $PcFoldersToProcessDetails = @()    
    $SkippedFoldersNotFoundOnPC = @()

    foreach ($FolderName in $FoldersToRestoreNames) {
        $PotentialSourceFolderPathOnPC = Join-Path $SelectedPcSourcePath $FolderName
        $StatusText = "" 
        $SizeStr = "-"
        $FolderColor = "Gray" 

        if (Test-Path $PotentialSourceFolderPathOnPC -PathType Container) {
            $StatusText = "Found"
            $FolderColor = "Green"
            $folderSize = (Get-ChildItem -Path $PotentialSourceFolderPathOnPC -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            $SizeStr = ConvertBytesToHumanReadable $folderSize 
            $PcFoldersToProcessDetails += [PSCustomObject]@{ Name = $FolderName; Path = $PotentialSourceFolderPathOnPC; SizeBytes = [long]$folderSize; SizeReadable = $SizeStr } 
            $totalExpectedBytes += [long]$folderSize 
        } else { 
            $StatusText = "NOT FOUND"
            $FolderColor = "Yellow"
            $SkippedFoldersNotFoundOnPC += $FolderName 
        }
        Write-Host ($headerFormat -f $FolderName, $StatusText, $SizeStr) -ForegroundColor $FolderColor
    }
    Write-Host ("-" * ($tableHeader.Length)) 
    $ActualFoldersToProcessCount = $PcFoldersToProcessDetails.Count
    $totalSizeReadable_PC = ConvertBytesToHumanReadable $totalExpectedBytes
    Write-Host "Folders to restore: $ActualFoldersToProcessCount"
    Write-Host "Total size from PC: $totalSizeReadable_PC"
    if ($SkippedFoldersNotFoundOnPC.Count -gt 0) { Write-Host -ForegroundColor Yellow "Skipped PC folder(s): $($SkippedFoldersNotFoundOnPC -join ', ')" }
    Write-Host $SectionSeparator
        
    # --- Initialize Progress Data for UI ---
    $ProgressData = @{
        CurrentFolderName       = "Initializing..."
        CurrentFolderStatus     = "Pending"
        TotalFoldersToProcess   = $ActualFoldersToProcessCount
        FoldersCompletedCount   = 0
        BytesPushedSoFar        = [long]0 
        TotalExpectedBytes      = $totalExpectedBytes 
        OverallStatus           = "Starting..."
    }
    Update-ProgressFile -FilePath $ProgressStatusFile -ProgressData $ProgressData

    # --- Define the ScriptBlock for the UI Job (Monitor Window) ---
    $uiScriptBlock = {
        param(
            [string]$ProgressJsonFile,
            [string]$UiTargetDescription
        )
        Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing

        $form = New-Object System.Windows.Forms.Form; $form.Text = "Restore Monitor"; $form.Size = New-Object System.Drawing.Size(500, 280); $form.StartPosition = 'Manual'; $screenWidth = [System.Windows.Forms.SystemInformation]::PrimaryMonitorSize.Width; $form.Location = New-Object System.Drawing.Point($screenWidth - $form.Width - 20, 30); $form.FormBorderStyle = 'FixedDialog'; $form.MaximizeBox = $false; $form.MinimizeBox = $true
        $labelTarget = New-Object System.Windows.Forms.Label; $labelTarget.Location = New-Object System.Drawing.Point(10, 10); $labelTarget.Size = New-Object System.Drawing.Size(460, 20); $labelTarget.Text = $UiTargetDescription; $labelTarget.AutoEllipsis = $true
        $labelCurrentFile = New-Object System.Windows.Forms.Label; $labelCurrentFile.Location = New-Object System.Drawing.Point(10, 35); $labelCurrentFile.Size = New-Object System.Drawing.Size(460, 20); $labelCurrentFile.Text = "Current: Initializing..."; $labelCurrentFile.AutoEllipsis = $true
        $labelByteProgress = New-Object System.Windows.Forms.Label; $labelByteProgress.Location = New-Object System.Drawing.Point(10, 60); $labelByteProgress.Size = New-Object System.Drawing.Size(460, 30); $labelByteProgress.Font = New-Object System.Drawing.Font("Segoe UI", 11, [System.Drawing.FontStyle]::Bold); $labelByteProgress.Text = "0.00 GB / 0.00 GB"; $labelByteProgress.TextAlign = 'MiddleCenter'
        $progressBar = New-Object System.Windows.Forms.ProgressBar; $progressBar.Location = New-Object System.Drawing.Point(15, 95); $progressBar.Size = New-Object System.Drawing.Size(450, 25); $progressBar.Minimum = 0; $progressBar.Maximum = 1000; $progressBar.Value = 0; $progressBar.Style = 'Continuous'
        $labelFolderProgress = New-Object System.Windows.Forms.Label; $labelFolderProgress.Location = New-Object System.Drawing.Point(15, 125); $labelFolderProgress.Size = New-Object System.Drawing.Size(450, 20); $labelFolderProgress.Text = "Folders: 0 / 0"; $labelFolderProgress.TextAlign = 'MiddleCenter'
        $labelOverallStatus = New-Object System.Windows.Forms.Label; $labelOverallStatus.Location = New-Object System.Drawing.Point(10,150); $labelOverallStatus.Size = New-Object System.Drawing.Size(460,20); $labelOverallStatus.Text = "Status: Initializing..."; $labelOverallStatus.TextAlign = 'MiddleCenter'; $labelOverallStatus.Font = New-Object System.Drawing.Font("Segoe UI", 9, [System.Drawing.FontStyle]::Italic);
        $buttonClose = New-Object System.Windows.Forms.Button; $buttonClose.Location = New-Object System.Drawing.Point(195, 190); $buttonClose.Size = New-Object System.Drawing.Size(100, 30); $buttonClose.Text = "Close Monitor"; $buttonClose.Add_Click({ $form.Close() }); $form.CancelButton = $buttonClose
        $timer = New-Object System.Windows.Forms.Timer; $timer.Interval = 750 

        $updateAction = {
            try {
                if (-not (Test-Path $ProgressJsonFile)) { if ($form.IsHandleCreated) { $form.BeginInvoke([Action]{ $labelCurrentFile.Text = "Waiting for progress data file..."}) }; return }
                
                $progressContent = $null; $progress = $null
                try {
                    $fileStream = New-Object System.IO.FileStream($ProgressJsonFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
                    $streamReader = New-Object System.IO.StreamReader($fileStream)
                    $progressContent = $streamReader.ReadToEnd()
                    $streamReader.Close(); $fileStream.Close()
                } catch {
                    if ($form.IsHandleCreated) { $form.BeginInvoke([Action]{ $labelCurrentFile.Text = "Error reading progress file."}) }
                    return
                }

                if (-not $progressContent) { if ($form.IsHandleCreated) { $form.BeginInvoke([Action]{ $labelCurrentFile.Text = "Reading progress data (empty)..."}) }; return }

                try {
                    $progress = $progressContent | ConvertFrom-Json -ErrorAction Stop
                } catch {
                    if ($form.IsHandleCreated) { $form.BeginInvoke([Action]{ $labelCurrentFile.Text = "Error parsing progress data."}) }
                    return
                }
                
                if ($form.IsHandleCreated) {
                    $form.BeginInvoke([Action[object]]{ 
                        param($CurrentProgressData) 

                        $labelCurrentFile.Text = "Current: $($CurrentProgressData.CurrentFolderName) ($($CurrentProgressData.CurrentFolderStatus))"
                        
                        $bytesPushedNum = [double]$CurrentProgressData.BytesPushedSoFar
                        $totalExpectedNum = [double]$CurrentProgressData.TotalExpectedBytes
                        
                        $bytesPushedGB = $bytesPushedNum / 1GB
                        $totalExpectedGB = $totalExpectedNum / 1GB
                        $labelByteProgress.Text = "{0:N2} GB / {1:N2} GB Transferred" -f $bytesPushedGB, $totalExpectedGB
                        
                        if ($totalExpectedNum -gt 0) {
                            $percent = ($bytesPushedNum / $totalExpectedNum)
                            $progressBar.Value = [Math]::Min($progressBar.Maximum, [int]($percent * $progressBar.Maximum))
                        } else {
                            if (($CurrentProgressData.FoldersCompletedCount -eq $CurrentProgressData.TotalFoldersToProcess) -and ($CurrentProgressData.TotalFoldersToProcess -gt 0)) { $progressBar.Value = $progressBar.Maximum }
                            elseif ($CurrentProgressData.TotalFoldersToProcess -eq 0) { $progressBar.Value = $progressBar.Maximum } 
                            else { $progressBar.Value = 0 }
                        }
                        $labelFolderProgress.Text = "Folders: {0} / {1} Completed" -f $CurrentProgressData.FoldersCompletedCount, $CurrentProgressData.TotalFoldersToProcess
                        $labelOverallStatus.Text = "Status: $($CurrentProgressData.OverallStatus)"
                    }, $progress) 
                }
            } catch {
                if ($form.IsHandleCreated) { $form.BeginInvoke([Action]{ $labelCurrentFile.Text = "Critical UI Error: $($_.Exception.Message.Split('.')[0])" }) }
            }
        }
        $timer.Add_Tick($updateAction); $form.Controls.AddRange(@($labelTarget, $labelCurrentFile, $labelByteProgress, $progressBar, $labelFolderProgress, $labelOverallStatus, $buttonClose)); $form.Add_FormClosing({ $timer.Stop(); $timer.Dispose(); Write-Host "Monitor closing..." });
        Invoke-Command -ScriptBlock $updateAction; $timer.Start(); $form.Show()
        while ($form.Visible) { [System.Windows.Forms.Application]::DoEvents(); Start-Sleep -Milliseconds 100 };
        $form.Dispose(); Write-Host "Monitor job exiting."
    }

    # --- Start the UI Job ---
    if ($ActualFoldersToProcessCount -gt 0 -or $totalExpectedBytes -eq 0) { 
        Write-Host "`n--- UI Monitor ---" -ForegroundColor Yellow
        Write-Host "Launching background restore monitor window..."
        $UiTargetDesc = "Restore to device '$($DeviceModel)' ($($DeviceTargetBasePath)/)"
        $uiJob = Start-Job -ScriptBlock $uiScriptBlock -ArgumentList $ProgressStatusFile, $UiTargetDesc 
        Start-Sleep -Seconds 2 
        Write-Host $SectionSeparator
    } else { 
        Write-Host "`n--- UI Monitor ---" -ForegroundColor Yellow
        Write-Host "No folders to restore, monitor window will not be started." -ForegroundColor Yellow 
        Write-Host $SectionSeparator
    }

    # --- Start Restore Process ---
    if ($ActualFoldersToProcessCount -gt 0) {
        Write-Host "`n--- Android Restore Process ---" -ForegroundColor Yellow
        Write-Host "Target Device: $DeviceModel (/$DeviceTargetBasePath/)"
        Write-Host $SectionSeparator
        
        $ProgressData.OverallStatus = "Restoring..."
        Update-ProgressFile -FilePath $ProgressStatusFile -ProgressData $ProgressData
        
        $currentFolderIndex = 0
        foreach ($PcFolderDetail in $PcFoldersToProcessDetails) { 
            $currentFolderIndex++
            $ProgressData.CurrentFolderName = $PcFolderDetail.Name
            $ProgressData.CurrentFolderStatus = "Processing"
            Update-ProgressFile -FilePath $ProgressStatusFile -ProgressData $ProgressData

            $folderDisplayName = $PcFolderDetail.Name
            $folderSizeReadable = $PcFolderDetail.SizeReadable 
            $targetDeviceFullFolderPath = "/$DeviceTargetBasePath/$($PcFolderDetail.Name)/" 

            Write-Host -ForegroundColor White "Folder Item  : $currentFolderIndex / $ActualFoldersToProcessCount"
            Write-Host "  Name         : $folderDisplayName"
            Write-Host "  Size         : $folderSizeReadable"
            Write-Host "  Device Path  : $targetDeviceFullFolderPath"
            Write-Host -NoNewline "  Status       : Restoring... "
            
            if (Restore-Files $DeviceID $PcFolderDetail.Path $DeviceTargetBasePath) {
                Write-Host -ForegroundColor Green "COMPLETED."
                $foldersSuccessfullyRestoredCount++
                $cumulativeBytesPushed += $PcFolderDetail.SizeBytes 
                $ProgressData.CurrentFolderStatus = "Completed"
                $ProgressData.FoldersCompletedCount = $foldersSuccessfullyRestoredCount
                $ProgressData.BytesPushedSoFar = $cumulativeBytesPushed
            } else {
                Write-Host -ForegroundColor Red "FAILED."
                # Restore-Files will print its own ADB error details, already indented.
                $ProgressData.CurrentFolderStatus = "Failed"
            }
            Update-ProgressFile -FilePath $ProgressStatusFile -ProgressData $ProgressData
            Write-Host $SectionSeparator # Separator for the next folder item

            if ($uiJob -and $uiJob.State -eq 'Failed') { Write-Warning "Monitor job failed."; Receive-Job $uiJob; $uiJob = $null }
        }
        $ProgressData.OverallStatus = "Restore Finished. ($foldersSuccessfullyRestoredCount / $ActualFoldersToProcessCount successful)"
        $ProgressData.CurrentFolderName = "All Done."
        $ProgressData.CurrentFolderStatus = "" 
        Update-ProgressFile -FilePath $ProgressStatusFile -ProgressData $ProgressData
        Write-Host "`n--- Restore Process Finished ---" -ForegroundColor Yellow 
        Write-Host $SectionSeparator
    } else {
        $ProgressData.OverallStatus = "No folders to restore."
        $ProgressData.CurrentFolderName = "N/A"
        if($ProgressStatusFile -and (Test-Path $ProgressStatusFile)){ Update-ProgressFile -FilePath $ProgressStatusFile -ProgressData $ProgressData }
        Write-Host "`n--- Android Restore Process ---" -ForegroundColor Yellow
        Write-Host "No folders selected or found in backup to restore." -ForegroundColor Yellow
        Write-Host $SectionSeparator
    }

    # --- Final Summary ---
    Write-Host "`n--- Restore Summary ---" -ForegroundColor Yellow
    Write-Host $SectionSeparator

    $resultStatusText = "Successfully restored $foldersSuccessfullyRestoredCount of $ActualFoldersToProcessCount attempted folder(s)."
    $resultColor = "Green"
    if ($foldersSuccessfullyRestoredCount -ne $ActualFoldersToProcessCount) {
        $resultColor = "Yellow" 
        if ($foldersSuccessfullyRestoredCount -eq 0 -and $ActualFoldersToProcessCount -gt 0) { $resultColor = "Red" }
    }
    Write-Host ("{0,-25} : {1}" -f "Overall Result", $resultStatusText) -ForegroundColor $resultColor

    if ($SkippedFoldersNotFoundOnPC.Count -gt 0) {
        Write-Host ("{0,-25} : {1} folder(s)" -f "Skipped (Not on PC)", $SkippedFoldersNotFoundOnPC.Count) -ForegroundColor Yellow
        Write-Host ("{0,-25}   ({1})" -f "", ($SkippedFoldersNotFoundOnPC -join ', ')) -ForegroundColor Yellow
    } else {
        Write-Host ("{0,-25} : 0" -f "Skipped (Not on PC)")
    }

    Write-Host ("{0,-25} : {1}" -f "Total Size (from PC)", $totalSizeReadable_PC)
    Write-Host ("{0,-25} : {1}" -f "Device Restore Path", "/$DeviceTargetBasePath/")
    Write-Host ("{0,-25} : {1}" -f "Device Model", $DeviceModel)
    
    Write-Host $SectionSeparator
    Write-Host 

    # --- Wait for User ---
    if ($uiJob -ne $null) { Write-Host -ForegroundColor Cyan "Restore script complete. Monitor window is running. Close it, then press Enter here."}
    else { Write-Host -ForegroundColor Cyan "Restore script complete. Press Enter here to exit."}
    pause

} finally {
    if ($uiJob -ne $null) { Stop-Job -Job $uiJob -ErrorAction SilentlyContinue | Remove-Job -ErrorAction SilentlyContinue }
    if ($ProgressStatusFile -and (Test-Path $ProgressStatusFile -PathType Leaf)) { Remove-Item $ProgressStatusFile -ErrorAction SilentlyContinue }
    Write-Host "`nScript finished." # Added newline for clarity before exit
    Write-Host $SectionSeparator
}
exit 0
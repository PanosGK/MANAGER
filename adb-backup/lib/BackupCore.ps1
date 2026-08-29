# Shared Android backup engine (GUI + web)

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
$Script:LockFileName = ".backup_in_progress.lock"
$Script:FailedFilesLogName = "_failed_files.log"
$Script:BackupReportName = "_backup_report.json"
$Script:MinFreeDiskBytes = 2147483648
$Script:MinFreeDiskPercent = 0.05
$Script:DevicePollIntervalSeconds = 10
$Script:DiskCheckIntervalSeconds = 30
$Script:StuckProgressTimeoutSeconds = 180
$Script:LowBatteryPercent = 20
$Script:ContactsVcfExtraScanFolders = @(
    "sdcard/Download",
    "sdcard/Downloads",
    "sdcard/Documents"
)

function Get-BackupScriptRoot {
    if ($PSScriptRoot) {
        return Split-Path -Parent $PSScriptRoot
    }
    return Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Definition)
}

function Get-ScriptDirectory {
    return Get-BackupScriptRoot
}

function Get-BackupSettingsPath {
    return Join-Path (Get-BackupScriptRoot) "backup_settings.json"
}

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

function Test-AdbAvailable {
    return (Get-Command adb -ErrorAction SilentlyContinue) -ne $null
}

function Get-AdbDeviceEntries {
    $entries = @()
    if (-not (Test-AdbAvailable)) { return $entries }
    $output = adb devices | Out-String
    foreach ($line in ($output -split "`n")) {
        if ($line -match "^([a-zA-Z0-9_-]+)\s+(\S+)\s*$") {
            $entries += [PSCustomObject]@{
                Serial = $Matches[1]
                State  = $Matches[2]
            }
        }
    }
    return $entries
}

function Test-DeviceAdbReady {
    param([string]$DeviceSerial)
    if ([string]::IsNullOrWhiteSpace($DeviceSerial)) { return $false }
    $match = Get-AdbDeviceEntries | Where-Object { $_.Serial -eq $DeviceSerial -and $_.State -eq 'device' } | Select-Object -First 1
    return [bool]$match
}

function Get-AdbConnectionIssues {
    $issues = @()
    foreach ($entry in (Get-AdbDeviceEntries)) {
        switch ($entry.State) {
            'unauthorized' {
                $issues += @{ level = 'error'; code = 'unauthorized'; message = "Phone $($entry.Serial): tap Allow on the USB debugging prompt."; serial = $entry.Serial }
            }
            'offline' {
                $issues += @{ level = 'error'; code = 'offline'; message = "Phone $($entry.Serial) is offline — replug the USB cable or try another port."; serial = $entry.Serial }
            }
            { $_ -match 'no permissions' } {
                $issues += @{ level = 'error'; code = 'no_permissions'; message = "No USB permissions for $($entry.Serial) — revoke USB debugging authorizations and replug."; serial = $entry.Serial }
            }
        }
    }
    return $issues
}

function Get-DeviceBatteryStatus {
    param([string]$DeviceSerial)
    if (-not (Test-DeviceAdbReady -DeviceSerial $DeviceSerial)) { return $null }
    try {
        $raw = (adb -s $DeviceSerial shell dumpsys battery 2>&1 | Out-String)
        $level = 100
        $charging = $false
        if ($raw -match 'level:\s*(\d+)') { $level = [int]$Matches[1] }
        if ($raw -match 'status:\s*(\d+)') {
            $statusCode = [int]$Matches[1]
            $charging = ($statusCode -eq 2 -or $statusCode -eq 5)
        }
        return @{ Level = $level; Charging = $charging }
    } catch {
        return $null
    }
}

function Get-RemoteFileSizeBytes {
    param(
        [string]$DeviceID,
        [string]$RemotePath
    )
    $escaped = $RemotePath.Replace("'", "'\''")
    $out = adb -s $DeviceID shell "stat -c %s '$escaped'" 2>&1
    if ($LASTEXITCODE -ne 0) { return $null }
    $trimmed = ($out -replace '[\r\n]+', '').Trim()
    if ($trimmed -match '^\d+$') { return [long]$trimmed }
    return $null
}

function Test-PulledFileVerified {
    param(
        [string]$DeviceID,
        [string]$RemotePath,
        [string]$LocalPath
    )
    if (-not (Test-Path $LocalPath -PathType Leaf)) { return $false }
    $remoteSize = Get-RemoteFileSizeBytes -DeviceID $DeviceID -RemotePath $RemotePath
    if ($null -eq $remoteSize) { return $true }
    return ((Get-Item $LocalPath).Length -eq $remoteSize)
}

function Restart-AdbServer {
    $null = adb kill-server 2>&1
    Start-Sleep -Milliseconds 800
    $null = adb start-server 2>&1
    Start-Sleep -Milliseconds 500
}

function Test-BackupDiskSpaceLow {
    param([string]$DestinationPath)
    $free = Get-DriveFreeSpaceBytes -Path $DestinationPath
    if ($free -le 0) {
        return @{ Low = $true; FreeBytes = [long]0; Message = "Cannot read free disk space on backup drive." }
    }
    $percentFree = 0.0
    try {
        $fullPath = [System.IO.Path]::GetFullPath($DestinationPath)
        $root = [System.IO.Path]::GetPathRoot($fullPath)
        $drive = New-Object System.IO.DriveInfo($root)
        if ($drive.TotalSize -gt 0) {
            $percentFree = [double]$free / [double]$drive.TotalSize
        }
    } catch { }
    $low = ($free -lt $Script:MinFreeDiskBytes) -or ($percentFree -lt $Script:MinFreeDiskPercent -and $free -lt 10GB)
    return @{
        Low = $low
        FreeBytes = $free
        Message = if ($low) { "Low disk space ($(Format-BytesHuman $free) free). Backup paused." } else { $null }
    }
}

function Get-BackupLockPath {
    param([string]$BackupDir)
    return Join-Path $BackupDir $Script:LockFileName
}

function Get-BackupLockInfo {
    param([string]$BackupDir)
    $lockPath = Get-BackupLockPath -BackupDir $BackupDir
    if (-not (Test-Path $lockPath -PathType Leaf)) { return $null }
    try {
        $data = Get-Content $lockPath -Raw -Encoding UTF8 | ConvertFrom-Json
        $proc = Get-Process -Id ([int]$data.pid) -ErrorAction SilentlyContinue
        return @{
            Pid = [int]$data.pid
            DeviceSerial = [string]$data.deviceSerial
            StartedAt = [string]$data.startedAt
            Host = [string]$data.host
            ProcessAlive = [bool]$proc
            BackupDir = $BackupDir
            Stale = $false
        }
    } catch {
        return @{ Stale = $true; BackupDir = $BackupDir; ProcessAlive = $false }
    }
}

function Test-BackupLockStale {
    param($LockInfo)
    if ($null -eq $LockInfo) { return $false }
    if ($LockInfo.Stale) { return $true }
    return -not $LockInfo.ProcessAlive
}

function New-BackupSessionLock {
    param(
        [string]$BackupDir,
        [string]$DeviceSerial
    )
    $lockPath = Get-BackupLockPath -BackupDir $BackupDir
    if (Test-Path $lockPath) {
        $existing = Get-BackupLockInfo -BackupDir $BackupDir
        if ($existing -and -not (Test-BackupLockStale -LockInfo $existing)) {
            throw "Another backup is already running for this device folder (PID $($existing.Pid))."
        }
        Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
    }
    $lock = @{
        pid = $PID
        deviceSerial = $DeviceSerial
        startedAt = (Get-Date).ToString('o')
        host = $env:COMPUTERNAME
    }
    ($lock | ConvertTo-Json -Compress) | Set-Content -Path $lockPath -Encoding UTF8 -Force
}

function Remove-BackupSessionLock {
    param([string]$BackupDir)
    $lockPath = Get-BackupLockPath -BackupDir $BackupDir
    if (Test-Path $lockPath) {
        Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
    }
}

function Get-InterruptedBackups {
    param([string]$BackupBaseDir)
    $interrupted = @()
    if (-not (Test-Path $BackupBaseDir -PathType Container)) { return $interrupted }
    foreach ($dir in (Get-ChildItem $BackupBaseDir -Directory -ErrorAction SilentlyContinue)) {
        $lockInfo = Get-BackupLockInfo -BackupDir $dir.FullName
        if (-not $lockInfo) { continue }
        if (-not (Test-BackupLockStale -LockInfo $lockInfo)) { continue }
        $failedLog = Join-Path $dir.FullName $Script:FailedFilesLogName
        $failedCount = 0
        if (Test-Path $failedLog) {
            $failedCount = @((Get-Content $failedLog -Encoding UTF8 -ErrorAction SilentlyContinue) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }).Count
        }
        $interrupted += @{
            backupDir = $dir.FullName
            deviceSerial = [string]$lockInfo.DeviceSerial
            startedAt = [string]$lockInfo.StartedAt
            failedFilesPending = $failedCount
            folderName = $dir.Name
        }
    }
    return $interrupted
}

function Clear-StaleBackupLocks {
    param([string]$BackupBaseDir)
    foreach ($item in (Get-InterruptedBackups -BackupBaseDir $BackupBaseDir)) {
        Remove-BackupSessionLock -BackupDir $item.backupDir
    }
}

function Add-FailedFileLogEntry {
    param(
        [string]$BackupDir,
        [string]$RemotePath,
        [System.Collections.Generic.List[string]]$FailedFilesList
    )
    if ($FailedFilesList -and -not $FailedFilesList.Contains($RemotePath)) {
        $FailedFilesList.Add($RemotePath) | Out-Null
    }
    $logPath = Join-Path $BackupDir $Script:FailedFilesLogName
    Add-Content -Path $logPath -Value $RemotePath -Encoding UTF8 -ErrorAction SilentlyContinue
}

function Write-BackupReport {
    param(
        [string]$BackupDir,
        [hashtable]$Report
    )
    if ([string]::IsNullOrWhiteSpace($BackupDir)) { return }
    $reportPath = Join-Path $BackupDir $Script:BackupReportName
    ($Report | ConvertTo-Json -Depth 6) | Set-Content -Path $reportPath -Encoding UTF8 -Force
}

function Find-VcfFilesInPath {
    param([string]$Path)
    if (-not (Test-Path $Path -PathType Container)) { return @() }
    return @(Get-ChildItem -Path $Path -Filter '*.vcf' -Recurse -File -ErrorAction SilentlyContinue)
}

function Find-VcfFilesOnDevice {
    param(
        [string]$DeviceID,
        [string[]]$SearchFolders
    )
    $found = New-Object System.Collections.Generic.List[string]
    $uniqueFolders = @(
        $SearchFolders |
            ForEach-Object { Normalize-DeviceFolderPath $_ } |
            Where-Object { $_ } |
            Select-Object -Unique
    )
    foreach ($folder in $uniqueFolders) {
        $remote = "/$folder"
        $escaped = $remote.Replace("'", "'\''")
        $cmd = "find '$escaped' -type f -iname '*.vcf' 2>/dev/null | head -50"
        $result = Invoke-AdbShellFind -DeviceID $DeviceID -FindCommandString $cmd
        if ([string]::IsNullOrWhiteSpace($result.Output)) { continue }
        foreach ($line in ($result.Output -split "`n")) {
            $trimmed = $line.Trim()
            if (-not [string]::IsNullOrWhiteSpace($trimmed)) {
                [void]$found.Add($trimmed)
            }
        }
    }
    return @($found | Select-Object -Unique)
}

function Get-ContactsVcfScanFolders {
    param([string[]]$SelectedFolders = @())
    $folders = @($SelectedFolders)
    if ($folders.Count -eq 0) {
        $settings = Get-BackupSettings
        $folders = @($settings.BackupFolders)
    }
    foreach ($extra in $Script:ContactsVcfExtraScanFolders) {
        $folders += $extra
    }
    return @($folders | ForEach-Object { Normalize-DeviceFolderPath $_ } | Where-Object { $_ } | Select-Object -Unique)
}

function Get-ContactsVcfStatus {
    param(
        [string]$DeviceSerial = "",
        [string]$BackupDir = "",
        [string[]]$SearchFolders = @()
    )

    $scanFolders = Get-ContactsVcfScanFolders -SelectedFolders $SearchFolders
    $localFiles = @()
    if (-not [string]::IsNullOrWhiteSpace($BackupDir) -and (Test-Path $BackupDir -PathType Container)) {
        $localFiles = @(Find-VcfFilesInPath -Path $BackupDir | ForEach-Object {
            @{
                name = $_.Name
                path = $_.FullName
                sizeBytes = [long]$_.Length
                sizeText = (Format-BytesHuman $_.Length)
            }
        })
    }

    $deviceFiles = @()
    if (-not [string]::IsNullOrWhiteSpace($DeviceSerial) -and (Test-DeviceAdbReady -DeviceSerial $DeviceSerial)) {
        $devicePaths = Find-VcfFilesOnDevice -DeviceID $DeviceSerial -SearchFolders $scanFolders
        $deviceFiles = @($devicePaths | ForEach-Object {
            $leaf = Split-Path $_ -Leaf
            if ([string]::IsNullOrWhiteSpace($leaf)) { $leaf = $_ }
            @{ name = $leaf; path = $_ }
        })
    }

    $localFound = ($localFiles.Count -gt 0)
    $deviceFound = ($deviceFiles.Count -gt 0)

    $message = if ($localFound) {
        $names = ($localFiles | ForEach-Object { $_.name }) -join ', '
        "Contacts backup OK — $($localFiles.Count) .vcf file(s) in backup: $names"
    } elseif ($deviceFound) {
        $names = ($deviceFiles | Select-Object -First 3 | ForEach-Object { $_.name }) -join ', '
        $more = if ($deviceFiles.Count -gt 3) { " (+$($deviceFiles.Count - 3) more)" } else { "" }
        "Contacts .vcf found on phone ($names$more) but not copied into this backup yet."
    } else {
        "No contacts .vcf found. On phone: Contacts app → Manage contacts → Export to storage (.vcf)."
    }

    $level = if ($localFound) { 'ok' } else { 'warn' }

    return @{
        Found = ($localFound -or $deviceFound)
        LocalFound = $localFound
        DeviceFound = $deviceFound
        LocalFiles = $localFiles
        DeviceFiles = $deviceFiles
        Message = $message
        Level = $level
    }
}

function Invoke-ContactsVcfCheck {
    param(
        [string]$DeviceSerial,
        [string]$BackupDir = "",
        [string[]]$SearchFolders = @(),
        [scriptblock]$OnProgress
    )
    $status = Get-ContactsVcfStatus -DeviceSerial $DeviceSerial -BackupDir $BackupDir -SearchFolders $SearchFolders
    if ($OnProgress) {
        & $OnProgress @{
            Type = 'ContactsCheck'
            Found = [bool]$status.LocalFound
            DeviceFound = [bool]$status.DeviceFound
            LocalCount = @($status.LocalFiles).Count
            DeviceCount = @($status.DeviceFiles).Count
            Message = [string]$status.Message
            Level = [string]$status.Level
            LocalFileNames = @($status.LocalFiles | ForEach-Object { [string]$_.name })
        }
    }
    return $status
}

function Get-FailedFilesFromLog {
    param([string]$BackupDir)
    $logPath = Join-Path $BackupDir $Script:FailedFilesLogName
    if (-not (Test-Path $logPath)) { return @() }
    return @((Get-Content $logPath -Encoding UTF8 -ErrorAction SilentlyContinue) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) } | ForEach-Object { $_.Trim() })
}

function New-BackupFailsafeState {
    param(
        [string]$DeviceSerial,
        [string]$BackupBaseDir,
        [string]$BackupDir,
        [scriptblock]$OnProgress,
        [scriptblock]$ShouldCancel
    )
    return @{
        DeviceSerial = $DeviceSerial
        BackupBaseDir = $BackupBaseDir
        BackupDir = $BackupDir
        OnProgress = $OnProgress
        ShouldCancel = $ShouldCancel
        LastFileProgressTime = Get-Date
        LastDeviceCheckTime = [datetime]::MinValue
        LastDiskCheckTime = [datetime]::MinValue
        DeviceWaitSince = $null
        StuckRecoveryAttempts = 0
        MaxStuckRecoveries = 2
    }
}

function Invoke-BackupFailsafeChecks {
    param(
        [hashtable]$Failsafe,
        [switch]$AfterFileSuccess
    )
    if ($Failsafe.ShouldCancel -and (& $Failsafe.ShouldCancel)) {
        return @{ Action = 'Cancel' }
    }

    $now = Get-Date
    if ($AfterFileSuccess) {
        $Failsafe.LastFileProgressTime = $now
        $Failsafe.StuckRecoveryAttempts = 0
    }

    if (($now - $Failsafe.LastDiskCheckTime).TotalSeconds -ge $Script:DiskCheckIntervalSeconds) {
        $Failsafe.LastDiskCheckTime = $now
        $disk = Test-BackupDiskSpaceLow -DestinationPath $Failsafe.BackupBaseDir
        if ($disk.Low) {
            if ($Failsafe.OnProgress) {
                & $Failsafe.OnProgress @{ Type = 'Failsafe'; Code = 'disk_low'; Message = $disk.Message }
                & $Failsafe.OnProgress @{ Type = 'Log'; Message = $disk.Message }
            }
            return @{ Action = 'PauseDisk'; Message = $disk.Message }
        }
    }

    if (($now - $Failsafe.LastDeviceCheckTime).TotalSeconds -ge $Script:DevicePollIntervalSeconds) {
        $Failsafe.LastDeviceCheckTime = $now
        if (-not (Test-DeviceAdbReady -DeviceSerial $Failsafe.DeviceSerial)) {
            if (-not $Failsafe.DeviceWaitSince) { $Failsafe.DeviceWaitSince = $now }
            $msg = "Phone disconnected — reconnect USB and tap Allow to resume."
            if ($Failsafe.OnProgress) {
                & $Failsafe.OnProgress @{ Type = 'Failsafe'; Code = 'device_lost'; Message = $msg }
                & $Failsafe.OnProgress @{ Type = 'Log'; Message = $msg }
            }
            return @{ Action = 'WaitDevice'; Message = $msg }
        }
        if ($Failsafe.DeviceWaitSince) {
            $Failsafe.DeviceWaitSince = $null
            if ($Failsafe.OnProgress) {
                & $Failsafe.OnProgress @{ Type = 'Failsafe'; Code = 'device_back'; Message = 'Phone reconnected — resuming.' }
                & $Failsafe.OnProgress @{ Type = 'Log'; Message = 'Phone reconnected — resuming.' }
            }
        }
    }

    if (-not $AfterFileSuccess) {
        $idleSec = ($now - $Failsafe.LastFileProgressTime).TotalSeconds
        if ($idleSec -ge $Script:StuckProgressTimeoutSeconds -and $Failsafe.StuckRecoveryAttempts -lt $Failsafe.MaxStuckRecoveries) {
            $Failsafe.StuckRecoveryAttempts++
            if ($Failsafe.OnProgress) {
                & $Failsafe.OnProgress @{ Type = 'Log'; Message = "No progress for $([int]$idleSec)s — restarting ADB..." }
                & $Failsafe.OnProgress @{ Type = 'Failsafe'; Code = 'adb_restart'; Message = 'Restarting ADB after stall...' }
            }
            Restart-AdbServer
            $Failsafe.LastFileProgressTime = Get-Date
            return @{ Action = 'AdbRestart'; Message = 'ADB restarted.' }
        }
    }

    return @{ Action = 'Continue' }
}

function Wait-BackupFailsafeCondition {
    param(
        [hashtable]$Failsafe,
        [string]$Reason
    )
    $start = Get-Date
    while (-not (& $Failsafe.ShouldCancel)) {
        if (((Get-Date) - $start).TotalMinutes -gt 60) {
            throw "Failsafe timeout waiting: $Reason"
        }
        if ($Reason -eq 'WaitDevice') {
            if (Test-DeviceAdbReady -DeviceSerial $Failsafe.DeviceSerial) {
                $Failsafe.DeviceWaitSince = $null
                $Failsafe.LastDeviceCheckTime = [datetime]::MinValue
                return
            }
        } elseif ($Reason -eq 'PauseDisk') {
            $disk = Test-BackupDiskSpaceLow -DestinationPath $Failsafe.BackupBaseDir
            if (-not $disk.Low) {
                $Failsafe.LastDiskCheckTime = [datetime]::MinValue
                if ($Failsafe.OnProgress) {
                    & $Failsafe.OnProgress @{ Type = 'Failsafe'; Code = 'disk_ok'; Message = 'Disk space OK — resuming.' }
                }
                return
            }
        } else {
            return
        }
        Start-Sleep -Seconds 2
    }
}

function Invoke-FailsafeLoopStep {
    param([hashtable]$Failsafe)
    while ($true) {
        $check = Invoke-BackupFailsafeChecks -Failsafe $Failsafe
        switch ($check.Action) {
            'Continue' { return }
            'AdbRestart' { return }
            'Cancel' { return }
            'WaitDevice' {
                Wait-BackupFailsafeCondition -Failsafe $Failsafe -Reason 'WaitDevice'
            }
            'PauseDisk' {
                Wait-BackupFailsafeCondition -Failsafe $Failsafe -Reason 'PauseDisk'
            }
            default { return }
        }
        if (& $Failsafe.ShouldCancel) { return }
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
            $ConnectedDevices += [PSCustomObject]@{
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
        $folders += $trimmed.TrimStart('/')
    }
    return ($folders | Sort-Object)
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

function Get-BackupSettings {
    $path = Get-BackupSettingsPath
    if (-not (Test-Path $path)) {
        return @{
            BackupBaseDir = $Script:BackupBaseDir
            BackupFolders = @($Script:BackupFolders)
        }
    }
    $settings = Get-Content $path -Raw -Encoding UTF8 | ConvertFrom-Json
    return @{
        BackupBaseDir = [string]$settings.BackupBaseDir
        BackupFolders = @($settings.BackupFolders | ForEach-Object { [string]$_ })
    }
}

function Save-BackupSettings {
    param(
        [string]$BackupBaseDir,
        [string[]]$BackupFolders
    )
    $settings = @{
        BackupBaseDir = $BackupBaseDir
        BackupFolders = $BackupFolders
    }
    ($settings | ConvertTo-Json -Depth 4) | Set-Content -Path (Get-BackupSettingsPath) -Encoding UTF8
}

function Test-BackupDestinationPath {
    param([string]$Path)
    $issues = @()
    if ([string]::IsNullOrWhiteSpace($Path)) {
        return @{ Ok = $false; Path = $null; Issues = @("Backup destination path is empty.") }
    }
    try {
        $fullPath = [System.IO.Path]::GetFullPath($Path.Trim())
    } catch {
        return @{ Ok = $false; Path = $Path; Issues = @("Backup destination path is invalid.") }
    }
    if ($fullPath -match '[<>|?*]') {
        return @{ Ok = $false; Path = $fullPath; Issues = @("Backup path contains invalid characters.") }
    }
    if (-not (Test-Path $fullPath -PathType Container)) {
        try {
            New-Item -ItemType Directory -Path $fullPath -Force -ErrorAction Stop | Out-Null
        } catch {
            return @{ Ok = $false; Path = $fullPath; Issues = @("Cannot create backup folder: $($_.Exception.Message)") }
        }
    }
    $testFile = Join-Path $fullPath "._adb_backup_write_test"
    try {
        Set-Content -Path $testFile -Value "ok" -Encoding UTF8 -Force -ErrorAction Stop
        Remove-Item -Path $testFile -Force -ErrorAction Stop
    } catch {
        return @{ Ok = $false; Path = $fullPath; Issues = @("Backup folder is not writable.") }
    }
    return @{ Ok = $true; Path = $fullPath; Issues = @() }
}

function Get-BackupReadiness {
    param(
        [string]$DeviceSerial = "",
        [string]$BackupBaseDir = "",
        [string[]]$SelectedFolders = @(),
        [switch]$BackupBusy
    )

    $checks = New-Object System.Collections.ArrayList
    $ready = $true
    $device = $null

    if (-not (Test-AdbAvailable)) {
        [void]$checks.Add(@{ level = "error"; code = "adb_missing"; message = "ADB is not installed. Add platform-tools to PATH." })
        $ready = $false
    } else {
        [void]$checks.Add(@{ level = "ok"; code = "adb_ok"; message = "ADB is ready." })
        foreach ($issue in (Get-AdbConnectionIssues)) {
            [void]$checks.Add($issue)
            if ($issue.level -eq 'error') { $ready = $false }
        }
    }

    $devices = @(Get-ConnectedDevices)
    if ($devices.Count -eq 0) {
        if (-not (Get-AdbConnectionIssues | Where-Object { $_.level -eq 'error' })) {
            [void]$checks.Add(@{ level = "error"; code = "no_device"; message = "No phone detected. Connect USB, enable USB debugging, and tap Allow on the phone." })
        }
        $ready = $false
    } elseif ($devices.Count -eq 1) {
        $device = $devices[0]
        [void]$checks.Add(@{ level = "ok"; code = "device_ok"; message = "Phone ready: $($device.DisplayName)" })
    } else {
        if ([string]::IsNullOrWhiteSpace($DeviceSerial)) {
            [void]$checks.Add(@{ level = "error"; code = "multi_device"; message = "Multiple phones connected. Unplug extras or select one in Advanced." })
            $ready = $false
        } else {
            $device = $devices | Where-Object { $_.SerialNumber -eq $DeviceSerial } | Select-Object -First 1
            if (-not $device) {
                [void]$checks.Add(@{ level = "error"; code = "device_missing"; message = "Selected phone is no longer connected." })
                $ready = $false
            } else {
                [void]$checks.Add(@{ level = "ok"; code = "device_ok"; message = "Phone ready: $($device.DisplayName)" })
            }
        }
    }

    if ([string]::IsNullOrWhiteSpace($BackupBaseDir)) {
        $settings = Get-BackupSettings
        $BackupBaseDir = [string]$settings.BackupBaseDir
    }
    $destCheck = Test-BackupDestinationPath -Path $BackupBaseDir
    if (-not $destCheck.Ok) {
        foreach ($issue in $destCheck.Issues) {
            [void]$checks.Add(@{ level = "error"; code = "bad_destination"; message = $issue })
        }
        $ready = $false
    } else {
        [void]$checks.Add(@{ level = "ok"; code = "destination_ok"; message = "Save location OK: $($destCheck.Path)" })
        $BackupBaseDir = [string]$destCheck.Path
    }

    if ($SelectedFolders.Count -eq 0) {
        $settings = Get-BackupSettings
        $SelectedFolders = @($settings.BackupFolders | ForEach-Object { Normalize-DeviceFolderPath $_ } | Where-Object { $_ })
    }
    if ($SelectedFolders.Count -eq 0) {
        [void]$checks.Add(@{ level = "error"; code = "no_folders"; message = "No folders configured to back up." })
        $ready = $false
    } else {
        [void]$checks.Add(@{ level = "ok"; code = "folders_ok"; message = "$($SelectedFolders.Count) folder(s) configured." })
    }

    if ($BackupBusy -or $Script:BackupRunning) {
        [void]$checks.Add(@{ level = "error"; code = "busy"; message = "A backup is already running." })
        $ready = $false
    }

    $batteryWarn = $null
    if ($device) {
        $battery = Get-DeviceBatteryStatus -DeviceSerial $device.SerialNumber
        if ($battery -and $battery.Level -lt $Script:LowBatteryPercent -and -not $battery.Charging) {
            $batteryWarn = "Phone battery is $($battery.Level)% and not charging — connect a charger for long backups."
            [void]$checks.Add(@{ level = "warn"; code = "low_battery"; message = $batteryWarn })
        }

        $contacts = Get-ContactsVcfStatus -DeviceSerial $device.SerialNumber -SearchFolders $SelectedFolders
        if ($contacts.LocalFound) {
            [void]$checks.Add(@{ level = "ok"; code = "contacts_vcf"; message = [string]$contacts.Message })
        } elseif ($contacts.DeviceFound) {
            [void]$checks.Add(@{ level = "warn"; code = "contacts_on_device"; message = [string]$contacts.Message })
        } else {
            [void]$checks.Add(@{
                level = "warn"
                code = "contacts_missing"
                message = "No contacts .vcf on phone. Export contacts before backup (Contacts → Manage → Export)."
            })
        }
    }

    return @{
        ready = $ready
        checks = @($checks)
        device = $device
        backupBaseDir = $BackupBaseDir
        selectedFolders = $SelectedFolders
        battery = $batteryWarn
    }
}

function Invoke-AdbPullFile {
    param(
        [string]$DeviceID,
        [string]$RemotePath,
        [string]$LocalPath,
        [int]$MaxRetries = 2,
        [switch]$VerifySize
    )
    for ($attempt = 0; $attempt -le $MaxRetries; $attempt++) {
        if ($attempt -gt 0 -and (Test-Path $LocalPath -PathType Leaf)) {
            Remove-Item -Path $LocalPath -Force -ErrorAction SilentlyContinue
        }
        $null = adb -s $DeviceID pull "$RemotePath" "$LocalPath" 2>&1
        if ($LASTEXITCODE -eq 0) {
            if (-not $VerifySize -or (Test-PulledFileVerified -DeviceID $DeviceID -RemotePath $RemotePath -LocalPath $LocalPath)) {
                return $true
            }
            if (Test-Path $LocalPath -PathType Leaf) {
                Remove-Item -Path $LocalPath -Force -ErrorAction SilentlyContinue
            }
        }
        if ($attempt -lt $MaxRetries) { Start-Sleep -Milliseconds 400 }
    }
    return $false
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
        [scriptblock]$WaitIfPaused = {},
        [hashtable]$Failsafe = $null,
        [System.Collections.Generic.List[string]]$FailedFilesList = $null,
        [string[]]$FilesToPull = $null
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
    if ($FilesToPull -and $FilesToPull.Count -gt 0) {
        $FilesOnDevice = @($FilesToPull)
    } else {
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
    }
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

        if ($Failsafe) {
            Invoke-FailsafeLoopStep -Failsafe $Failsafe
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
                Type = "FileStart"
                Folder = $SourceFolderLeafName
                File = Split-Path -Leaf $RelativePath
                FileIndex = $fileIndex
                FileTotal = $totalFiles
                BackupDir = $BaseBackupDir
            }
        }

        $pullOk = Invoke-AdbPullFile -DeviceID $DeviceID -RemotePath $RemoteFileFullPathClean -LocalPath $LocalFileDestPath -VerifySize
        if ($pullOk) {
            if ($AlreadyTransferredFiles.Add($RemoteFileFullPathClean)) {
                try {
                    Add-Content -Path $StateFilePath -Value $RemoteFileFullPathClean -Encoding UTF8
                } catch {
                    $FilesFailedInFolder++
                    Add-FailedFileLogEntry -BackupDir $BaseBackupDir -RemotePath $RemoteFileFullPathClean -FailedFilesList $FailedFilesList
                    continue
                }
            }
            $FilesSuccessfullyBackedUpInFolder++
            if ($Failsafe) {
                Invoke-BackupFailsafeChecks -Failsafe $Failsafe -AfterFileSuccess | Out-Null
            }
            $bytesAdded = [decimal]0
            if (Test-Path $LocalFileDestPath -PathType Leaf) {
                $bytesAdded = [decimal](Get-Item $LocalFileDestPath).Length
            }
            if ($OnProgress) {
                & $OnProgress @{
                    Type = "File"
                    Folder = $SourceFolderLeafName
                    File = Split-Path -Leaf $RelativePath
                    FileIndex = $fileIndex
                    FileTotal = $totalFiles
                    BackupDir = $BaseBackupDir
                    BytesAdded = $bytesAdded
                }
            }
        } else {
            $FilesFailedInFolder++
            Add-FailedFileLogEntry -BackupDir $BaseBackupDir -RemotePath $RemoteFileFullPathClean -FailedFilesList $FailedFilesList
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

function Get-SourceFolderForRemoteFile {
    param(
        [string]$RemotePath,
        [string[]]$KnownFolders
    )
    $clean = $RemotePath.Trim().TrimStart('/')
    foreach ($folder in ($KnownFolders | Sort-Object { $_.Length } -Descending)) {
        $fp = $folder.Trim().TrimStart('/')
        if ($clean -eq $fp -or $clean.StartsWith("$fp/")) {
            return $folder
        }
    }
    if ($clean -match '^sdcard/([^/]+)') {
        return "sdcard/$($Matches[1])"
    }
    return "sdcard"
}

function Invoke-RetryFailedFilesPass {
    param(
        [string]$DeviceID,
        [string]$BackupDir,
        [string[]]$FailedPaths,
        [string[]]$KnownFolders,
        [System.Collections.Generic.HashSet[string]]$AlreadyTransferredFiles,
        [string]$StateFilePath,
        [scriptblock]$OnProgress,
        [scriptblock]$ShouldCancel,
        [scriptblock]$WaitIfPaused,
        [hashtable]$Failsafe,
        [System.Collections.Generic.List[string]]$FailedFilesList
    )
    if ($FailedPaths.Count -eq 0) { return @{ Retried = 0; Succeeded = 0; StillFailed = 0 } }

    Publish-ProgressLocal -OnProgress $OnProgress -Data @{
        Type = "Phase"
        Message = "Retrying $($FailedPaths.Count) failed file(s)..."
    }

    $succeeded = 0
    $stillFailed = @()
    $grouped = @{}
    foreach ($remotePath in $FailedPaths) {
        $clean = $remotePath.Trim()
        if ([string]::IsNullOrWhiteSpace($clean)) { continue }
        $folderKey = Get-SourceFolderForRemoteFile -RemotePath $clean -KnownFolders $KnownFolders
        $normalizedPath = if ($clean.StartsWith('/')) { $clean } else { '/' + $clean.TrimStart('/') }
        if (-not $grouped.ContainsKey($folderKey)) { $grouped[$folderKey] = @() }
        $grouped[$folderKey] += $normalizedPath
    }

    foreach ($folderKey in @($grouped.Keys)) {
        if (& $ShouldCancel) { break }
        $paths = @($grouped[$folderKey])
        $result = Backup-FolderContents `
            -DeviceID $DeviceID `
            -SourceFolderOnDevice $folderKey `
            -BaseBackupDir $BackupDir `
            -AlreadyTransferredFiles $AlreadyTransferredFiles `
            -StateFilePath $StateFilePath `
            -OnProgress $OnProgress `
            -ShouldCancel $ShouldCancel `
            -WaitIfPaused $WaitIfPaused `
            -Failsafe $Failsafe `
            -FailedFilesList $FailedFilesList `
            -FilesToPull $paths

        $succeeded += $result.FilesBackedUp
        foreach ($p in $paths) {
            $norm = $p.Trim()
            if (-not $AlreadyTransferredFiles.Contains($norm)) {
                $stillFailed += $norm
            }
        }
    }

    $logPath = Join-Path $BackupDir $Script:FailedFilesLogName
    if ($stillFailed.Count -eq 0) {
        if (Test-Path $logPath) { Remove-Item $logPath -Force -ErrorAction SilentlyContinue }
    } else {
        Set-Content -Path $logPath -Value $stillFailed -Encoding UTF8 -Force
    }

    return @{
        Retried = $FailedPaths.Count
        Succeeded = $succeeded
        StillFailed = $stillFailed.Count
    }
}

function Publish-ProgressLocal {
    param([scriptblock]$OnProgress, $Data)
    if ($OnProgress) { & $OnProgress $Data }
}

function Invoke-BackupEngine {
    param(
        [string]$DeviceSerial,
        [string]$DeviceModel,
        [string[]]$SelectedFolders,
        [string[]]$UncheckedFolders = @(),
        [string]$BackupBaseDir,
        [scriptblock]$OnProgress,
        [scriptblock]$ShouldCancel = { $false },
        [scriptblock]$WaitIfPaused = {},
        [ref]$EstimatedTotalGB = ([ref]-1),
        [ref]$EstimatedTotalBytes = ([ref][decimal]0),
        [ref]$TransferStartTime = ([ref]$null),
        [ref]$CurrentBackupDir = ([ref]$null),
        [switch]$SkipSizeCalculation,
        [switch]$RetryFailedOnly
    )

    function Publish-Progress {
        param($Data)
        if ($OnProgress) { & $OnProgress $Data }
    }

    function New-CancelledResult {
        param(
            [string]$BackupDir,
            [int]$TotalNew = 0,
            [int]$TotalSkipped = 0,
            [int]$TotalFailed = 0,
            [array]$SkippedFolders = @()
        )
        $diskBytes = if ($BackupDir) { Get-LocalBackupSizeBytes -Path $BackupDir } else { [decimal]0 }
        Publish-Progress @{
            Type = "Summary"
            Message = "Backup cancelled."
            Detail = "$TotalNew new files, $TotalSkipped skipped, $(Format-BytesHuman $diskBytes) on disk before stop"
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

    function Test-ShouldStop {
        & $WaitIfPaused | Out-Null
        return [bool](& $ShouldCancel)
    }

    if ([string]::IsNullOrWhiteSpace($DeviceSerial)) { throw "No device was selected for backup." }
    if ([string]::IsNullOrWhiteSpace($DeviceModel)) { $DeviceModel = $DeviceSerial }
    if ([string]::IsNullOrWhiteSpace($BackupBaseDir)) { throw "Backup destination folder is empty." }
    if ($SelectedFolders.Count -eq 0) { throw "No folders were selected for backup." }

    $DeviceID = $DeviceSerial
    $SanitizedDeviceModel = $DeviceModel -replace '[^a-zA-Z0-9_-]', '_'
    $BackupDir = Join-Path $BackupBaseDir "$($SanitizedDeviceModel)_$($DeviceID)"
    $CurrentBackupDir.Value = $BackupDir
    $sessionStart = Get-Date
    $FailedFilesList = New-Object System.Collections.Generic.List[string]
    $lockAcquired = $false

    try {
    if (-not (Test-Path $BackupBaseDir -PathType Container)) {
        New-Item -ItemType Directory -Path $BackupBaseDir -Force -ErrorAction Stop | Out-Null
    }
    if (-not (Test-Path $BackupDir -PathType Container)) {
        New-Item -ItemType Directory -Path $BackupDir -Force -ErrorAction Stop | Out-Null
    }

    New-BackupSessionLock -BackupDir $BackupDir -DeviceSerial $DeviceSerial
    $lockAcquired = $true
    $Script:BackupRunning = $true

    $Failsafe = New-BackupFailsafeState `
        -DeviceSerial $DeviceSerial `
        -BackupBaseDir $BackupBaseDir `
        -BackupDir $BackupDir `
        -OnProgress $OnProgress `
        -ShouldCancel $ShouldCancel

    Publish-Progress @{ Type = "Phase"; Message = "Preparing backup folders..." }

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
        Publish-Progress @{
            Type = "Log"
            Message = "Loaded $($AlreadyTransferredFiles.Count) previously transferred file(s)."
        }
    }

    $FoldersToAttempt = @()
    $SkippedFolders = @()

    if ($RetryFailedOnly) {
        $failedPaths = @(Get-FailedFilesFromLog -BackupDir $BackupDir)
        if ($failedPaths.Count -eq 0) {
            throw "No failed files to retry in this backup folder."
        }
        Publish-Progress @{ Type = "Phase"; Message = "Retrying $($failedPaths.Count) failed file(s) only..." }
        $retryResult = Invoke-RetryFailedFilesPass `
            -DeviceID $DeviceID `
            -BackupDir $BackupDir `
            -FailedPaths $failedPaths `
            -KnownFolders $SelectedFolders `
            -AlreadyTransferredFiles $AlreadyTransferredFiles `
            -StateFilePath $StateFilePath `
            -OnProgress $OnProgress `
            -ShouldCancel $ShouldCancel `
            -WaitIfPaused $WaitIfPaused `
            -Failsafe $Failsafe `
            -FailedFilesList $FailedFilesList

        $TotalNew = [int]$retryResult.Succeeded
        $TotalFailed = [int]$retryResult.StillFailed
        $diskBytes = Get-LocalBackupSizeBytes -Path $BackupDir
        $contactsStatus = Invoke-ContactsVcfCheck `
            -DeviceSerial $DeviceSerial `
            -BackupDir $BackupDir `
            -SearchFolders $SelectedFolders `
            -OnProgress { param($Data) Publish-Progress $Data }
        $summaryMessage = if ($TotalFailed -eq 0) {
            "Retry completed — all failed files recovered."
        } else {
            "Retry finished — $TotalFailed file(s) still failed."
        }
        Publish-Progress @{ Type = "Summary"; Message = $summaryMessage; Detail = "$TotalNew recovered, $TotalFailed still failed" }
        Write-BackupReport -BackupDir $BackupDir -Report @{
            deviceSerial = $DeviceSerial
            deviceModel = $DeviceModel
            startedAt = $sessionStart.ToString('o')
            finishedAt = (Get-Date).ToString('o')
            durationSeconds = [int]((Get-Date) - $sessionStart).TotalSeconds
            mode = 'retry_failed_only'
            newFiles = $TotalNew
            skippedFiles = 0
            failedFiles = $TotalFailed
            diskBytes = [double]$diskBytes
            success = ($TotalFailed -eq 0)
            contacts = @{
                localFound = [bool]$contactsStatus.LocalFound
                deviceFound = [bool]$contactsStatus.DeviceFound
                message = [string]$contactsStatus.Message
            }
        }
        return @{
            Success = ($TotalFailed -eq 0)
            Message = $summaryMessage
            BackupDir = $BackupDir
            NewFiles = $TotalNew
            SkippedFiles = 0
            FailedFiles = $TotalFailed
            DiskBytes = $diskBytes
            SkippedFolders = @()
            RetryMode = $true
            ContactsVcf = @{
                Found = [bool]$contactsStatus.LocalFound
                DeviceFound = [bool]$contactsStatus.DeviceFound
                Message = [string]$contactsStatus.Message
                Level = [string]$contactsStatus.Level
                LocalFileNames = @($contactsStatus.LocalFiles | ForEach-Object { [string]$_.name })
            }
        }
    }

    foreach ($SourceFolder in $SelectedFolders) {
        if (Test-ShouldStop) {
            return (New-CancelledResult -BackupDir $BackupDir -SkippedFolders $SkippedFolders)
        }

        $FolderName = Split-Path -Leaf $SourceFolder
        if ($FolderName.StartsWith(".")) {
            $SkippedFolders += "$SourceFolder (Hidden)"
            Publish-Progress @{ Type = "FolderStatus"; FolderPath = $SourceFolder; Status = "Skipped"; Details = "Hidden folder" }
            continue
        }

        $RemotePath = "/$SourceFolder/"
        $CheckOutput = adb -s $DeviceID shell "ls -d '$RemotePath'" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $FoldersToAttempt += $SourceFolder
            Publish-Progress @{ Type = "FolderStatus"; FolderPath = $SourceFolder; Status = "Ready"; Details = "Found on device" }
        } elseif ($CheckOutput -match "No such file or directory|does not exist") {
            $SkippedFolders += "$SourceFolder (Not Found)"
            Publish-Progress @{ Type = "FolderStatus"; FolderPath = $SourceFolder; Status = "Skipped"; Details = "Not found on device" }
        } else {
            $SkippedFolders += "$SourceFolder (Error)"
            Publish-Progress @{ Type = "FolderStatus"; FolderPath = $SourceFolder; Status = "Skipped"; Details = "Could not verify" }
        }
    }

    foreach ($uncheckedFolder in $UncheckedFolders) {
        Publish-Progress @{
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

    if (-not $SkipSizeCalculation) {
        Publish-Progress @{ Type = "Phase"; Message = "Calculating backup size (this may take a while)..." }
        $totalSizeBytes = [decimal]0
        $sizeCalcOk = $true
        foreach ($folderPathKey in $FoldersToAttempt) {
            if (Test-ShouldStop) {
                return (New-CancelledResult -BackupDir $BackupDir -SkippedFolders $SkippedFolders)
            }
            $folderSize = Get-FolderSizeBytesOnDevice -DeviceID $DeviceID -FolderPathKey $folderPathKey
            if ($null -ne $folderSize) {
                $totalSizeBytes += $folderSize
            } else {
                $sizeCalcOk = $false
            }
        }

        if ($totalSizeBytes -gt 0) {
            $EstimatedTotalGB.Value = $totalSizeBytes / 1GB
            $EstimatedTotalBytes.Value = $totalSizeBytes
            Publish-Progress @{ Type = "Size"; TotalGB = $EstimatedTotalGB.Value }
        } elseif (-not $sizeCalcOk) {
            $EstimatedTotalGB.Value = -1
            Publish-Progress @{
                Type = "Log"
                Message = "Could not calculate total size. Progress will show transferred amount only."
            }
        }
    } else {
        $EstimatedTotalGB.Value = -1
        Publish-Progress @{
            Type = "Log"
            Message = "Skipping size calculation — backup starting immediately."
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

    foreach ($SourceFolderOnDevice in $FoldersToAttempt) {
        if (Test-ShouldStop) {
            return (New-CancelledResult -BackupDir $BackupDir -TotalNew $TotalNew -TotalSkipped $TotalSkipped -TotalFailed $TotalFailed -SkippedFolders $SkippedFolders)
        }

        $folderIndex++
        Publish-Progress @{
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
            -OnProgress $OnProgress `
            -ShouldCancel $ShouldCancel `
            -WaitIfPaused $WaitIfPaused `
            -Failsafe $Failsafe `
            -FailedFilesList $FailedFilesList

        if ($result.Cancelled) {
            $TotalNew += $result.FilesBackedUp
            $TotalSkipped += $result.FilesSkipped
            $TotalFailed += $result.FilesFailed
            Publish-Progress @{
                Type = "FolderDone"
                FolderPath = $SourceFolderOnDevice
                New = $result.FilesBackedUp
                Skipped = $result.FilesSkipped
                Failed = $result.FilesFailed
                Success = $false
            }
            return (New-CancelledResult -BackupDir $BackupDir -TotalNew $TotalNew -TotalSkipped $TotalSkipped -TotalFailed $TotalFailed -SkippedFolders $SkippedFolders)
        }

        $TotalNew += $result.FilesBackedUp
        $TotalSkipped += $result.FilesSkipped
        $TotalFailed += $result.FilesFailed
        if (-not $result.Success -and $result.Message -notlike "No non-hidden files found*") {
            $OverallSuccess = $false
        }

        Publish-Progress @{
            Type = "FolderDone"
            FolderPath = $SourceFolderOnDevice
            New = $result.FilesBackedUp
            Skipped = $result.FilesSkipped
            Failed = $result.FilesFailed
            Success = $result.Success
        }
    }

    if ($FailedFilesList.Count -gt 0 -and -not (Test-ShouldStop)) {
        $retryResult = Invoke-RetryFailedFilesPass `
            -DeviceID $DeviceID `
            -BackupDir $BackupDir `
            -FailedPaths @($FailedFilesList.ToArray()) `
            -KnownFolders $FoldersToAttempt `
            -AlreadyTransferredFiles $AlreadyTransferredFiles `
            -StateFilePath $StateFilePath `
            -OnProgress $OnProgress `
            -ShouldCancel $ShouldCancel `
            -WaitIfPaused $WaitIfPaused `
            -Failsafe $Failsafe `
            -FailedFilesList $FailedFilesList

        $TotalNew += [int]$retryResult.Succeeded
        $TotalFailed = [int]$retryResult.StillFailed
        if ($TotalFailed -gt 0) { $OverallSuccess = $false }
        Publish-Progress @{
            Type = "Log"
            Message = "Retry pass: $($retryResult.Succeeded) recovered, $($retryResult.StillFailed) still failed."
        }
    }

    if ($OverallSuccess -and $TotalFailed -eq 0 -and $folderIndex -eq $FoldersToAttempt.Count) {
        try {
            Add-Content -Path $StateFilePath -Value $Script:CompletionMarker -Encoding UTF8
        } catch { }
    }

    $diskBytes = Get-LocalBackupSizeBytes -Path $BackupDir
    $contactsStatus = Invoke-ContactsVcfCheck `
        -DeviceSerial $DeviceSerial `
        -BackupDir $BackupDir `
        -SearchFolders $SelectedFolders `
        -OnProgress { param($Data) Publish-Progress $Data }

    $summaryMessage = if ($OverallSuccess -and $TotalFailed -eq 0) {
        "Backup completed successfully."
    } elseif ($TotalFailed -gt 0) {
        "Backup finished with $TotalFailed file error(s)."
    } else {
        "Backup finished with warnings."
    }

    Publish-Progress @{
        Type = "Summary"
        Message = $summaryMessage
        Detail = "$TotalNew new files, $TotalSkipped skipped, $(Format-BytesHuman $diskBytes) on disk"
    }

    Write-BackupReport -BackupDir $BackupDir -Report @{
        deviceSerial = $DeviceSerial
        deviceModel = $DeviceModel
        startedAt = $sessionStart.ToString('o')
        finishedAt = (Get-Date).ToString('o')
        durationSeconds = [int]((Get-Date) - $sessionStart).TotalSeconds
        mode = 'full'
        newFiles = $TotalNew
        skippedFiles = $TotalSkipped
        failedFiles = $TotalFailed
        diskBytes = [double]$diskBytes
        success = ($OverallSuccess -and $TotalFailed -eq 0)
        skippedFolders = @($SkippedFolders)
        contacts = @{
            localFound = [bool]$contactsStatus.LocalFound
            deviceFound = [bool]$contactsStatus.DeviceFound
            localCount = @($contactsStatus.LocalFiles).Count
            deviceCount = @($contactsStatus.DeviceFiles).Count
            message = [string]$contactsStatus.Message
        }
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
        CanRetryFailed = ($TotalFailed -gt 0)
        ContactsVcf = @{
            Found = [bool]$contactsStatus.LocalFound
            DeviceFound = [bool]$contactsStatus.DeviceFound
            Message = [string]$contactsStatus.Message
            Level = [string]$contactsStatus.Level
            LocalFileNames = @($contactsStatus.LocalFiles | ForEach-Object { [string]$_.name })
        }
    }

    } finally {
        $Script:BackupRunning = $false
        if ($lockAcquired -and $BackupDir) {
            Remove-BackupSessionLock -BackupDir $BackupDir
        }
    }
}

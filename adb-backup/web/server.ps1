param(
    [int]$Port = 8765,
    [switch]$BindLan
)

$ErrorActionPreference = 'Stop'
trap {
    Write-Warning "Server error: $($_.Exception.Message)"
    continue
}

$corePath = Join-Path (Split-Path -Parent $PSScriptRoot) "lib\BackupCore.ps1"
. $corePath

$publicRoot = Join-Path $PSScriptRoot "public"

$Script:WebState = [hashtable]::Synchronized(@{
    Running = $false
    Paused = $false
    CancelRequested = $false
    Phase = "Ready"
    Detail = ""
    Eta = ""
    Percent = 0
    CurrentGB = 0
    TotalGB = -1
    BackupDir = $null
    Result = $null
    FolderStatuses = @{}
    Logs = New-Object System.Collections.ArrayList
    Events = New-Object System.Collections.ArrayList
    BackupTask = $null
    EstimatedTotalGB = -1
    EstimatedTotalBytes = [decimal]0
    TransferStartTime = $null
    TransferredBytes = [decimal]0
    LastSizeCheckTime = $null
    ActivityStep = "idle"
    ActivityTitle = "Waiting to start a backup"
    ActivityDetail = "Connect your phone via USB, then click Backup Now."
    CurrentFile = ""
    FolderIndex = 0
    FolderTotal = 0
    FileIndex = 0
    FileTotal = 0
    CurrentFolder = ""
    ContactsStatus = $null
})

function Set-WebCorsHeaders {
    param([System.Net.HttpListenerResponse]$Response)
    try {
        $Response.Headers["Access-Control-Allow-Origin"] = "*"
        $Response.Headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, OPTIONS"
        $Response.Headers["Access-Control-Allow-Headers"] = "Content-Type"
    } catch { }
}

function Write-JsonResponse {
    param(
        [System.Net.HttpListenerResponse]$Response,
        $Data,
        [int]$StatusCode = 200
    )
    try {
        $json = $Data | ConvertTo-Json -Depth 8 -Compress
    } catch {
        $json = '{"error":"Failed to serialize response."}'
        $StatusCode = 500
    }
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        Set-WebCorsHeaders -Response $Response
        $Response.StatusCode = $StatusCode
        $Response.ContentType = "application/json; charset=utf-8"
        $Response.ContentLength64 = $bytes.Length
        $Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $Response.OutputStream.Close()
    } catch { }
}

function Read-RequestBody {
    param([System.Net.HttpListenerRequest]$Request)
    if (-not $Request.HasEntityBody) { return $null }
    $reader = New-Object System.IO.StreamReader($Request.InputStream, $Request.ContentEncoding)
    $text = $reader.ReadToEnd()
    $reader.Close()
    if ([string]::IsNullOrWhiteSpace($text)) { return $null }
    return $text | ConvertFrom-Json
}

function Add-WebEvent {
    param($Data)
    try {
        $json = $Data | ConvertTo-Json -Depth 8 -Compress
        [void]$Script:WebState.Events.Add(@{
            Id = [Guid]::NewGuid().ToString()
            Time = (Get-Date).ToString("o")
            Data = $Data
            Json = $json
        })
        while ($Script:WebState.Events.Count -gt 500) {
            $Script:WebState.Events.RemoveAt(0)
        }
    } catch { }
}

function Set-WebActivity {
    param(
        [string]$Step,
        [string]$Title,
        [string]$Detail = "",
        [string]$CurrentFile = "",
        [string]$CurrentFolder = "",
        [int]$FolderIndex = 0,
        [int]$FolderTotal = 0,
        [int]$FileIndex = 0,
        [int]$FileTotal = 0
    )
    $Script:WebState.ActivityStep = $Step
    $Script:WebState.ActivityTitle = $Title
    $Script:WebState.ActivityDetail = $Detail
    $Script:WebState.CurrentFile = $CurrentFile
    $Script:WebState.CurrentFolder = $CurrentFolder
    $Script:WebState.FolderIndex = $FolderIndex
    $Script:WebState.FolderTotal = $FolderTotal
    $Script:WebState.FileIndex = $FileIndex
    $Script:WebState.FileTotal = $FileTotal
}

function Update-WebProgress {
    param($Data)
    try {
        Add-WebEvent $Data
        switch ($Data.Type) {
        "Phase" {
            $Script:WebState.Phase = [string]$Data.Message
            $step = "working"
            $msg = [string]$Data.Message
            if ($msg -match "Preparing") { $step = "preparing" }
            elseif ($msg -match "Calculating|size") { $step = "sizing" }
            Set-WebActivity -Step $step -Title $msg -Detail "Please wait..."
        }
        "Size" {
            $Script:WebState.TotalGB = [double]$Data.TotalGB
            $Script:WebState.EstimatedTotalGB = [double]$Data.TotalGB
            $Script:WebState.EstimatedTotalBytes = [decimal]($Data.TotalGB * 1GB)
            $Script:WebState.Detail = "Estimated total: $($Script:WebState.TotalGB.ToString('N2')) GB"
            $Script:WebState.Eta = "Estimating time remaining..."
            $Script:WebState.Percent = 0
            Set-WebActivity -Step "sizing" -Title "Size calculated" -Detail $Script:WebState.Detail
        }
        "FolderStart" {
            $folderName = Split-Path -Leaf $Data.FolderPath
            $Script:WebState.Phase = "Backing up folder $($Data.Index) of $($Data.Total): $folderName"
            $Script:WebState.FolderStatuses[[string]$Data.FolderPath] = @{
                Status = "Backing up..."
                Details = [string]$Data.Message
            }
            if ($Data.Index -eq 1) {
                $Script:WebState.TransferStartTime = $null
                $Script:WebState.Eta = "Estimating time remaining..."
            }
            Set-WebActivity `
                -Step "copying" `
                -Title "Copying folder: $folderName" `
                -Detail "Folder $($Data.Index) of $($Data.Total) on device" `
                -CurrentFolder $folderName `
                -FolderIndex ([int]$Data.Index) `
                -FolderTotal ([int]$Data.Total)
        }
        "FolderDone" {
            $details = "$($Data.New) new, $($Data.Skipped) skipped"
            if ($Data.Failed -gt 0) { $details += ", $($Data.Failed) failed" }
            $Script:WebState.FolderStatuses[[string]$Data.FolderPath] = @{
                Status = $(if ($Data.Success) { "Done" } else { "Issues" })
                Details = $details
            }
            $folderName = Split-Path -Leaf $Data.FolderPath
            Set-WebActivity `
                -Step "copying" `
                -Title "Finished folder: $folderName" `
                -Detail $details `
                -CurrentFolder $folderName
        }
        "FolderStatus" {
            $Script:WebState.FolderStatuses[[string]$Data.FolderPath] = @{
                Status = [string]$Data.Status
                Details = [string]$Data.Details
            }
            if ($Data.Status -eq "Skipped") {
                Set-WebActivity `
                    -Step "preparing" `
                    -Title "Skipped: $(Split-Path -Leaf $Data.FolderPath)" `
                    -Detail ([string]$Data.Details)
            }
        }
        "FileStart" {
            Set-WebActivity `
                -Step "copying" `
                -Title "Copying files in $($Data.Folder)" `
                -Detail "Starting file $($Data.FileIndex) of $($Data.FileTotal) in this folder" `
                -CurrentFile ([string]$Data.File) `
                -CurrentFolder ([string]$Data.Folder) `
                -FileIndex ([int]$Data.FileIndex) `
                -FileTotal ([int]$Data.FileTotal)
        }
        "File" {
            $Script:WebState.Phase = "Folder '$($Data.Folder)': file $($Data.FileIndex) / $($Data.FileTotal)"
            if (-not $Script:WebState.TransferStartTime) {
                $Script:WebState.TransferStartTime = Get-Date
            }

            if ($Data.BytesAdded -gt 0) {
                $Script:WebState.TransferredBytes += [decimal]$Data.BytesAdded
            }

            $shouldScanDisk = (-not $Script:WebState.LastSizeCheckTime) -or
                (((Get-Date) - $Script:WebState.LastSizeCheckTime).TotalSeconds -ge 3)
            if ($shouldScanDisk -and $Data.BackupDir) {
                $Script:WebState.TransferredBytes = Get-LocalBackupSizeBytes -Path $Data.BackupDir
                $Script:WebState.LastSizeCheckTime = Get-Date
            }

            $currentBytes = $Script:WebState.TransferredBytes
            $currentGB = $currentBytes / 1GB
            $Script:WebState.CurrentGB = [double]$currentGB
            if ($Script:WebState.EstimatedTotalGB -gt 0) {
                $percent = [Math]::Max(0, [Math]::Min(100, ($currentGB / $Script:WebState.EstimatedTotalGB) * 100))
                $Script:WebState.Percent = [double]$percent
                $Script:WebState.Detail = "{0:N2} GB / {1:N2} GB ({2:P0})" -f $currentGB, $Script:WebState.EstimatedTotalGB, ($percent / 100)
            } else {
                $Script:WebState.Percent = -1
                $Script:WebState.Detail = "Transferred: $($currentGB.ToString('N2')) GB"
            }
            $Script:WebState.Eta = Get-BackupEtaText -CurrentBytes $currentBytes -TotalBytes $Script:WebState.EstimatedTotalBytes -StartTime $Script:WebState.TransferStartTime
            Set-WebActivity `
                -Step "copying" `
                -Title "Copying files in $($Data.Folder)" `
                -Detail "File $($Data.FileIndex) of $($Data.FileTotal) in this folder · $($Script:WebState.Detail)" `
                -CurrentFile ([string]$Data.File) `
                -CurrentFolder ([string]$Data.Folder) `
                -FileIndex ([int]$Data.FileIndex) `
                -FileTotal ([int]$Data.FileTotal)
        }
        "Summary" {
            $Script:WebState.Phase = [string]$Data.Message
            $Script:WebState.Detail = [string]$Data.Detail
            $Script:WebState.Eta = "Complete"
            $Script:WebState.Percent = 100
            Set-WebActivity -Step "complete" -Title ([string]$Data.Message) -Detail ([string]$Data.Detail) -CurrentFile ""
        }
        "Log" {
            [void]$Script:WebState.Logs.Add("[$(Get-Date -Format 'HH:mm:ss')] $($Data.Message)")
            while ($Script:WebState.Logs.Count -gt 200) {
                $Script:WebState.Logs.RemoveAt(0)
            }
        }
        "Failsafe" {
            $code = [string]$Data.Code
            $msg = [string]$Data.Message
            [void]$Script:WebState.Logs.Add("[$(Get-Date -Format 'HH:mm:ss')] [failsafe] $msg")
            switch ($code) {
                'device_lost' {
                    $Script:WebState.Paused = $true
                    Set-WebActivity -Step "paused" -Title "Phone disconnected" -Detail $msg
                }
                'disk_low' {
                    $Script:WebState.Paused = $true
                    Set-WebActivity -Step "paused" -Title "Disk space low" -Detail $msg
                }
                'device_back' {
                    $Script:WebState.Paused = $false
                    Set-WebActivity -Step "copying" -Title "Phone reconnected" -Detail $msg
                }
                'disk_ok' {
                    $Script:WebState.Paused = $false
                    Set-WebActivity -Step "copying" -Title "Disk space OK" -Detail $msg
                }
                'adb_restart' {
                    Set-WebActivity -Step "working" -Title "Restarting ADB" -Detail $msg
                }
            }
        }
        "ContactsCheck" {
            $Script:WebState.ContactsStatus = @{
                found = [bool]$Data.Found
                deviceFound = [bool]$Data.DeviceFound
                message = [string]$Data.Message
                level = [string]$Data.Level
                localCount = [int]$Data.LocalCount
                localFileNames = @($Data.LocalFileNames)
            }
            [void]$Script:WebState.Logs.Add("[$(Get-Date -Format 'HH:mm:ss')] [contacts] $($Data.Message)")
            while ($Script:WebState.Logs.Count -gt 200) {
                $Script:WebState.Logs.RemoveAt(0)
            }
        }
    }
    } catch { }
}

function Get-WebStatus {
    $folderStatuses = @{}
    foreach ($key in @($Script:WebState.FolderStatuses.Keys)) {
        $entry = $Script:WebState.FolderStatuses[$key]
        if ($null -eq $entry) { continue }
        $folderStatuses[[string]$key] = @{
            status = [string]$entry.Status
            details = [string]$entry.Details
        }
    }
    $canRetry = $false
    $interrupted = @()
    if (-not $Script:WebState.Running) {
        $interrupted = @(Get-InterruptedBackupsForWeb)
        if ($Script:WebState.Result) {
            $failed = [int](Get-OutcomeValue $Script:WebState.Result 'FailedFiles')
            $canRetry = ($failed -gt 0) -or [bool](Get-OutcomeValue $Script:WebState.Result 'CanRetryFailed')
        }
        if (-not $canRetry -and $Script:WebState.BackupDir) {
            $canRetry = (Get-FailedFilesFromLog -BackupDir $Script:WebState.BackupDir).Count -gt 0
        }
    }
    return @{
        running = [bool]$Script:WebState.Running
        paused = [bool]$Script:WebState.Paused
        phase = [string]$Script:WebState.Phase
        detail = [string]$Script:WebState.Detail
        eta = [string]$Script:WebState.Eta
        percent = [double]$Script:WebState.Percent
        currentGB = [double]$Script:WebState.CurrentGB
        totalGB = [double]$Script:WebState.TotalGB
        backupDir = $Script:WebState.BackupDir
        folderStatuses = $folderStatuses
        logs = @($Script:WebState.Logs)
        result = $Script:WebState.Result
        activityStep = $(if ($Script:WebState.Paused) { "paused" } else { [string]$Script:WebState.ActivityStep })
        activityTitle = $(if ($Script:WebState.Paused) { "Backup paused" } else { [string]$Script:WebState.ActivityTitle })
        activityDetail = $(if ($Script:WebState.Paused) { "Waiting for phone or disk space..." } else { [string]$Script:WebState.ActivityDetail })
        currentFile = [string]$Script:WebState.CurrentFile
        currentFolder = [string]$Script:WebState.CurrentFolder
        folderIndex = [int]$Script:WebState.FolderIndex
        folderTotal = [int]$Script:WebState.FolderTotal
        fileIndex = [int]$Script:WebState.FileIndex
        fileTotal = [int]$Script:WebState.FileTotal
        canRetryFailed = $canRetry
        interruptedBackups = $interrupted
        contactsStatus = $Script:WebState.ContactsStatus
    }
}

function Get-InterruptedBackupsForWeb {
    $settings = Get-BackupSettings
    $baseDir = [string]$settings.BackupBaseDir
    return @(Get-InterruptedBackups -BackupBaseDir $baseDir)
}

function Reset-WebBackupState {
    $Script:WebState.Running = $false
    $Script:WebState.Paused = $false
    $Script:WebState.CancelRequested = $false
    $Script:WebState.Phase = "Ready"
    $Script:WebState.Detail = ""
    $Script:WebState.Eta = ""
    $Script:WebState.Percent = 0
    $Script:WebState.CurrentGB = 0
    $Script:WebState.TotalGB = -1
    $Script:WebState.BackupDir = $null
    $Script:WebState.Result = $null
    $Script:WebState.FolderStatuses = @{}
    $Script:WebState.Logs.Clear()
    $Script:WebState.Events.Clear()
    $Script:WebState.EstimatedTotalGB = -1
    $Script:WebState.EstimatedTotalBytes = [decimal]0
    $Script:WebState.TransferStartTime = $null
    $Script:WebState.TransferredBytes = [decimal]0
    $Script:WebState.LastSizeCheckTime = $null
    $Script:WebState.BackupTask = $null
    Set-WebActivity `
        -Step "idle" `
        -Title "Waiting to start a backup" `
        -Detail "Connect your phone via USB, then click Backup Now." `
        -CurrentFile ""
    $Script:WebState.ContactsStatus = $null
}

function Cleanup-BackupJob {
    param($Job)
    if (-not $Job) { return }
    try {
        if ($Job.PowerShell) {
            if ($Job.Handle -and -not $Job.Handle.IsCompleted) {
                try { $Job.PowerShell.Stop() } catch { }
            }
            $Job.PowerShell.Dispose()
        }
    } catch { }
    try {
        if ($Job.Runspace) {
            $Job.Runspace.Close()
            $Job.Runspace.Dispose()
        }
    } catch { }
}

function Get-OutcomeValue {
    param($Outcome, [string]$Name)
    if ($null -eq $Outcome) { return $null }
    if ($Outcome -is [System.Collections.IDictionary]) {
        return $Outcome[$Name]
    }
    return $Outcome.$Name
}

function Complete-BackupJob {
    param($Job)
    if (-not $Job -or $Job.Completed) { return }

    $Job.Completed = $true
    $rawOutcome = $null

    try {
        if ($Job.Handle) {
            $rawOutcome = $Job.PowerShell.EndInvoke($Job.Handle)
        }
    } catch {
        $rawOutcome = @{
            Ok = $false
            Error = $_.Exception.Message
            BackupDir = $Script:WebState.BackupDir
        }
    } finally {
        Cleanup-BackupJob $Job
        $Script:WebState.BackupTask = $null
    }

    $outcome = $rawOutcome
    if ($outcome -is [array] -and $outcome.Count -gt 0) {
        $outcome = $outcome[-1]
    }

    $ok = Get-OutcomeValue $outcome 'Ok'
    $result = Get-OutcomeValue $outcome 'Result'
    $backupDir = Get-OutcomeValue $outcome 'BackupDir'
    $estimatedTotalGB = Get-OutcomeValue $outcome 'EstimatedTotalGB'
    $errorText = Get-OutcomeValue $outcome 'Error'

    if ($ok -and $result) {
        $Script:WebState.Result = $result
        if ($backupDir) { $Script:WebState.BackupDir = $backupDir }
        if ($estimatedTotalGB -gt 0) {
            $Script:WebState.TotalGB = [double]$estimatedTotalGB
        }
        $wasCancelled = [bool](Get-OutcomeValue $result 'Cancelled')
        $contactsVcf = Get-OutcomeValue $result 'ContactsVcf'
        if ($contactsVcf) {
            $Script:WebState.ContactsStatus = @{
                found = [bool](Get-OutcomeValue $contactsVcf 'Found')
                deviceFound = [bool](Get-OutcomeValue $contactsVcf 'DeviceFound')
                message = [string](Get-OutcomeValue $contactsVcf 'Message')
                level = [string](Get-OutcomeValue $contactsVcf 'Level')
                localFileNames = @($(Get-OutcomeValue $contactsVcf 'LocalFileNames'))
            }
        }
        if ($wasCancelled) {
            Set-WebActivity -Step "issues" -Title "Backup cancelled" -Detail "Partial backup was kept on disk." -CurrentFile ""
        }
    } elseif ($errorText) {
        $Script:WebState.Result = @{
            Success = $false
            Message = "Backup failed: $errorText"
            BackupDir = $backupDir
            NewFiles = 0
            SkippedFiles = 0
            FailedFiles = 0
            DiskBytes = 0
        }
        $Script:WebState.Phase = $Script:WebState.Result.Message
    } elseif ($Script:WebState.CancelRequested) {
        $Script:WebState.Result = @{
            Success = $false
            Cancelled = $true
            Message = "Backup cancelled."
            BackupDir = $Script:WebState.BackupDir
            NewFiles = 0
            SkippedFiles = 0
            FailedFiles = 0
            DiskBytes = 0
        }
        Set-WebActivity -Step "issues" -Title "Backup cancelled" -Detail "Partial backup was kept on disk." -CurrentFile ""
    }

    $Script:WebState.Running = $false
    $Script:WebState.Paused = $false
    $Script:WebState.CancelRequested = $false
    if ($Script:WebState.Percent -lt 0) {
        $Script:WebState.Percent = 100
    }
}

function Drain-BackupEventQueue {
    try {
        if (-not $Script:WebState.BackupTask) { return }

        $job = $Script:WebState.BackupTask
        $shared = $job.Shared
        if ($shared) {
            $shared.CancelRequested = $Script:WebState.CancelRequested
            $shared.Paused = $Script:WebState.Paused
            $item = $null
            $drained = 0
            while ($shared.EventQueue.TryDequeue([ref]$item) -and $drained -lt 25) {
                Update-WebProgress $item
                $drained++
            }
        }

        if ($job.Handle -and $job.Handle.IsCompleted) {
            Complete-BackupJob $job
        }
    } catch {
        Write-Warning "Backup queue error: $($_.Exception.Message)"
        $Script:WebState.Running = $false
        $Script:WebState.BackupTask = $null
    }
}

function Start-WebBackupJob {
    param(
        [string]$DeviceSerial,
        [string]$DeviceModel,
        [string[]]$SelectedFolders,
        [string[]]$UncheckedFolders,
        [string]$BackupBaseDir,
        [switch]$SkipSizeCalculation,
        [switch]$RetryFailedOnly
    )

    if ($Script:WebState.Running) {
        throw "A backup is already running."
    }

    Reset-WebBackupState
    $Script:WebState.Running = $true
    $Script:WebState.Phase = "Starting..."
    Set-WebActivity -Step "preparing" -Title "Starting backup..." -Detail "Initializing backup job on this PC."

    $eventQueue = New-Object System.Collections.Concurrent.ConcurrentQueue[object]
    $shared = [hashtable]::Synchronized(@{
        CancelRequested = $false
        Paused = $false
        EventQueue = $eventQueue
    })

    $Script:WebState.CancelRequested = $false
    $Script:WebState.Paused = $false

    $runspace = [runspacefactory]::CreateRunspace()
    $runspace.Open()
    $runspace.SessionStateProxy.SetVariable('corePath', $corePath)
    $runspace.SessionStateProxy.SetVariable('shared', $shared)
    $runspace.SessionStateProxy.SetVariable('DeviceSerial', $DeviceSerial)
    $runspace.SessionStateProxy.SetVariable('DeviceModel', $DeviceModel)
    $runspace.SessionStateProxy.SetVariable('SelectedFolders', $SelectedFolders)
    $runspace.SessionStateProxy.SetVariable('UncheckedFolders', $UncheckedFolders)
    $runspace.SessionStateProxy.SetVariable('BackupBaseDir', $BackupBaseDir)
    $runspace.SessionStateProxy.SetVariable('SkipSizeCalculation', [bool]$SkipSizeCalculation)
    $runspace.SessionStateProxy.SetVariable('RetryFailedOnly', [bool]$RetryFailedOnly)

    $powershell = [powershell]::Create()
    $powershell.Runspace = $runspace
    [void]$powershell.AddScript({
        . $corePath

        $estGbLocal = -1
        $estBytesLocal = [decimal]0
        $transferStartLocal = $null
        $backupDirLocal = $null

        try {
            $result = Invoke-BackupEngine `
                -DeviceSerial $DeviceSerial `
                -DeviceModel $DeviceModel `
                -SelectedFolders $SelectedFolders `
                -UncheckedFolders $UncheckedFolders `
                -BackupBaseDir $BackupBaseDir `
                -SkipSizeCalculation:$SkipSizeCalculation `
                -RetryFailedOnly:$RetryFailedOnly `
                -OnProgress {
                    param($Data)
                    $shared.EventQueue.Enqueue($Data) | Out-Null
                } `
                -ShouldCancel { [bool]$shared.CancelRequested } `
                -WaitIfPaused {
                    while ($shared.Paused -and -not $shared.CancelRequested) {
                        Start-Sleep -Milliseconds 200
                    }
                } `
                -EstimatedTotalGB ([ref]$estGbLocal) `
                -EstimatedTotalBytes ([ref]$estBytesLocal) `
                -TransferStartTime ([ref]$transferStartLocal) `
                -CurrentBackupDir ([ref]$backupDirLocal)

            return @{
                Ok = $true
                Result = $result
                BackupDir = $backupDirLocal
                EstimatedTotalGB = $estGbLocal
            }
        } catch {
            return @{
                Ok = $false
                Error = $_.Exception.Message
                BackupDir = $backupDirLocal
            }
        }
    })

    $handle = $powershell.BeginInvoke()
    $Script:WebState.BackupTask = @{
        PowerShell = $powershell
        Handle = $handle
        Runspace = $runspace
        Shared = $shared
        Completed = $false
    }
}

function Serve-StaticFile {
    param(
        [System.Net.HttpListenerResponse]$Response,
        [string]$FilePath
    )
    if (-not (Test-Path $FilePath -PathType Leaf)) {
        $Response.StatusCode = 404
        $Response.Close()
        return
    }
    $ext = [System.IO.Path]::GetExtension($FilePath).ToLowerInvariant()
    $contentType = switch ($ext) {
        ".html" { "text/html; charset=utf-8" }
        ".css"  { "text/css; charset=utf-8" }
        ".js"   { "application/javascript; charset=utf-8" }
        ".json" { "application/json; charset=utf-8" }
        ".svg"  { "image/svg+xml" }
        default { "application/octet-stream" }
    }
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    Set-WebCorsHeaders -Response $Response
    $Response.StatusCode = 200
    $Response.ContentType = $contentType
    $Response.ContentLength64 = $bytes.Length
    $Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $Response.OutputStream.Close()
}

function Test-SafeLocalPath {
    param([string]$Path)
    if ([string]::IsNullOrWhiteSpace($Path)) { return $false }
    try {
        $full = [System.IO.Path]::GetFullPath($Path.Trim())
    } catch {
        return $false
    }
    if ($full -match '[<>|?*]') { return $false }
    return $true
}

function Get-ReadyApiPayload {
    param(
        [string]$DeviceSerial = "",
        [string]$BackupBaseDir = ""
    )
    $settings = Get-BackupSettings
    if ([string]::IsNullOrWhiteSpace($BackupBaseDir)) {
        $BackupBaseDir = [string]$settings.BackupBaseDir
    }
    $readiness = Get-BackupReadiness `
        -DeviceSerial $DeviceSerial `
        -BackupBaseDir $BackupBaseDir `
        -SelectedFolders @($settings.BackupFolders) `
        -BackupBusy:$Script:WebState.Running

    $devicePayload = $null
    if ($readiness.device) {
        $d = $readiness.device
        $devicePayload = @{
            serialNumber = [string]$d.SerialNumber
            model = [string]$d.Model
            displayName = [string]$d.DisplayName
        }
    }

    return @{
        ready = [bool]$readiness.ready
        checks = @($readiness.checks)
        device = $devicePayload
        backupBaseDir = [string]$readiness.backupBaseDir
        folderCount = @($readiness.selectedFolders).Count
        running = [bool]$Script:WebState.Running
        interruptedBackups = @(Get-InterruptedBackupsForWeb)
    }
}

function Handle-ApiRequest {
    param(
        [System.Net.HttpListenerContext]$Context
    )

    $request = $Context.Request
    $response = $Context.Response
    $path = $request.Url.AbsolutePath.TrimEnd('/')
    if ([string]::IsNullOrWhiteSpace($path)) { $path = "/" }

    try {
        if ($path -eq "/api/ready" -and $request.HttpMethod -eq "GET") {
            $deviceSerial = [string]$request.QueryString["device"]
            $backupBaseDir = [string]$request.QueryString["path"]
            Write-JsonResponse -Response $response -Data (Get-ReadyApiPayload -DeviceSerial $deviceSerial -BackupBaseDir $backupBaseDir)
            return
        }

        if ($path -eq "/api/devices" -and $request.HttpMethod -eq "GET") {
            if (-not (Test-AdbAvailable)) {
                Write-JsonResponse -Response $response -Data @{ error = "ADB not found. Install platform-tools first." } -StatusCode 503
                return
            }
            $devices = @(Get-ConnectedDevices)
            Write-JsonResponse -Response $response -Data @{ devices = $devices }
            return
        }

        if ($path -eq "/api/settings" -and $request.HttpMethod -eq "GET") {
            Write-JsonResponse -Response $response -Data (Get-BackupSettings)
            return
        }

        if ($path -eq "/api/settings" -and $request.HttpMethod -eq "PUT") {
            $body = Read-RequestBody -Request $request
            if (-not $body) { throw "Request body required." }
            $baseDir = [string]$body.backupBaseDir
            $folders = @($body.backupFolders | ForEach-Object { Normalize-DeviceFolderPath $_ } | Where-Object { $_ })
            if ($folders.Count -eq 0) { throw "At least one folder is required." }
            $destCheck = Test-BackupDestinationPath -Path $baseDir
            if (-not $destCheck.Ok) {
                throw ($destCheck.Issues -join " ")
            }
            Save-BackupSettings -BackupBaseDir $destCheck.Path -BackupFolders $folders
            Write-JsonResponse -Response $response -Data @{ ok = $true; backupBaseDir = $destCheck.Path }
            return
        }

        if ($path -eq "/api/folders" -and $request.HttpMethod -eq "GET") {
            $device = $request.QueryString["device"]
            $folderPath = $request.QueryString["path"]
            if ([string]::IsNullOrWhiteSpace($device)) { throw "device query parameter required." }
            if ([string]::IsNullOrWhiteSpace($folderPath)) { $folderPath = "sdcard" }
            $folderPath = Normalize-DeviceFolderPath $folderPath
            if (-not $folderPath) { $folderPath = "sdcard" }
            $subfolders = @(Get-DeviceSubfolders -DeviceID $device -DeviceFolderPath $folderPath)
            $items = $subfolders | ForEach-Object {
                @{ name = (Split-Path -Leaf $_); path = $_ }
            }
            Write-JsonResponse -Response $response -Data @{
                currentPath = $folderPath
                parentPath = $(if ($folderPath -eq "sdcard") { $null } else {
                    $parent = Split-Path $folderPath -Parent
                    if ([string]::IsNullOrWhiteSpace($parent)) { "sdcard" } else { $parent.Replace('\', '/') }
                })
                folders = $items
            }
            return
        }

        if ($path -eq "/api/folders/sizes" -and $request.HttpMethod -eq "POST") {
            $body = Read-RequestBody -Request $request
            if (-not $body) { throw "Request body required." }
            $device = [string]$body.device
            $folders = @($body.folders | ForEach-Object { [string]$_ })
            if ([string]::IsNullOrWhiteSpace($device)) { throw "device required." }
            if ($folders.Count -eq 0) { throw "folders required." }

            $sizes = @{}
            $total = [decimal]0
            $hasUnknown = $false
            foreach ($folder in $folders) {
                $size = Get-FolderSizeBytesOnDevice -DeviceID $device -FolderPathKey $folder
                if ($null -ne $size) {
                    $sizes[$folder] = @{
                        bytes = [double]$size
                        text = (Format-BytesHuman $size)
                    }
                    $total += $size
                } else {
                    $sizes[$folder] = @{ bytes = $null; text = "Unknown" }
                    $hasUnknown = $true
                }
            }
            Write-JsonResponse -Response $response -Data @{
                sizes = $sizes
                totalBytes = [double]$total
                totalText = $(if ($hasUnknown) { "$(Format-BytesHuman $total)+" } else { Format-BytesHuman $total })
                hasUnknown = $hasUnknown
            }
            return
        }

        if ($path -eq "/api/disk-space" -and $request.HttpMethod -eq "GET") {
            $dest = $request.QueryString["path"]
            $bytesText = $request.QueryString["bytes"]
            if ([string]::IsNullOrWhiteSpace($dest)) { throw "path query parameter required." }
            $requiredBytes = [decimal]0
            if (-not [string]::IsNullOrWhiteSpace($bytesText)) {
                [decimal]::TryParse($bytesText, [ref]$requiredBytes) | Out-Null
            }
            $check = Test-BackupDiskSpace -DestinationPath $dest -RequiredBytes $requiredBytes
            Write-JsonResponse -Response $response -Data @{
                ok = [bool]$check.Ok
                freeBytes = [double]$check.FreeBytes
                freeText = (Format-BytesHuman $check.FreeBytes)
                requiredBytes = [double]$check.RequiredBytes
                requiredWithBuffer = [double]$check.RequiredWithBuffer
                requiredWithBufferText = (Format-BytesHuman $check.RequiredWithBuffer)
            }
            return
        }

        if ($path -eq "/api/backup/status" -and $request.HttpMethod -eq "GET") {
            Write-JsonResponse -Response $response -Data (Get-WebStatus)
            return
        }

        if ($path -eq "/api/backup/auto" -and $request.HttpMethod -eq "POST") {
            if ($Script:WebState.Running) { throw "Backup already running." }

            $body = Read-RequestBody -Request $request
            $deviceSerial = if ($body) { [string]$body.deviceSerial } else { "" }
            $backupBaseDir = if ($body) { [string]$body.backupBaseDir } else { "" }

            $settings = Get-BackupSettings
            if ([string]::IsNullOrWhiteSpace($backupBaseDir)) {
                $backupBaseDir = [string]$settings.BackupBaseDir
            }
            $allFolders = @($settings.BackupFolders | ForEach-Object { Normalize-DeviceFolderPath $_ } | Where-Object { $_ })
            if ($allFolders.Count -eq 0) { throw "No folders configured. Add folders in Advanced settings." }

            $readiness = Get-BackupReadiness `
                -DeviceSerial $deviceSerial `
                -BackupBaseDir $backupBaseDir `
                -SelectedFolders $allFolders `
                -BackupBusy:$Script:WebState.Running

            if (-not $readiness.ready) {
                Write-JsonResponse -Response $response -Data @{
                    ok = $false
                    ready = $false
                    checks = @($readiness.checks)
                } -StatusCode 409
                return
            }

            $device = $readiness.device
            $backupBaseDir = [string]$readiness.backupBaseDir
            Save-BackupSettings -BackupBaseDir $backupBaseDir -BackupFolders $allFolders

            Start-WebBackupJob `
                -DeviceSerial $device.SerialNumber `
                -DeviceModel $device.Model `
                -SelectedFolders $allFolders `
                -UncheckedFolders @() `
                -BackupBaseDir $backupBaseDir `
                -SkipSizeCalculation

            Write-JsonResponse -Response $response -Data @{
                ok = $true
                device = @{
                    serialNumber = [string]$device.SerialNumber
                    model = [string]$device.Model
                    displayName = [string]$device.DisplayName
                }
                backupBaseDir = $backupBaseDir
                folderCount = $allFolders.Count
            }
            return
        }

        if ($path -eq "/api/backup/start" -and $request.HttpMethod -eq "POST") {
            $body = Read-RequestBody -Request $request
            if (-not $body) { throw "Request body required." }
            if ($Script:WebState.Running) { throw "Backup already running." }

            $deviceSerial = [string]$body.deviceSerial
            $deviceModel = [string]$body.deviceModel
            $backupBaseDir = [string]$body.backupBaseDir
            $allFolders = @($body.allFolders | ForEach-Object { Normalize-DeviceFolderPath $_ } | Where-Object { $_ })
            $selectedFolders = @($body.selectedFolders | ForEach-Object { Normalize-DeviceFolderPath $_ } | Where-Object { $_ })
            if ([string]::IsNullOrWhiteSpace($deviceSerial)) { throw "Device not selected." }
            if ($selectedFolders.Count -eq 0) { throw "Select at least one folder." }
            if ([string]::IsNullOrWhiteSpace($backupBaseDir)) { throw "Backup destination required." }

            $destCheck = Test-BackupDestinationPath -Path $backupBaseDir
            if (-not $destCheck.Ok) {
                throw ($destCheck.Issues -join " ")
            }
            $backupBaseDir = [string]$destCheck.Path

            $devices = @(Get-ConnectedDevices)
            $deviceMatch = $devices | Where-Object { $_.SerialNumber -eq $deviceSerial } | Select-Object -First 1
            if (-not $deviceMatch) { throw "Selected phone is no longer connected." }

            $skipSize = $false
            if ($null -ne $body.skipSizeCalculation) {
                $skipSize = [bool]$body.skipSizeCalculation
            }

            $unchecked = @($allFolders | Where-Object { $_ -notin $selectedFolders })
            Save-BackupSettings -BackupBaseDir $backupBaseDir -BackupFolders $allFolders

            Start-WebBackupJob `
                -DeviceSerial $deviceSerial `
                -DeviceModel $(if ($deviceModel) { $deviceModel } else { $deviceMatch.Model }) `
                -SelectedFolders $selectedFolders `
                -UncheckedFolders $unchecked `
                -BackupBaseDir $backupBaseDir `
                -SkipSizeCalculation:$skipSize

            Write-JsonResponse -Response $response -Data @{ ok = $true }
            return
        }

        if ($path -eq "/api/backup/pause" -and $request.HttpMethod -eq "POST") {
            if (-not $Script:WebState.Running) { throw "No backup running." }
            $Script:WebState.Paused = $true
            if ($Script:WebState.BackupTask) {
                $Script:WebState.BackupTask.Shared.Paused = $true
            }
            Write-JsonResponse -Response $response -Data @{ ok = $true; paused = $true }
            return
        }

        if ($path -eq "/api/backup/resume" -and $request.HttpMethod -eq "POST") {
            if (-not $Script:WebState.Running) { throw "No backup running." }
            $Script:WebState.Paused = $false
            if ($Script:WebState.BackupTask) {
                $Script:WebState.BackupTask.Shared.Paused = $false
            }
            Write-JsonResponse -Response $response -Data @{ ok = $true; paused = $false }
            return
        }

        if ($path -eq "/api/backup/cancel" -and $request.HttpMethod -eq "POST") {
            if (-not $Script:WebState.Running) {
                Write-JsonResponse -Response $response -Data @{ ok = $true; alreadyStopped = $true }
                return
            }
            $Script:WebState.CancelRequested = $true
            $Script:WebState.Paused = $false
            try {
                if ($Script:WebState.BackupTask -and $Script:WebState.BackupTask.Shared) {
                    $Script:WebState.BackupTask.Shared.CancelRequested = $true
                    $Script:WebState.BackupTask.Shared.Paused = $false
                }
            } catch { }
            Set-WebActivity `
                -Step "working" `
                -Title "Cancelling backup..." `
                -Detail "Stopping after the current file finishes. Already copied files are kept." `
                -CurrentFile ""
            $Script:WebState.Phase = "Cancelling after current file..."
            $Script:WebState.Eta = "Stopping..."
            Write-JsonResponse -Response $response -Data @{ ok = $true }
            return
        }

        if ($path -eq "/api/backup/interrupted" -and $request.HttpMethod -eq "GET") {
            Write-JsonResponse -Response $response -Data @{
                interrupted = @(Get-InterruptedBackupsForWeb)
            }
            return
        }

        if ($path -eq "/api/backup/dismiss-interrupted" -and $request.HttpMethod -eq "POST") {
            $body = Read-RequestBody -Request $request
            $backupDir = [string]$body.backupDir
            if ([string]::IsNullOrWhiteSpace($backupDir)) { throw "backupDir required." }
            if (-not (Test-SafeLocalPath $backupDir)) { throw "Invalid path." }
            Remove-BackupSessionLock -BackupDir $backupDir
            Write-JsonResponse -Response $response -Data @{ ok = $true }
            return
        }

        if ($path -eq "/api/backup/resume-interrupted" -and $request.HttpMethod -eq "POST") {
            if ($Script:WebState.Running) { throw "Backup already running." }
            $body = Read-RequestBody -Request $request
            $backupDir = [string]$body.backupDir
            if ([string]::IsNullOrWhiteSpace($backupDir)) { throw "backupDir required." }
            Remove-BackupSessionLock -BackupDir $backupDir
            $settings = Get-BackupSettings
            $allFolders = @($settings.BackupFolders | ForEach-Object { Normalize-DeviceFolderPath $_ } | Where-Object { $_ })
            $deviceSerial = [string]$body.deviceSerial
            if ([string]::IsNullOrWhiteSpace($deviceSerial)) {
                $lockInfo = Get-BackupLockInfo -BackupDir $backupDir
                if ($lockInfo) { $deviceSerial = [string]$lockInfo.DeviceSerial }
            }
            if ([string]::IsNullOrWhiteSpace($deviceSerial)) { throw "deviceSerial required." }
            $devices = @(Get-ConnectedDevices)
            $device = $devices | Where-Object { $_.SerialNumber -eq $deviceSerial } | Select-Object -First 1
            if (-not $device) { throw "Phone not connected." }
            Start-WebBackupJob `
                -DeviceSerial $device.SerialNumber `
                -DeviceModel $device.Model `
                -SelectedFolders $allFolders `
                -UncheckedFolders @() `
                -BackupBaseDir ([string]$settings.BackupBaseDir) `
                -SkipSizeCalculation
            Write-JsonResponse -Response $response -Data @{ ok = $true; resumed = $true }
            return
        }

        if ($path -eq "/api/backup/retry-failed" -and $request.HttpMethod -eq "POST") {
            if ($Script:WebState.Running) { throw "Backup already running." }
            $body = Read-RequestBody -Request $request
            $deviceSerial = [string]$body.deviceSerial
            $deviceModel = [string]$body.deviceModel
            $backupBaseDir = [string]$body.backupBaseDir
            $settings = Get-BackupSettings
            if ([string]::IsNullOrWhiteSpace($backupBaseDir)) {
                $backupBaseDir = [string]$settings.BackupBaseDir
            }
            if ([string]::IsNullOrWhiteSpace($deviceSerial)) { throw "deviceSerial required." }
            $devices = @(Get-ConnectedDevices)
            $device = $devices | Where-Object { $_.SerialNumber -eq $deviceSerial } | Select-Object -First 1
            if (-not $device) { throw "Phone not connected." }
            $allFolders = @($settings.BackupFolders | ForEach-Object { Normalize-DeviceFolderPath $_ } | Where-Object { $_ })
            Start-WebBackupJob `
                -DeviceSerial $device.SerialNumber `
                -DeviceModel $(if ($deviceModel) { $deviceModel } else { $device.Model }) `
                -SelectedFolders $allFolders `
                -UncheckedFolders @() `
                -BackupBaseDir $backupBaseDir `
                -SkipSizeCalculation `
                -RetryFailedOnly
            Write-JsonResponse -Response $response -Data @{ ok = $true; retry = $true }
            return
        }

        if ($path -eq "/api/events" -and $request.HttpMethod -eq "GET") {
            Write-JsonResponse -Response $response -Data (Get-WebStatus)
            return
        }

        if ($path -eq "/api/open-folder" -and $request.HttpMethod -eq "POST") {
            $body = Read-RequestBody -Request $request
            $folderPath = [string]$body.path
            if ([string]::IsNullOrWhiteSpace($folderPath)) {
                $folderPath = [string]$Script:WebState.BackupDir
            }
            if (-not (Test-SafeLocalPath $folderPath)) {
                throw "Invalid folder path."
            }
            if (-not (Test-Path $folderPath -PathType Container)) {
                throw "Folder not found: $folderPath"
            }
            Start-Process "explorer.exe" $folderPath
            Write-JsonResponse -Response $response -Data @{ ok = $true }
            return
        }

        Write-JsonResponse -Response $response -Data @{ error = "Not found" } -StatusCode 404
    } catch {
        Write-JsonResponse -Response $response -Data @{ error = $_.Exception.Message } -StatusCode 400
    }
}

function Stop-StaleBackupWebServers {
    $myPid = $PID
    try {
        Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" -ErrorAction SilentlyContinue | ForEach-Object {
            if ($_.ProcessId -eq $myPid) { return }
            $cmd = [string]$_.CommandLine
            if ($cmd -match 'Start-WebBackup|web\\server\.ps1') {
                Write-Host "  Stopping stale backup server (PID $($_.ProcessId))..." -ForegroundColor Yellow
                Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Milliseconds 800
    } catch { }
}

function Test-WebPortResponds {
    param([int]$Port)
    try {
        $req = [System.Net.HttpWebRequest]::Create("http://127.0.0.1:$Port/")
        $req.Timeout = 2000
        $req.ReadWriteTimeout = 2000
        $req.Method = "GET"
        $resp = $req.GetResponse()
        $resp.Close()
        return $true
    } catch {
        return $false
    }
}

function Get-AvailableWebPort {
    param(
        [int]$StartPort = 8765,
        [int]$Attempts = 6
    )
    for ($p = $StartPort; $p -lt ($StartPort + $Attempts); $p++) {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://127.0.0.1:$p/")
        try {
            $listener.Start()
            $listener.Stop()
            $listener.Close()
            return $p
        } catch {
            try { $listener.Close() } catch { }
        }
    }
    return $StartPort
}

function Process-WebContext {
    param([System.Net.HttpListenerContext]$Context)

    $path = $Context.Request.Url.AbsolutePath.TrimEnd('/')
    if ([string]::IsNullOrWhiteSpace($path)) { $path = "/" }

    try {
        if ($Context.Request.HttpMethod -eq "OPTIONS") {
            Set-WebCorsHeaders -Response $Context.Response
            $Context.Response.StatusCode = 204
            $Context.Response.Close()
            return
        }

        if ($path -eq "/" -or $path -eq "/index.html") {
            Serve-StaticFile -Response $Context.Response -FilePath (Join-Path $publicRoot "index.html")
            return
        }
        if ($path -eq "/app.js") {
            Serve-StaticFile -Response $Context.Response -FilePath (Join-Path $publicRoot "app.js")
            return
        }
        if ($path -eq "/style.css") {
            Serve-StaticFile -Response $Context.Response -FilePath (Join-Path $publicRoot "style.css")
            return
        }
        if ($path.StartsWith("/api/")) {
            Handle-ApiRequest -Context $Context
            return
        }

        $Context.Response.StatusCode = 404
        $Context.Response.Close()
    } catch {
        try {
            if ($Context.Response.OutputStream.CanWrite) {
                Write-JsonResponse -Response $Context.Response -Data @{ error = $_.Exception.Message } -StatusCode 500
            }
        } catch { }
    }
}

function Start-BackupWebServer {
    param(
        [int]$Port = 8765,
        [switch]$BindLan
    )

    Stop-StaleBackupWebServers

    try {
        $settings = Get-BackupSettings
        Clear-StaleBackupLocks -BackupBaseDir ([string]$settings.BackupBaseDir)
    } catch { }

    if (-not (Test-AdbAvailable)) {
        Write-Warning "ADB not found in PATH. API will report devices as unavailable until ADB is installed."
    }

    if (-not $BindLan) {
        $listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($listeners -and -not (Test-WebPortResponds -Port $Port)) {
            Write-Host "  Port $Port looks stuck. Trying another port..." -ForegroundColor Yellow
            $Port = Get-AvailableWebPort -StartPort ($Port + 1)
        } elseif (-not $listeners) {
            $Port = Get-AvailableWebPort -StartPort $Port
        }
    }

    $prefix = if ($BindLan) { "http://+:$Port/" } else { "http://127.0.0.1:$Port/" }
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)

    try {
        $listener.Start()
    } catch [System.Net.HttpListenerException] {
        if (-not $BindLan) {
            $Port = Get-AvailableWebPort -StartPort ($Port + 1)
            $listener = New-Object System.Net.HttpListener
            $listener.Prefixes.Clear()
            $listener.Prefixes.Add("http://127.0.0.1:$Port/")
            $listener.Start()
        } else {
            Write-Host ""
            Write-Host "  ERROR: Port $Port is already in use." -ForegroundColor Red
            Write-Host "  Close the other backup server window first, then try again." -ForegroundColor Yellow
            Write-Host ""
            throw "Port $Port is already in use. Close the other server window first."
        }
    } catch {
        if ($BindLan) {
            Write-Host "LAN bind failed (may need: netsh http add urlacl url=http://+:$Port/ user=$env:USERNAME)" -ForegroundColor Yellow
        }
        throw
    }

    $url = if ($BindLan) { "http://localhost:$Port (LAN enabled)" } else { "http://127.0.0.1:$Port" }
    Write-Host ""
    Write-Host "  Android Backup Web UI" -ForegroundColor Cyan
    Write-Host "  Open in browser: $url" -ForegroundColor Green
    Write-Host "  One-click backup — connect phone and open the page" -ForegroundColor DarkGray
    Write-Host ""

    try {
        Start-Process $url | Out-Null
    } catch { }

    while ($listener.IsListening) {
        try {
            Drain-BackupEventQueue
            $waitHandle = $listener.BeginGetContext($null, $null)
            while (-not $waitHandle.AsyncWaitHandle.WaitOne(200)) {
                Drain-BackupEventQueue
            }
            $context = $listener.EndGetContext($waitHandle)
            Process-WebContext -Context $context
        } catch {
            if ($listener.IsListening) { Write-Warning $_.Exception.Message }
        }
    }
}

if ($MyInvocation.InvocationName -ne '.') {
    Start-BackupWebServer -Port $Port -BindLan:$BindLan
}

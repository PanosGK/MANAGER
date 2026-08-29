# Script to backup specified folders from an Android device to a PC using ADB
# Run this script in Windows PowerShell

# --- Configuration ---
$BackupBaseDir = "$env:USERPROFILE\Desktop\AndroidBackups" # Base directory to store backups - Changed to Desktop
# --- Specify the folders to backup below. Add or remove lines as needed. ---
$BackupFolders = @(
    "sdcard/DCIM",
    "sdcard/Pictures",
    "sdcard/Movies",
    "sdcard/Viber",
    "sdcard/Download",
    "sdcard/Documents" # Example for testing skipped folders
)
$TotalFoldersRequested = $BackupFolders.Count # Total folders *initially requested*

# --- Functions ---

# Check-ADB, Get-ConnectedDevice, Backup-Files functions remain the same as previous version
# ... (Functions omitted for brevity - assume they are present) ...
function Check-ADB {
    # Uses Write-Host for output - Reduced verbosity
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
    # "ADB Found" message removed
}

function Get-ConnectedDevice {
    # Uses Write-Host for errors
    $DevicesOutput = adb devices | Out-String; $ConnectedDevices = @()
    foreach ($line in ($DevicesOutput -split "`n")) { if ($line -match "^([a-zA-Z0-9]+)\s+device.*$") { $DeviceSerial = $Matches[1]; try { $DeviceModel = (adb -s $DeviceSerial shell getprop ro.product.model).Trim(); if (-not $DeviceModel) { $DeviceModel = $DeviceSerial } } catch { $DeviceModel = $DeviceSerial }; $ConnectedDevices += @{ SerialNumber = $DeviceSerial; Model = $DeviceModel } } }
    if ($ConnectedDevices.Count -gt 0) { return , $ConnectedDevices }
    else { Write-Host -ForegroundColor Red "Error: No Android device found or authorized. Check connection and USB debugging."; return $null }
}

function Backup-Files {
    # Uses Write-Host for output - Reduced verbosity
    param(
        [string]$DeviceID,
        [string]$DeviceModel,
        [string]$SourcePathOnDevice, # Changed param name for clarity
        [string]$BackupDir
    )
    $FolderName = Split-Path -Leaf $SourcePathOnDevice; $LocalBackupPath = Join-Path $BackupDir $FolderName
    Write-Host -ForegroundColor Cyan "  Starting backup for '$FolderName'..." # Indicate start

    # The SourcePathOnDevice already includes 'sdcard/', etc. Needs leading '/' for adb pull
    $RemotePathForPull = "/$SourcePathOnDevice/"

    # Perform the pull operation
    $adbOutput = adb -s $DeviceID pull "$RemotePathForPull" "$LocalBackupPath" 2>&1

    if ($LASTEXITCODE -eq 0) {
        # Write-Host -ForegroundColor Green "     Backup of '$FolderName' completed successfully." # Optional: Restore if detailed success needed
        return $true # Indicate success silently for summary count
    } else {
        $errorMessage = $adbOutput -join "`n"
        # Display any error message from adb pull
        Write-Host -ForegroundColor Red "     Error during backup of '$FolderName'."
        $errorMessage.Split("`n") | ForEach-Object { Write-Host -ForegroundColor Red "       -> $_" }
        return $false # Indicate failure/issue
    }
} # <-- End of function Backup-Files


# --- Main Script ---

Check-ADB # Check if ADB is installed

$uiJob = $null # Initialize Job variable
$totalSizeGB = -1 # Initialize total size to -1 (unknown/failed)
$totalSizeCalculationSuccess = $false # Initialize flag

try { # Wrap main logic in try/finally for job cleanup

    # --- Device Connection Loop ---
    $Proceed = $false
    $ConnectedDevices = $null
    do {
        Clear-Host; $ConnectedDevices = Get-ConnectedDevice
        if (-not $ConnectedDevices) { Write-Host "Waiting for device..."; Start-Sleep -Seconds 5; continue }
        Write-Host "Connected Android device(s):"; $deviceIndex = 1
        foreach ($Device in $ConnectedDevices) { Write-Host "  $($deviceIndex): $($Device.Model) (Serial: $($Device.SerialNumber))"; $deviceIndex++ }
        if ($ConnectedDevices.Count -gt 1) { Write-Host -ForegroundColor Yellow "Multiple devices found. Using the first listed." }
        $ContinueBackup = Read-Host -Prompt "Proceed with backup for '$($ConnectedDevices[0].Model)'? (yes/no)"; if ($ContinueBackup -match '^y(es)?$') { $Proceed = $true } else { Write-Host "Backup cancelled by user."; Start-Sleep -Seconds 2 }
    } while (-not $Proceed)

    # --- Device and Directory Setup ---
    $DeviceInfo = $ConnectedDevices[0]; $DeviceID = $DeviceInfo.SerialNumber; $DeviceModel = $DeviceInfo.Model; $SanitizedDeviceModel = $DeviceModel -replace '[^a-zA-Z0-9_-]', '_'
    $CurrentDate = (Get-Date -Format "yyyyMMdd_HHmmss")
    try { $DeviceDateDir = "$($SanitizedDeviceModel)_$($CurrentDate)"; $BackupDir = Join-Path -Path $BackupBaseDir -ChildPath $DeviceDateDir -ErrorAction Stop } catch { Write-Host -ForegroundColor Red "Error constructing backup path."; pause; exit 1 }
    try { if (-not (Test-Path $BackupBaseDir -PathType Container)) { New-Item -ItemType Directory -Path $BackupBaseDir -Force -EA Stop | Out-Null }; New-Item -ItemType Directory -Path $BackupDir -Force -EA Stop | Out-Null; Write-Host -ForegroundColor Blue "Target directory: '$BackupDir'" } catch { Write-Host -ForegroundColor Red "Error creating directory '$BackupDir': $($_.Exception.Message)"; pause; exit 1 }

    # --- Pre-check Folder Existence and Build Filtered List ---
    # ... (This section remains the same as previous version - determines $FoldersToAttempt, $SkippedFoldersNotFound, $FoldersToCheckPaths, $ActualFoldersToProcessCount) ...
    Write-Host "--------------------" -ForegroundColor Yellow
    Write-Host "Checking existence of requested folders on device..." -ForegroundColor Yellow
    $FoldersToAttempt = @()
    $SkippedFoldersNotFound = @()
    $FoldersToCheckPaths = @() # Store paths for du calculation if needed

    foreach ($SourceFolder in $BackupFolders) {
        $FolderName = Split-Path -Leaf $SourceFolder
        $RemotePath = "/$SourceFolder/" # Path for 'ls' check
        Write-Host -ForegroundColor Gray "  Checking '$FolderName'..." -NoNewline
        $CheckOutput = adb -s $DeviceID shell "ls '$RemotePath'" 2>&1 # Check existence
        if ($LASTEXITCODE -eq 0) {
            # Folder likely exists (ls succeeded)
            Write-Host -ForegroundColor Green " Found."
            $FoldersToAttempt += $SourceFolder
            $FoldersToCheckPaths += "/$SourceFolder" # Add path for du command
        } elseif ($CheckOutput -match "No such file or directory" -or $CheckOutput -match "does not exist") {
            # Folder explicitly not found
            Write-Host -ForegroundColor Yellow " Not found (Skipping)."
            $SkippedFoldersNotFound += $FolderName
        } else {
            # ls command failed for another reason - Treat as skippable but warn
             Write-Host -ForegroundColor Red " Error checking ($($LASTEXITCODE)). Skipping."
             Write-Host -ForegroundColor Red "    -> $CheckOutput"
             $SkippedFoldersNotFound += "$FolderName (Error Checking)" # Mark differently if desired
        }
    }
    $ActualFoldersToProcessCount = $FoldersToAttempt.Count
    Write-Host "Will attempt to back up $ActualFoldersToProcessCount folder(s)."
    if ($SkippedFoldersNotFound.Count -gt 0) {
         Write-Host -ForegroundColor Yellow "Skipped $($SkippedFoldersNotFound.Count) folder(s): $($SkippedFoldersNotFound -join ', ')"
    }
    Write-Host "--------------------"


    # --- Calculate Total Size (Optional - Based on FOUND folders) ---
    # ... (This section remains the same - calculates $totalSizeGB and $totalSizeCalculationSuccess) ...
    $totalSizeGB = -1
    $totalSizeCalculationSuccess = $false
    if ($FoldersToCheckPaths.Count -gt 0) {
        Write-Host "Calculating total size of found folders on device..." -ForegroundColor Yellow
        Write-Host "(This step can take a VERY long time, please be patient)" -ForegroundColor Yellow
        Write-Host "--------------------"
        try {
            $adbArgs = @('-s', $DeviceID, 'shell', 'du', '-sc') + $FoldersToCheckPaths
            $duOutput = adb @adbArgs 2>&1
            if ($LASTEXITCODE -eq 0) {
                $totalLine = $duOutput | Where-Object { $_ -match 'total' } | Select-Object -Last 1
                if ($totalLine -match '^\s*([0-9]+)\s+total\s*$') {
                    $totalSizeKB = [decimal]$Matches[1]
                    $totalSizeBytes = $totalSizeKB * 1024
                    $totalSizeGB = $totalSizeBytes / 1GB
                    Write-Host -ForegroundColor Green ("Approximate total size to transfer: {0:N2} GB" -f $totalSizeGB)
                    $totalSizeCalculationSuccess = $true
                } else {
                    Write-Host -ForegroundColor Yellow "Warning: Could not parse total size from 'du' command output."
                    $duOutput | Write-Host -ForegroundColor Yellow
                }
            } else {
                 Write-Host -ForegroundColor Red "Error: 'adb shell du -sc' command failed."
                 $duOutput | Write-Host -ForegroundColor Red
            }
        } catch {
            Write-Host -ForegroundColor Red "Error running or parsing 'du' command: $($_.Exception.Message)"
        }
        if (-not $totalSizeCalculationSuccess) {
             Write-Host -ForegroundColor Yellow "Could not determine total size."
        }
        Write-Host "--------------------"
    } else {
        Write-Host "No folders found to calculate size." -ForegroundColor Yellow
        Write-Host "--------------------"
        $totalSizeCalculationSuccess = $false
        $totalSizeGB = 0
    }


    # --- Define the ScriptBlock for the UI Job (Monitor Window) ---
    # Modified heavily for size-based progress
    $uiScriptBlock = {
        param(
            [string]$TargetDirectory,
            # ExpectedSourceFoldersToMonitor is no longer needed for progress display
            # [array]$ExpectedSourceFoldersToMonitor,
            [double]$EstimatedTotalSizeGB,          # Total calculated size
            [bool]$TotalSizeKnown                  # Flag indicating if calculation succeeded
        )

        Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing

        # --- Form and Control Setup ---
        $form = New-Object System.Windows.Forms.Form;
        $form.Text = "Backup Monitor";
        $form.Size = New-Object System.Drawing.Size(480, 245); # Height might need adjustment
        $form.StartPosition = 'Manual';
        $screenWidth = [System.Windows.Forms.SystemInformation]::PrimaryMonitorSize.Width;
        $form.Location = New-Object System.Drawing.Point($screenWidth - $form.Width - 20, 30);
        $form.FormBorderStyle = 'FixedDialog'; $form.MaximizeBox = $false; $form.MinimizeBox = $true; $form.TopMost = $false

        $labelInfo = New-Object System.Windows.Forms.Label;
        $labelInfo.Location = New-Object System.Drawing.Point(10, 10); $labelInfo.Size = New-Object System.Drawing.Size(450, 20);
        $labelInfo.Text = "Monitoring: $TargetDirectory"; $labelInfo.AutoEllipsis = $true

        $labelSize = New-Object System.Windows.Forms.Label; # Current Size Display
        $labelSize.Location = New-Object System.Drawing.Point(10, 35); $labelSize.Size = New-Object System.Drawing.Size(450, 30);
        $labelSize.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold);
        $labelSize.Text = "Current Size: Initializing..."; $labelSize.TextAlign = 'MiddleCenter'

        # Label for Total Estimated Size (remains the same as previous version)
        $labelTotalSize = New-Object System.Windows.Forms.Label;
        $labelTotalSize.Location = New-Object System.Drawing.Point(10, 65); $labelTotalSize.Size = New-Object System.Drawing.Size(450, 20);
        $labelTotalSize.Font = New-Object System.Drawing.Font("Segoe UI", 9);
        $labelTotalSize.TextAlign = 'MiddleCenter'
        $totalSizeDisplayText = "Total Est: Unknown"
        if ($TotalSizeKnown -and $EstimatedTotalSizeGB -ge 0) { # Check >= 0 for valid known size
            $totalSizeDisplayText = "Total Est: $($EstimatedTotalSizeGB.ToString('N2')) GB"
        }
        $labelTotalSize.Text = $totalSizeDisplayText

        # --- Progress Bar Setup (Size Based) ---
        $progressBar = New-Object System.Windows.Forms.ProgressBar;
        $progressBar.Location = New-Object System.Drawing.Point(15, 95); $progressBar.Size = New-Object System.Drawing.Size(440, 25);
        $progressBar.Minimum = 0;
        $progressBar.Value = 0;
        $progressBar.Style = 'Continuous'
        # Set Maximum based on total size (scaled) if known and > 0
        $ProgressMaxScaleFactor = 100 # Scale GB by 100 for ProgressBar Max/Value
        if ($TotalSizeKnown -and $EstimatedTotalSizeGB -gt 0) {
            $progressBar.Maximum = [int][Math]::Floor($EstimatedTotalSizeGB * $ProgressMaxScaleFactor)
        } else {
            $progressBar.Maximum = 1 # Default max if size unknown or zero (won't show progress)
        }

        # --- Progress Label Setup (Size Based) ---
        $labelProgress = New-Object System.Windows.Forms.Label;
        $labelProgress.Location = New-Object System.Drawing.Point(15, 125); $labelProgress.Size = New-Object System.Drawing.Size(440, 20);
        $labelProgress.Text = "Progress: Initializing..."; # Initial text
        $labelProgress.TextAlign = 'MiddleCenter'

        $buttonClose = New-Object System.Windows.Forms.Button;
        $buttonClose.Location = New-Object System.Drawing.Point(185, 165); $buttonClose.Size = New-Object System.Drawing.Size(100, 30);
        $buttonClose.Text = "Close Monitor"; $buttonClose.Add_Click({ $form.Close() }); $form.CancelButton = $buttonClose

        $timer = New-Object System.Windows.Forms.Timer; $timer.Interval = 1500

        # --- Timer Update Action (Size Based Progress) ---
        $updateAction = {
            try {
                $currentSizeGB = 0 # Default current size
                if (Test-Path $TargetDirectory -PathType Container) {
                    # Calculate current size locally
                    $folderStats = Get-ChildItem -Path $TargetDirectory -Recurse -Force -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue
                    if ($folderStats.Count -gt 0) {
                         $currentSizeGB = $folderStats.Sum / 1GB
                    }
                }

                # Update Current Size Label
                $sizeText = "Current Size: $($currentSizeGB.ToString('N2')) GB"
                if ($form.IsHandleCreated) { $form.BeginInvoke([Action[string]]{ param($text) $labelSize.Text = $text }, $sizeText) }

                # --- Update Progress Bar and Label (Size Based) ---
                $progressText = ""
                $currentProgressValue = 0

                if ($TotalSizeKnown -and $EstimatedTotalSizeGB -gt 0) {
                    # Calculate scaled progress value, ensuring it doesn't exceed max
                    $currentProgressValue = [int][Math]::Floor($currentSizeGB * $ProgressMaxScaleFactor)
                    $currentProgressValue = [Math]::Min($currentProgressValue, $progressBar.Maximum) # Cap at maximum
                    $currentProgressValue = [Math]::Max(0, $currentProgressValue) # Ensure non-negative

                    # Calculate percentage
                    $percentage = 0
                    if ($EstimatedTotalSizeGB -gt 0) { # Avoid division by zero
                        $percentage = ($currentSizeGB / $EstimatedTotalSizeGB)
                        # Clamp percentage between 0 and 1 for display consistency
                        $percentage = [Math]::Max(0.0, [Math]::Min(1.0, $percentage))
                    }
                    $progressText = "Progress: $($currentSizeGB.ToString('N2')) GB / $($EstimatedTotalSizeGB.ToString('N2')) GB ({0:P0})" -f $percentage
                } else {
                    # Handle unknown or zero total size
                    $currentProgressValue = 0 # Show no progress on bar
                    if ($TotalSizeKnown) { # Total size is known to be zero
                         $progressText = "Progress: $($currentSizeGB.ToString('N2')) GB / 0.00 GB"
                    } else { # Total size is unknown
                         $progressText = "Progress: $($currentSizeGB.ToString('N2')) GB / Unknown"
                    }
                }

                # Update controls via BeginInvoke
                if ($form.IsHandleCreated) {
                    $form.BeginInvoke([Action[int]]{ param($value) $progressBar.Value = $value }, $currentProgressValue)
                    $form.BeginInvoke([Action[string]]{ param($text) $labelProgress.Text = $text }, $progressText)
                }
                # --- End Progress Update ---

            } catch {
                Write-Error "Error during monitor update: $($_.Exception.Message)"
                if ($form.IsHandleCreated) {
                    $form.BeginInvoke([Action[string]]{ param($text) $labelSize.Text = $text }, "Update Error!")
                    $form.BeginInvoke([Action[string]]{ param($text) $labelProgress.Text = $text }, "Error updating progress!")
                }
            }
        } # End updateAction

        $timer.Add_Tick($updateAction);
        # Add controls to form
        $form.Controls.AddRange(@($labelInfo, $labelSize, $labelTotalSize, $progressBar, $labelProgress, $buttonClose));
        $form.Add_FormClosing({ Write-Host "Monitor closing..."; $timer.Stop(); $timer.Dispose() });
        Invoke-Command -ScriptBlock $updateAction; # Run once immediately to initialize display
        $timer.Start(); $form.Show()
        while ($form.Visible) { [System.Windows.Forms.Application]::DoEvents(); Start-Sleep -Milliseconds 100 };
        $form.Dispose(); Write-Host "Monitor job exiting."
    } # End of uiScriptBlock


    # --- Start the UI Job ---
    # Pass the necessary arguments for size-based progress
    if ($ActualFoldersToProcessCount -gt 0) {
        Write-Host "Launching background monitor window..."
        # ArgumentList now only needs TargetDirectory, EstimatedTotalSizeGB, TotalSizeKnown
        $uiJob = Start-Job -ScriptBlock $uiScriptBlock -ArgumentList $BackupDir, $totalSizeGB, $totalSizeCalculationSuccess
        Start-Sleep -Seconds 1
    } else {
        Write-Host "No folders to back up, monitor window will not be started." -ForegroundColor Yellow
    }


    # --- Start Backup Process ---
    # ... (This section remains the same - iterates $FoldersToAttempt, calls Backup-Files) ...
     if ($ActualFoldersToProcessCount -gt 0) {
        Write-Host "-------------------- STARTING BACKUP --------------------" -ForegroundColor Green

        $FoldersAttemptedCount = 0 # Counts how many we actually try from the filtered list
        $FoldersSuccessfullyBackedUp = 0

        # Backup Folders Loop - Iterate over the FILTERED list
        foreach ($SourcePathOnDevice in $FoldersToAttempt) { # <-- Loop over filtered list
            $FoldersAttemptedCount++
            $FolderName = Split-Path -Leaf $SourcePathOnDevice

            # No need to check existence again here, already done
            Write-Host -ForegroundColor White "Processing ($($FoldersAttemptedCount)/$($ActualFoldersToProcessCount)): '$FolderName'..."

            # Call Backup-Files function
            if (Backup-Files $DeviceID $DeviceModel $SourcePathOnDevice $BackupDir) {
                $FoldersSuccessfullyBackedUp++
            } else {
                # Error already printed by Backup-Files
            }

            # Check monitor job status
            if ($uiJob -and $uiJob.State -eq 'Failed') {
                Write-Warning "Monitor job failed."
                Receive-Job $uiJob # Display error from job
                $uiJob = $null # Stop checking
            }
        } # <-- END OF FOREACH

        Write-Host "-------------------- BACKUP FINISHED --------------------" -ForegroundColor Green
    } else {
        Write-Host "-------------------- NO FOLDERS TO BACKUP --------------------" -ForegroundColor Yellow
        $FoldersSuccessfullyBackedUp = 0 # Ensure count is 0 if nothing was attempted
    }


    # --- Final Summary ---
    # ... (This section remains the same - reports folder counts and size) ...
    Write-Host -ForegroundColor Green "Summary: Successfully backed up $($FoldersSuccessfullyBackedUp) of $($ActualFoldersToProcessCount) attempted folder(s)."
    if ($SkippedFoldersNotFound.Count -gt 0) {
        Write-Host -ForegroundColor Yellow "Skipped $($SkippedFoldersNotFound.Count) folder(s) (not found or error during check): $($SkippedFoldersNotFound -join ', ')"
    }
    if ($FoldersToCheckPaths.Count -gt 0) {
        if ($totalSizeCalculationSuccess) {
            Write-Host -ForegroundColor Green ("Approximate total source size (of found folders): {0:N2} GB" -f $totalSizeGB)
        } else {
            Write-Host -ForegroundColor Yellow ("Total source size could not be calculated.")
        }
    } else {
         Write-Host -ForegroundColor Yellow ("No source folders found to measure size.")
    }
    Write-Host -ForegroundColor Green "Backup location: '$BackupDir'"
    Write-Host # Empty line


    # --- Open Explorer ---
    # ... (Remains the same) ...
     if (Test-Path $BackupDir -PathType Container) {
        try { Start-Process "explorer.exe" "$BackupDir" -ErrorAction Stop } catch { Write-Host -ForegroundColor Yellow "Warning: Could not automatically open folder in Explorer." }
    }


    # --- Wait for User ---
    # ... (Remains the same) ...
    Write-Host # Empty line
    if ($uiJob -ne $null) {
        Write-Host -ForegroundColor Cyan "Backup script complete. Monitor window is running."
        Write-Host -ForegroundColor Cyan "Close the monitor window, then press Enter here to exit."
    } else {
         Write-Host -ForegroundColor Cyan "Backup script complete. Press Enter here to exit."
    }
    pause # Wait in console


} finally { # START OF FINALLY BLOCK
    # --- Cleanup ---
    # ... (Remains the same) ...
     if ($uiJob -ne $null) {
        Stop-Job -Job $uiJob -ErrorAction SilentlyContinue | Remove-Job -ErrorAction SilentlyContinue
    }
    Write-Host "Script finished." # Minimal final message
} # <-- END OF FINALLY BLOCK

exit 0
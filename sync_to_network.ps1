# Sync Screenshots from Downloads to OneDrive
# PowerShell version handles apostrophes + special characters

$SourceDir = "$env:USERPROFILE\Downloads\VIF_screenshots"
$TargetDir = "$env:USERPROFILE\OneDrive - Kantar\Sachindra Nain (external)'s files - TRAI Data Adequacy"
$LogFile = "$env:USERPROFILE\Downloads\screenshot_sync_log.txt"

# Initialize log
Add-Content -Path $LogFile -Value ""
Add-Content -Path $LogFile -Value "========== Sync Started: $(Get-Date) =========="
Add-Content -Path $LogFile -Value "Source: $SourceDir"
Add-Content -Path $LogFile -Value "Target: $TargetDir"

Write-Host ""
Write-Host "========== SCREENSHOT SYNC ==========" -ForegroundColor Cyan
Write-Host "Source: $SourceDir"
Write-Host "Target: $TargetDir"
Write-Host "Log: $LogFile"
Write-Host ""

# Check source folder
if (-not (Test-Path $SourceDir)) {
    Write-Host "[ERROR] Source folder not found: $SourceDir" -ForegroundColor Red
    Add-Content -Path $LogFile -Value "[ERROR] Source folder not found: $SourceDir"
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[OK] Source folder found" -ForegroundColor Green
Add-Content -Path $LogFile -Value "[OK] Source folder found"

# Count PNG files
$pngFiles = @(Get-ChildItem -Path $SourceDir -Filter "*.png" -Recurse)
$fileCount = $pngFiles.Count

Write-Host "Found $fileCount PNG files to sync"
Add-Content -Path $LogFile -Value "[INFO] Found $fileCount PNG files to sync"

if ($fileCount -eq 0) {
    Write-Host "[INFO] No files to sync" -ForegroundColor Yellow
    Add-Content -Path $LogFile -Value "[INFO] No PNG files found"
    Read-Host "Press Enter to exit"
    exit 0
}

# Check target folder
Write-Host ""
Write-Host "Checking target path..."

if (-not (Test-Path $TargetDir)) {
    Write-Host "[INFO] Target path does not exist. Attempting to create..." -ForegroundColor Yellow

    try {
        New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
        Write-Host "[OK] Target path created" -ForegroundColor Green
        Add-Content -Path $LogFile -Value "[OK] Target path created"
    } catch {
        Write-Host "[ERROR] Failed to create target path" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Add-Content -Path $LogFile -Value "[ERROR] Failed to create target path: $($_.Exception.Message)"
        Read-Host "Press Enter to exit"
        exit 1
    }
} else {
    Write-Host "[OK] Target path is accessible" -ForegroundColor Green
    Add-Content -Path $LogFile -Value "[OK] Target path accessible"
}

# Sync files
Write-Host ""
Write-Host "Starting sync..." -ForegroundColor Cyan

$copyCount = 0
$skipCount = 0
$errorCount = 0

foreach ($file in $pngFiles) {
    try {
        # Folder structure: Country/Attribute/Date/file.png
        $relativePath = $file.FullName.Replace($SourceDir, "")
        $destination = Join-Path $TargetDir $relativePath
        $destinationFolder = Split-Path $destination -Parent

        # Create destination folder if needed
        if (-not (Test-Path $destinationFolder)) {
            New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null
        }

        # Check if file already exists
        if (Test-Path $destination) {
            Write-Host "[SKIP] Already exists: $($file.Name)" -ForegroundColor Gray
            Add-Content -Path $LogFile -Value "[SKIP] Already exists: $($file.Name)"
            $skipCount++
        } else {
            # Copy file
            Copy-Item -Path $file.FullName -Destination $destination -Force
            Write-Host "[OK] Copied: $($file.Name)" -ForegroundColor Green
            Add-Content -Path $LogFile -Value "[OK] Copied: $($file.Name)"
            $copyCount++
        }
    } catch {
        Write-Host "[ERROR] Failed to copy: $($file.Name)" -ForegroundColor Red
        Write-Host "         Error: $($_.Exception.Message)" -ForegroundColor Red
        Add-Content -Path $LogFile -Value "[ERROR] Failed to copy: $($file.Name) - $($_.Exception.Message)"
        $errorCount++
    }
}

# Summary
Write-Host ""
Write-Host "============ SYNC COMPLETE ============" -ForegroundColor Cyan
Write-Host "Copied:  $copyCount files" -ForegroundColor Green
Write-Host "Skipped: $skipCount files" -ForegroundColor Yellow
Write-Host "Errors:  $errorCount files" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host ""
Write-Host "Log file: $LogFile"
Write-Host ""

Add-Content -Path $LogFile -Value "[SUMMARY] Copied: $copyCount, Skipped: $skipCount, Errors: $errorCount"
Add-Content -Path $LogFile -Value "========== Sync Completed: $(Get-Date) =========="

Read-Host "Press Enter to exit"

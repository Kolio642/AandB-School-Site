$adminPath = "src\app\[locale]\admin"
Write-Host "Removing $adminPath directory..."
if (Test-Path $adminPath) {
    try {
        Remove-Item -Path $adminPath -Recurse -Force -ErrorAction Stop
        Write-Host "Directory removed successfully."
    }
    catch {
        Write-Host "Error removing directory: $_"
        Write-Host "Trying alternate method..."
        cmd /c "rd /s /q ""$adminPath"""
        if (Test-Path $adminPath) {
            Write-Host "Failed to remove directory."
        }
        else {
            Write-Host "Directory removed successfully using alternate method."
        }
    }
}
else {
    Write-Host "Directory does not exist."
} 
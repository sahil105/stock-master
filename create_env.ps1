# PowerShell script to create .env file for frontend
# Run this script from the root directory

$envContent = @"
# Backend API URL
REACT_APP_API_URL=http://localhost:8000
"@

$envPath = Join-Path $PSScriptRoot ".env"

if (Test-Path $envPath) {
    Write-Host ".env file already exists at $envPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -ne "y") {
        Write-Host "Cancelled." -ForegroundColor Red
        exit
    }
}

$envContent | Out-File -FilePath $envPath -Encoding utf8
Write-Host ".env file created successfully at $envPath" -ForegroundColor Green
Write-Host "Please update REACT_APP_API_URL if your backend runs on a different port!" -ForegroundColor Yellow


# PowerShell script to create .env file for backend
# Run this script from the backend directory

$envContent = @"
# Email Configuration
EMAIL_ADDRESS=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-here
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=465

# Database Configuration
# Option 1: Use DATABASE_URL (recommended for production)
# DATABASE_URL=mysql+pymysql://team_maven:maven@123@localhost:3306/StockMaster

# Option 2: Use separate database fields (recommended for development)
DB_HOST=localhost
DB_PORT=3306
DB_USER=team_maven
DB_PASSWORD=maven@123
DB_NAME=StockMaster

# OTP Configuration
OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
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
Write-Host "Please update the values with your actual credentials!" -ForegroundColor Yellow


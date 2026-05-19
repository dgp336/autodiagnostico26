# Stop on any errors
$ErrorActionPreference = 'Stop'

# Maven setup
$mavenVersion = '3.9.9'
$toolsDir = Join-Path $env:USERPROFILE 'tools'
$mavenDir = Join-Path $toolsDir "apache-maven-$mavenVersion"
$mavenBin = Join-Path $mavenDir 'bin'
$zipPath = Join-Path $toolsDir "apache-maven-$mavenVersion-bin.zip"

# Download and extract Maven if not already present
if (-not (Test-Path $mavenBin)) {
    New-Item -ItemType Directory -Path $toolsDir -Force | Out-Null
    Invoke-WebRequest -Uri "https://archive.apache.org/dist/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip" -OutFile $zipPath
    Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
}

# Add Maven to PATH for this session
$env:Path = "$mavenBin;$env:Path"

# Set working directory to script folder
Set-Location $PSScriptRoot

# Load .env from three levels up
$envPath = Resolve-Path (Join-Path $PSScriptRoot "../../../.env")
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)\s*$') {
            [System.Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Warning ".env file not found at $envPath"
}

# Run Spring Boot with 'local' profile
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
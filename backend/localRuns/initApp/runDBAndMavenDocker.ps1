# This script starts the MySQL container and runs the application to trigger DB population.

# ==============================================================================
# WARNING: THIS SCRIPT WAS AI GENERATED, AND THE HUMAN WHO VALIDATED DOESN'T HAVE
# THE EXPERTISE IN POWERSHELL TO ENSURE ITS CORRECTNESS. USE WITH CAUTION.
# ==============================================================================


$ErrorActionPreference = "Stop"

# --- Directories ---
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ROOT_DIR = Resolve-Path "$SCRIPT_DIR\..\.."
$BACKEND_DIR = $ROOT_DIR

# --- Docker network ---
$DOCKER_NETWORK = "autodiagnostico-net"

# --- MySQL config ---
$MYSQL_CONTAINER = "autodiagnostico-db"
$MYSQL_ROOT_PASSWORD = "rootpassword"
$MYSQL_DB = "autodiagnostico"
$MYSQL_PORT = 3306

# --- Maven config ---
$MAVEN_CONTAINER = "app-runner"

# --- Docker network setup ---
Write-Host "Ensuring Docker network '$DOCKER_NETWORK' exists..."
if (-not (docker network inspect $DOCKER_NETWORK -ErrorAction SilentlyContinue)) {
    docker network create $DOCKER_NETWORK | Out-Null
}

# --- MySQL Section ---
Write-Host "Checking MySQL container '$MYSQL_CONTAINER'..."
$mysqlRunning = docker ps --filter "name=$MYSQL_CONTAINER" --filter "status=running" --format "{{.Names}}" | Select-String $MYSQL_CONTAINER
if (-not $mysqlRunning) {
    Write-Host "Starting MySQL container..."
    docker rm -f $MYSQL_CONTAINER -ErrorAction SilentlyContinue | Out-Null
    docker run --name $MYSQL_CONTAINER `
        --network $DOCKER_NETWORK `
        -e "MYSQL_ROOT_PASSWORD=$MYSQL_ROOT_PASSWORD" `
        -e "MYSQL_DATABASE=$MYSQL_DB" `
        -p "$MYSQL_PORT`:3306" `
        -d mysql:8 | Out-Null
    Start-Sleep -Seconds 15
}

# --- Maven Section ---
Write-Host "Starting Application (Population will run on startup)..."
docker rm -f $MAVEN_CONTAINER -ErrorAction SilentlyContinue | Out-Null
docker run --name $MAVEN_CONTAINER --rm `
    --network $DOCKER_NETWORK `
    -v "$BACKEND_DIR:/usr/src/mymaven" `
    -w /usr/src/mymaven `
    -p 8081:8081 `
    -e "SPRING_DATASOURCE_URL=jdbc:mysql://$MYSQL_CONTAINER:3306/$MYSQL_DB?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true" `
    -e "SPRING_DATASOURCE_USERNAME=root" `
    -e "SPRING_DATASOURCE_PASSWORD=$MYSQL_ROOT_PASSWORD" `
    maven:3.9.15-eclipse-temurin-21 `
    mvn spring-boot:run `
    -DskipTests `
    -Dspring-boot.run.arguments="--rootPath=src/main/resources/scraper-output" `
    2>&1 | Tee-Object -FilePath "mavenLog.txt"

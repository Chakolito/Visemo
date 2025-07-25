#!/bin/bash

set -e
set -x

echo "Starting FastAPI..."
python3 ./AI_Files/FastAPI_Endpoint/main.py &

sleep 3

echo "Verifying contents of /app directory..."
ls -la /app

echo "Checking if VisemoServices.dll exists..."
if [ ! -f /app/VisemoServices.dll ]; then
  echo "Error: VisemoServices.dll not found!"
  exit 1
fi

# Use Azure-injected port (defaults to 8080 if not set)
PORT=${PORT:-8080}
echo "Using PORT = $PORT"
export ASPNETCORE_URLS="http://+:$PORT"

echo "Starting ASP.NET Core backend..."
dotnet /app/VisemoServices.dll

echo "ASP.NET Core process exited unexpectedly."

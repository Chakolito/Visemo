#!/bin/bash

# Exit immediately on error
set -e
# Print each command before executing it
set -x

echo "Starting FastAPI..."
python3 ./AI_Files/FastAPI_Endpoint/main.py &

# Wait a bit to ensure FastAPI starts
sleep 3

echo "Verifying contents of /app directory..."
ls -la /app

echo "Checking if VisemoServices.dll exists..."
if [ ! -f /app/VisemoServices.dll ]; then
  echo "Error: VisemoServices.dll not found!"
  exit 1
fi

echo "Starting ASP.NET Core backend in Development mode..."
dotnet /app/VisemoServices.dll --urls=http://0.0.0.0:80 --environment=Development

echo "ASP.NET Core process exited unexpectedly."

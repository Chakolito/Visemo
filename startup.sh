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

echo "Setting ASP.NET Core to bind to port 80..."
export ASPNETCORE_URLS=http://+:80

echo "Starting ASP.NET Core backend..."
dotnet /app/VisemoServices.dll --environment=Development

echo "ASP.NET Core process exited unexpectedly."

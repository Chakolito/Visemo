#!/bin/bash
set -e
set -x

echo "Starting FastAPI..."
python3 ./AI_Files/FastAPI_Endpoint/main.py &

sleep 3

echo "Verifying .NET publish files..."
ls -la /app

echo "Starting ASP.NET Core..."
dotnet /app/VisemoServices.dll --urls=http://0.0.0.0:80

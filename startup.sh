#!/bin/bash

# Fail on any error
set -e

# Print commands
set -x

# Start FastAPI in background
echo "Starting FastAPI..."
python3 ./AI_Files/FastAPI_Endpoint/main.py &

# Wait briefly to ensure FastAPI starts
sleep 3

# Start ASP.NET Core app (must bind to expected port)
echo "Starting ASP.NET Core..."
dotnet VisemoServices.dll --urls=http://0.0.0.0:80


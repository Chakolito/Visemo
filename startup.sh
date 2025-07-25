#!/bin/bash

# Start FastAPI in the background
echo "Starting FastAPI..."
python3 ./AI_Files/FastAPI_Endpoint/main.py &

# Wait briefly to ensure FastAPI starts
sleep 3

# Start ASP.NET Core app
echo "Starting ASP.NET Core..."
dotnet VisemoServices.dll

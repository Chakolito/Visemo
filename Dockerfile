# Base image for .NET & Python (multi-stage build)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip

# Copy FastAPI files
COPY VisemoServices/AI_Files/FastAPI_Endpoint ./AI_Files/FastAPI_Endpoint
WORKDIR /app/AI_Files/FastAPI_Endpoint
RUN pip3 install fastapi uvicorn python-multipart opencv-python-headless torch torchvision

# Go back to root app dir
WORKDIR /app

# Copy ASP.NET Core publish output
COPY publish/ ./

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Expose ports
EXPOSE 5000 8000

# Entry point to run both services
ENTRYPOINT ["./startup.sh"]

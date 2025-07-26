# Stage 1: Build .NET app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY VisemoServices/*.csproj VisemoServices/
COPY VisemoAlgorithm/*.csproj VisemoAlgorithm/
COPY *.sln ./
RUN dotnet restore

# Copy everything and publish
COPY . .
RUN dotnet publish VisemoServices/VisemoServices.csproj -c Release -o /app/publish

# Stage 2: Runtime with ASP.NET + Python + FastAPI
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app

# Install Python and dependencies
RUN apt-get update && apt-get install -y python3 python3-pip

# Copy FastAPI files
COPY --from=build /src/VisemoServices/AI_Files/FastAPI_Endpoint ./AI_Files/FastAPI_Endpoint
WORKDIR /app/AI_Files/FastAPI_Endpoint
RUN pip3 install --break-system-packages fastapi uvicorn python-multipart opencv-python-headless torch torchvision

# Return to /app and copy .NET publish output
WORKDIR /app
COPY --from=build /app/publish ./

# Copy startup script
COPY startup.sh ./startup.sh
RUN chmod +x ./startup.sh

# Expose ports
EXPOSE 80 8000

# Start both backend and FastAPI
ENTRYPOINT ["./startup.sh"]

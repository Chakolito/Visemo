# build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj & restore
COPY VisemoServices/*.csproj ./VisemoServices/
RUN dotnet restore VisemoServices/VisemoServices.csproj

# copy rest & publish
COPY . .
RUN dotnet publish VisemoServices/VisemoServices.csproj -c Release -o /app/publish

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# install mysql-client
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
COPY VisemoServices/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]

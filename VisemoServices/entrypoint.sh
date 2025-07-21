#!/bin/bash
set -e

echo "Waiting for database to be healthy..."

until mysqladmin ping -h db --silent; do
  sleep 2
done

echo "Database is up. Starting backend..."
exec dotnet VisemoServices.dll

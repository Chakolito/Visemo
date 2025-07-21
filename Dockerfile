version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: VisemoServices/Dockerfile
    ports:
      - "5000:80"
    depends_on:
      - db

  frontend:
    build:
      context: ./VisemoServices/view
      dockerfile: Dockerfile
    ports:
      - "3000:3000"

  ai:
    image: python:3.11
    working_dir: /app
    volumes:
      - ./VisemoServices/AI:/app
    command: python3 main.py
    ports:
      - "5001:5001" # adjust if your AI listens on a port

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: visemoservices
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:

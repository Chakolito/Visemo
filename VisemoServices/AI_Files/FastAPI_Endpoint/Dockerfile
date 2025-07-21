FROM python:3.11

WORKDIR /app

# Install libGL for opencv-python
RUN apt-get update && apt-get install -y libgl1

COPY . .

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    torch \
    torchvision \
    ultralytics \
    opencv-python \
    python-multipart

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

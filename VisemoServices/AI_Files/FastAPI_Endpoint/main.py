from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2
import numpy as np
import tempfile

app = FastAPI()

# Load your trained YOLOv11 model
model = YOLO("visemo4.pt")

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Read image file into a NumPy array
    contents = await file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Run inference
    results = model.predict(source=image)

    # Extract prediction results
    predictions = []
    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            label = model.names[class_id]
            predictions.append({
                "label": label,
                "confidence": confidence
            })

    if predictions:
        top_prediction = max(predictions, key=lambda x: x["confidence"])
        return JSONResponse(content={
        "emotion": top_prediction["label"],
        "confidence": top_prediction["confidence"]
    })
    else:
        return JSONResponse(content={ "emotion": "unknown", "confidence": 0 })
# To run this
# pip install fastapi uvicorn torch torchvision ultralytics
# python -m uvicorn main:app --host 0.0.0.0 --port 8000
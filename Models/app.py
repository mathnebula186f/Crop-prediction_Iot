from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler, LabelEncoder
import h5py

# Initialize FastAPI app
app = FastAPI()

# Load the model
model = load_model("model.h5")

# Load preprocessing objects (LabelEncoder and StandardScaler) from `.h5`
with h5py.File("model.h5", "r") as f:
    # Load LabelEncoder
    label_encoder = LabelEncoder()
    label_encoder.classes_ = f["label_encoder_classes"][:]
    
    # Load StandardScaler
    scaler = StandardScaler()
    scaler.mean_ = f["scaler_mean"][:]
    scaler.scale_ = f["scaler_scale"][:]

# Define the request schema
class InferenceRequest(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    pH: float
    rainfall: float

# Define the response schema
class InferenceResponse(BaseModel):
    rank: int
    label: str
    probability: float

@app.get("/")
def read_root():
    return {"message": "Model API is running!"}

@app.post("/predict", response_model=list[InferenceResponse])
def predict(data: InferenceRequest):
    try:
        # Prepare the input
        new_data = np.array([[data.N, data.P, data.K, data.temperature, data.humidity, data.pH, data.rainfall]])
        new_data_scaled = scaler.transform(new_data)

        # Make predictions
        predictions = model.predict(new_data_scaled)
        top_3_indices = np.argsort(predictions, axis=1)[:, -3:][:, ::-1][0]  # Get top 3
        top_3_labels = [label.decode('utf-8') for label in label_encoder.inverse_transform(top_3_indices)]
        top_3_probabilities = predictions[0, top_3_indices]

        # Format the response
        response = [
            InferenceResponse(rank=i+1, label=label, probability=round(float(prob), 2))
            for i, (label, prob) in enumerate(zip(top_3_labels, top_3_probabilities))
        ]

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
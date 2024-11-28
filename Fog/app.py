import paho.mqtt.client as mqtt
from flask import Flask, render_template
from flask_socketio import SocketIO
import tensorflow as tf
import numpy as np
import json
from sklearn.preprocessing import StandardScaler, LabelEncoder
import h5py

# MQTT broker details
broker = "broker.hivemq.com"
port = 1883
topic = "crop/nutrition/data"

# Flask setup
app = Flask(__name__)
socketio = SocketIO(app)

# MQTT client setup
mqtt_client = mqtt.Client()

# Load the model
model = tf.keras.models.load_model('model.h5')

# Load preprocessing objects (LabelEncoder and StandardScaler) from `.h5`
with h5py.File("model.h5", "r") as f:
    # Load LabelEncoder
    label_encoder = LabelEncoder()
    label_encoder.classes_ = f["label_encoder_classes"][:]
    
    # Load StandardScaler
    scaler = StandardScaler()
    scaler.mean_ = f["scaler_mean"][:]
    scaler.scale_ = f["scaler_scale"][:]

# WebSocket function to handle MQTT messages and make predictions
def on_message(client, userdata, msg):
    # Forward the MQTT message to WebSocket clients
    message = msg.payload.decode('utf-8')
    print(f"Received message: {message}")
    
    # Parse the JSON message
    data = json.loads(message)
    
    # Extract the required values
    nitrogen = data['nitrogen']
    phosphorus = data['phosphorus']
    potassium = data['potassium']
    temperature = data['temperature']
    humidity = data['humidity']
    ph = data['pHValue']
    moisture = data['moisture']
    
    # Prepare the input data in the expected format
    input_data = np.array([[nitrogen, phosphorus, potassium, temperature, humidity, ph, moisture]])
    
    # Make a prediction using the model
    predictions = model.predict(input_data)
    top_3_indices = np.argsort(predictions, axis=1)[:, -3:][:, ::-1][0]  # Get top 3
    top_3_labels = [label.decode('utf-8') for label in label_encoder.inverse_transform(top_3_indices)]
    top_3_probabilities = predictions[0, top_3_indices]
    
    # Print the prediction (for debugging)
    print(f"Labels: {top_3_labels}")
    print(f"Probabilities: {top_3_probabilities}")
    print(f"Prediction result: {predictions}")
    
    # Emit the prediction to the frontend
    socketio.emit('new_data', {'message': message, 'prediction': predictions.tolist()})

# MQTT connection callback
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT Broker!")
        client.subscribe(topic)  # Subscribe to the topic
    else:
        print(f"Failed to connect to MQTT Broker. Return code: {rc}")

# Flask route to serve the web dashboard
@app.route('/')
def index():
    return render_template('index.html')  # Serve the HTML page with a dashboard

# Setup MQTT client
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# Connect to the MQTT broker
mqtt_client.connect(broker, port, 60)

# Start MQTT loop in a background thread
def mqtt_loop():
    mqtt_client.loop_start()

# Start the WebSocket server
if __name__ == '__main__':
    mqtt_loop()  # Start MQTT loop
    socketio.run(app, host='0.0.0.0', port=5000)

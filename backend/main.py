from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import asyncio
import os
from datetime import datetime
import yaml
import json
from dotenv import load_dotenv

from mock_data import MockDataGenerator
from api_client import UISPClient, MQTTClient, InfluxDBClientWrapper

# Load environment variables
load_dotenv()

app = FastAPI(title="CameraNet Troubleshooter API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
mock_generator = MockDataGenerator()
mqtt_client = MQTTClient()
influx_client = InfluxDBClientWrapper()

# Global state for development mode
DEV_MODE = os.getenv("DEV_MODE", "true").lower() == "true"
if not DEV_MODE:
    uisp_client = UISPClient()

# Load configuration files
def load_config():
    with open("config/buildings.yaml") as f:
        buildings_config = yaml.safe_load(f)
    with open("config/alerts.yaml") as f:
        alerts_config = yaml.safe_load(f)
    return buildings_config, alerts_config

try:
    buildings_config, alerts_config = load_config()
except Exception as e:
    print(f"Error loading configuration: {str(e)}")
    buildings_config, alerts_config = {}, {}

@app.on_event("startup")
async def startup_event():
    """Initialize connections on startup"""
    if not DEV_MODE:
        mqtt_client.connect()

@app.get("/")
async def root():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "mode": "development" if DEV_MODE else "production"
    }

@app.get("/api/buildings")
async def get_buildings():
    """Get all configured buildings"""
    return buildings_config.get("buildings", [])

@app.get("/api/devices")
async def get_devices():
    """Get all network devices with their current status"""
    if DEV_MODE:
        # Generate mock data for configured devices
        devices = []
        for building in buildings_config.get("buildings", []):
            for nano_beam in building.get("nano_beams", []):
                device_data = mock_generator.generate_device_data(nano_beam["id"])
                device_data["building_id"] = building["id"]
                devices.append(device_data)
        return devices
    else:
        return await uisp_client.get_devices()

@app.get("/api/devices/{device_id}/metrics")
async def get_device_metrics(device_id: str):
    """Get detailed metrics for a specific device"""
    if DEV_MODE:
        return mock_generator.generate_device_data(device_id)
    else:
        return await uisp_client.get_device_statistics(device_id)

@app.get("/api/alerts")
async def get_alerts(severity: Optional[str] = None):
    """Get recent alerts, optionally filtered by severity"""
    if DEV_MODE:
        # Generate some mock alerts
        alerts = [
            mock_generator.generate_alert(severity="critical"),
            mock_generator.generate_alert(severity="warning"),
            mock_generator.generate_alert(severity="warning")
        ]
        if severity:
            alerts = [a for a in alerts if a["severity"] == severity]
        return alerts
    else:
        # In production, these would come from InfluxDB
        return []

@app.post("/api/alerts/test")
async def trigger_test_alert():
    """Trigger a test alert for development"""
    if not DEV_MODE:
        raise HTTPException(status_code=400, detail="Test alerts only available in development mode")
    
    alert = mock_generator.generate_alert(severity="warning")
    mqtt_client.publish_alert(alert)
    return alert

# Development routes
@app.post("/api/dev/simulate")
async def simulate_data(duration: int = 60):
    """Simulate device data for a specified duration (seconds)"""
    if not DEV_MODE:
        raise HTTPException(status_code=400, detail="Simulation only available in development mode")
    
    async def generate_data():
        end_time = datetime.now().timestamp() + duration
        while datetime.now().timestamp() < end_time:
            data_batch = mock_generator.generate_batch(num_records=2)
            for data in data_batch:
                influx_client.write_device_data(data)
            await asyncio.sleep(5)  # Generate data every 5 seconds
    
    asyncio.create_task(generate_data())
    return {"message": f"Started data simulation for {duration} seconds"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

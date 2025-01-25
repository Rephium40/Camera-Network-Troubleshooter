import os
import requests
import logging
from dotenv import load_dotenv
import paho.mqtt.client as mqtt
import json
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS

load_dotenv()

class UISPClient:
    def __init__(self):
        self.base_url = os.getenv('UISP_BASE_URL').rstrip('/')
        self.api_token = os.getenv('UISP_API_TOKEN')
        self.session = requests.Session()
        self.session.headers.update({
            "x-auth-token": self.api_token,
            "Content-Type": "application/json"
        })
        self.logger = logging.getLogger(__name__)

    def get_devices(self):
        """Fetch all devices from UISP API with pagination support"""
        devices = []
        page = 1
        while True:
            try:
                response = self.session.get(
                    f"{self.base_url}/v2.1/devices",
                    params={"page": page, "limit": 100}
                )
                response.raise_for_status()
                data = response.json()
                devices.extend(data.get('data', []))
                
                if data.get('pagination', {}).get('nextPage') is None:
                    break
                page += 1
            except requests.exceptions.RequestException as e:
                self.logger.error(f"Pagination failed at page {page}: {str(e)}")
                break
        return devices

    def get_device_statistics(self, device_id):
        """Get detailed statistics including RF metrics"""
        try:
            response = self.session.get(
                f"{self.base_url}/v2.1/devices/{device_id}/statistics",
                params={"resolution": "5m", "period": "1d"}
            )
            response.raise_for_status()
            stats = response.json()
            
            # Extract key wireless metrics
            return {
                "rssi": stats.get("signal", {}).get("rssi", -100),
                "noise_floor": stats.get("signal", {}).get("noiseFloor", -100),
                "tx_rate": stats.get("transmit", {}).get("rate", 0),
                "rx_rate": stats.get("receive", {}).get("rate", 0),
                "uptime": stats.get("system", {}).get("uptime", 0),
                "throughput": stats.get("throughput", {}).get("value", 0)
            }
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Failed to get stats for device {device_id}: {str(e)}")
            return None

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.logger = logging.getLogger(__name__)
        
    def on_connect(self, client, userdata, flags, rc):
        self.logger.info(f"Connected to MQTT broker with code {rc}")
        client.subscribe(os.getenv('MQTT_TOPIC_RAW'))

    def connect(self):
        try:
            self.client.connect(
                os.getenv('MQTT_BROKER'),
                1883,
                60
            )
            self.client.loop_start()
        except Exception as e:
            self.logger.error(f"MQTT connection failed: {str(e)}")

    def publish_alert(self, alert_data):
        """Publish formatted alert data to MQTT"""
        try:
            result = self.client.publish(
                os.getenv('MQTT_TOPIC_ALERTS'),
                json.dumps(alert_data)
            )
            return result.rc == mqtt.MQTT_ERR_SUCCESS
        except Exception as e:
            self.logger.error(f"Failed to publish alert: {str(e)}")
            return False

class InfluxDBClientWrapper:
    def __init__(self):
        self.client = InfluxDBClient(
            url=os.getenv('INFLUXDB_URL'),
            token=os.getenv('INFLUXDB_TOKEN'),
            org='cameranet'
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.logger = logging.getLogger(__name__)

    def write_device_data(self, device_data):
        """Write device metrics to InfluxDB"""
        try:
            point = Point("device_metrics")\
                .tag("device_id", device_data['id'])\
                .field("rssi", device_data.get('signal', {}).get('rssi', -100))\
                .field("uptime", device_data.get('uptime', 0))\
                .field("throughput", device_data.get('throughput', 0))
            
            self.write_api.write(
                bucket="cameranet-bucket",
                record=point
            )
            return True
        except Exception as e:
            self.logger.error(f"InfluxDB write failed: {str(e)}")
            return False

# Initialize core components
uisp_client = UISPClient()
mqtt_client = MQTTClient()
influx_client = InfluxDBClientWrapper()

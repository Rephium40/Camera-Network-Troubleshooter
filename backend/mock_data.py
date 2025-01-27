import random
import time
from datetime import datetime, timedelta
import json

class MockDataGenerator:
    def __init__(self):
        # Camera types and their IDs from buildings.yaml
        self.fixed_cameras = [f"cam-f{i:02d}" for i in range(1, 61)]  # 60 fixed cameras
        self.panoramic_cameras = [f"cam-ml{i:02d}" for i in range(1, 5)]  # 4 multi-lens
        self.special_cameras = {
            "lpr": "cam-lpr-01",  # License plate recognition
            "ptz": "cam-ptz-01"   # Pan-tilt-zoom
        }
        self.nvrs = ["nvr-01", "nvr-02"]
        self.buildings = [f"building-{i:02d}" for i in range(1, 15)]  # 14 buildings

    def generate_camera_metrics(self, camera_type="fixed"):
        """Generate realistic camera metrics based on type"""
        base_metrics = {
            "status": random.choice(["active", "active", "active", "warning", "error"]),
            "uptime": random.randint(3600, 86400),
            "temperature": random.uniform(35, 45),
            "stream_active": random.choice([True, True, True, False]),
            "recording": random.choice([True, True, True, False])
        }

        if camera_type == "fixed":
            base_metrics.update({
                "resolution": "4MP",
                "bitrate": random.uniform(2, 4),  # Mbps
                "fps": random.uniform(25, 30)
            })
        elif camera_type == "panoramic":
            base_metrics.update({
                "resolution": "8MP",
                "bitrate": random.uniform(4, 8),  # Mbps
                "fps": random.uniform(20, 30),
                "view_mode": random.choice(["180", "360", "quad"])
            })
        elif camera_type == "lpr":
            base_metrics.update({
                "resolution": "4MP",
                "bitrate": random.uniform(3, 5),  # Mbps
                "fps": random.uniform(25, 30),
                "plates_detected": random.randint(0, 10),
                "recognition_rate": random.uniform(0.85, 0.98)
            })
        elif camera_type == "ptz":
            base_metrics.update({
                "resolution": "5MP",
                "bitrate": random.uniform(3, 6),  # Mbps
                "fps": random.uniform(25, 30),
                "pan_position": random.uniform(0, 360),
                "tilt_position": random.uniform(-90, 90),
                "zoom_level": random.uniform(1, 20)
            })

        return base_metrics

    def generate_nvr_metrics(self, nvr_id):
        """Generate NVR performance metrics"""
        return {
            "id": nvr_id,
            "status": random.choice(["active", "active", "active", "warning"]),
            "storage_used": random.uniform(10, 28),  # TB out of 32TB
            "storage_total": 32,  # TB
            "cpu_usage": random.uniform(20, 80),
            "memory_usage": random.uniform(30, 75),
            "recording_streams": random.randint(25, 33),
            "bandwidth_in": random.uniform(100, 200),  # Mbps
            "bandwidth_out": random.uniform(10, 50),   # Mbps
            "recording_retention": random.randint(25, 30)  # days
        }

    def generate_network_metrics(self):
        """Generate network performance metrics"""
        return {
            "packet_loss": random.uniform(0, 0.08),
            "latency": random.uniform(10, 40),
            "bandwidth_utilization": random.uniform(0.3, 0.85),
            "throughput": random.uniform(50, 150)  # Mbps
        }

    def generate_camera_data(self, camera_id):
        """Generate complete camera dataset"""
        camera_type = "fixed"
        if camera_id.startswith("cam-ml"):
            camera_type = "panoramic"
        elif camera_id == "cam-lpr-01":
            camera_type = "lpr"
        elif camera_id == "cam-ptz-01":
            camera_type = "ptz"

        return {
            "id": camera_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "metrics": self.generate_camera_metrics(camera_type),
            "network": self.generate_network_metrics()
        }

    def generate_alert(self, severity="warning"):
        """Generate mock alert data"""
        alert_types = [
            "Camera Offline",
            "Storage Warning",
            "Network Latency",
            "Stream Error",
            "Motion Detected",
            "LPR Detection",
            "Temperature Warning"
        ]
        
        camera_id = random.choice(self.fixed_cameras + 
                                self.panoramic_cameras + 
                                list(self.special_cameras.values()))
        
        return {
            "id": f"alert-{int(time.time())}",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "type": random.choice(alert_types),
            "severity": severity,
            "camera_id": camera_id,
            "building_id": random.choice(self.buildings),
            "message": f"Mock alert for testing - {random.choice(alert_types)}",
            "metrics": self.generate_camera_metrics()
        }

    def generate_system_status(self):
        """Generate complete system status"""
        status = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "nvrs": [self.generate_nvr_metrics(nvr) for nvr in self.nvrs],
            "cameras": {
                "total": 66,
                "active": random.randint(60, 66),
                "recording": random.randint(60, 66),
                "alerts": random.randint(0, 5)
            },
            "storage": {
                "total": 64,  # TB (2x 32TB NVRs)
                "used": random.uniform(20, 56),
                "retention_days": random.randint(25, 30)
            },
            "network": self.generate_network_metrics()
        }
        return status

def main():
    """Example usage of mock data generator"""
    generator = MockDataGenerator()
    
    # Generate sample camera data
    print("\nSample Fixed Camera Data:")
    print(json.dumps(generator.generate_camera_data("cam-f01"), indent=2))
    
    print("\nSample PTZ Camera Data:")
    print(json.dumps(generator.generate_camera_data("cam-ptz-01"), indent=2))
    
    print("\nSample System Status:")
    print(json.dumps(generator.generate_system_status(), indent=2))
    
    print("\nSample Alert:")
    print(json.dumps(generator.generate_alert(), indent=2))

if __name__ == "__main__":
    main()

# Summerhill Camera Network Troubleshooter

Monitoring and troubleshooting system for apartment complex security infrastructure at:
3630 E Owens Ave, Las Vegas, NV 89110

## System Overview

### Camera Equipment
- 60x LTS CMIP3C42W-28M Turret Network Camera
  - 4MP resolution
  - 2.8mm lens
  - Used for entrances, common areas, and general surveillance
- 4x LTS CMIP3C8PW-SDL 8MP Panoramic
  - 180° wide-angle view
  - Used for parking areas and large open spaces
- 1x LTS CMIP7943WLPR-32R
  - License plate recognition
  - Positioned at main entrance
- 1x PTZIP512X20IR
  - Pan-Tilt-Zoom capability
  - 20x optical zoom
  - IR night vision
  - Used for active monitoring

## Testing Procedures

### 1. System Startup
```bash
# Start all services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 2. Camera Testing

#### Fixed Cameras (CMIP3C42W-28M)
```bash
# Test RTSP stream
ffplay rtsp://nvr-01/stream{1-60}

# Verify video quality
ffprobe rtsp://nvr-01/stream{1-60}
```

#### Panoramic Cameras (CMIP3C8PW-SDL)
```bash
# Test all views
ffplay rtsp://nvr-01/stream{panoramic1-4}

# Check resolution
ffprobe rtsp://nvr-01/stream{panoramic1-4}
```

#### LPR Camera
```bash
# Test LPR stream
ffplay rtsp://nvr-01/stream_lpr

# Test plate recognition
curl http://localhost:8000/api/lpr/test
```

#### PTZ Camera
```bash
# Test PTZ stream
ffplay rtsp://nvr-01/stream_ptz

# Test PTZ controls
curl http://localhost:8000/api/ptz/test
```

### 3. Network Testing

#### NVR Connectivity
```bash
# Test Primary NVR
ping 192.168.1.3

# Test Secondary NVR
ping 192.168.1.4
```

#### Stream Health
```bash
# Check stream status
curl http://localhost:8000/api/streams/health

# Monitor bandwidth usage
curl http://localhost:8000/api/network/bandwidth
```

### 4. Storage Verification
```bash
# Check NVR storage
curl http://localhost:8000/api/storage/status

# Verify recording retention
curl http://localhost:8000/api/recordings/retention
```

## Monitoring

### Grafana Dashboards
- URL: http://localhost:3000
- Default credentials: admin/cameranet123

Available Dashboards:
1. Camera Status Overview
2. Network Performance
3. Storage Utilization
4. Alert History

### InfluxDB Metrics
- URL: http://localhost:8086
- Organization: cameranet
- Default token: cameranet-token

### MQTT Topics
```bash
# Subscribe to all camera status updates
mosquitto_sub -t "cameras/+/status"

# Subscribe to alerts
mosquitto_sub -t "alerts/#"
```

## Troubleshooting

### Common Issues

1. Camera Offline
```bash
# Check camera connectivity
ping {camera-ip}

# Verify network path
traceroute {camera-ip}

# Check camera logs
curl http://localhost:8000/api/cameras/{id}/logs
```

2. Stream Issues
```bash
# Reset stream
curl -X POST http://localhost:8000/api/streams/{id}/reset

# Check stream metrics
curl http://localhost:8000/api/streams/{id}/metrics
```

3. Storage Issues
```bash
# Check disk usage
curl http://localhost:8000/api/storage/usage

# Verify write speed
curl http://localhost:8000/api/storage/performance
```

### Log Collection
```bash
# Collect all system logs
./collect_logs.sh

# Get specific camera logs
./collect_logs.sh --camera={id}
```

## Development

### API Testing
```bash
# Run API tests
cd backend
python -m pytest tests/

# Test specific camera endpoint
curl http://localhost:8000/api/cameras/test/{id}
```

### Frontend Development
```bash
# Start development server
cd frontend
npm run dev

# Run UI tests
npm test
```

## Quick Test Procedure

1. Start System:
```bash
docker-compose up -d
```

2. Verify Core Services:
```bash
# Check all services are running
docker-compose ps

# Verify NVR connectivity
ping 192.168.1.3
ping 192.168.1.4
```

3. Test Camera Types:
```bash
# Test a fixed camera
ffplay rtsp://nvr-01/stream1

# Test panoramic camera
ffplay rtsp://nvr-01/stream_panoramic1

# Test LPR camera
ffplay rtsp://nvr-01/stream_lpr

# Test PTZ camera
ffplay rtsp://nvr-01/stream_ptz
```

4. Check Monitoring:
```bash
# Open Grafana dashboard
open http://localhost:3000

# Check camera status
curl http://localhost:8000/api/cameras/status
```

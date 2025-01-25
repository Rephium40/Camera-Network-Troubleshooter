Here's a comprehensive README.md for your camera network troubleshooting app (copy-paste ready):

```markdown
# CameraNet Troubleshooter

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A real-time monitoring and diagnostics system for Ubiquiti-based IP camera networks.

![Dashboard Preview](docs/dashboard-preview.png)

## Features

- **Real-Time Monitoring**
  - Map view of 14 buildings with camera/NanoBeam status
  - Signal strength visualization (RSSI, noise floor)
  - Bandwidth utilization tracking for Rocket 5AC Lite stations

- **Automated Diagnostics**
  - RF interference detection (5GHz spectrum analysis)
  - Automatic channel optimization with DFS support
  - Camera stream health checks (RTSP frame analysis)

- **Alert System**
  - Multi-channel notifications (Slack, SMS, Email)
  - Priority-based alerting with rate limiting
  - MQTT integration for IoT device control

- **Historical Reporting**
  - Time-series storage of network metrics
  - Customizable Grafana dashboards
  - Exportable PDF/CSV reports

- **Security**
  - Role-based access control (RBAC)
  - HashiCorp Vault integration
  - Audit logging with OpenTelemetry

## System Architecture

```mermaid
graph TD
    A[NanoBeam 5AC] --> B[Rocket 5AC Lite]
    B --> C[FastAPI Server]
    C --> D[(TimescaleDB)]
    C --> E[Redis]
    D --> F[Grafana]
    E --> G[React Native App]
    G --> H[Technician Mobile]
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- UISP API v2.3+ access
- NVR with RTSP stream access
- Windows 11+ (WSL2 recommended for development)

## Installation

```powershell
# Clone repository
git clone https://github.com/your-org/cameranet-troubleshooter.git
cd cameranet-troubleshooter

# Backend setup
cd src/backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ..\frontend
npm install
```

## Configuration

1. Create `.env` file:
```ini
# Backend/.env
UISP_API_KEY=your_uisp_token
NVR_USER=admin
NVR_PASSWORD=secure_password
```

2. Configure buildings in `config/buildings.yaml`:
```yaml
buildings:
  - id: bldg-01
    nano_beams: 
      - ip: 192.168.1.101
        channels: [36, 40]
    cameras:
      - rtsp_url: rtsp://nvr/cam-01
```

3. Set alert thresholds in `config/alerts.yaml`:
```yaml
thresholds:
  rssi: -70  # dBm
  packet_loss: 0.05  # 5%
  bandwidth: 0.8  # 80%
```

## Usage

```powershell
# Start backend
cd src/backend
uvicorn main:app --reload

# Start frontend
cd ..\frontend
npm start
```

Access the dashboard at `http://localhost:3000`

Key Features:
1. **Map View**: Visualize camera network status
2. **Signal Analyzer**: Identify interference patterns
3. **Alert History**: Review past incidents
4. **AR Guide**: Access NanoBeam alignment instructions

## Troubleshooting

Common Issues:
- **API Connection Failed**: Verify UISP token in `.env`
- **Missing Camera Feeds**: Check NVR RTSP URLs
- **High Packet Loss**: Run `scripts/rf-scan.ps1`

```powershell
# Test UISP connection
python -m src.backend.tests.connection_test

# Check service status
Get-Service | Where-Object {$_.Name -like "*cameranet*"}
```

## Contributing

1. Create feature branch:
```powershell
git checkout -b feat/CAM-123-short-description
```

2. Commit changes using [Conventional Commits](https://www.conventionalcommits.org):
```
fix(alerting): Add SMS rate limiting
```

3. Open pull request targeting `develop` branch

## License

Apache 2.0 - See [LICENSE](LICENSE)



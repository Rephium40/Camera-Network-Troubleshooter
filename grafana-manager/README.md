# Grafana Manager MCP Server

This MCP server provides tools for managing Grafana dashboards and data sources programmatically. It's specifically designed for the Camera Network Troubleshooter project to configure InfluxDB and create monitoring dashboards.

## Available Tools

### 1. configure_influxdb
Configures InfluxDB as a data source in Grafana with the following parameters:
- `organization`: InfluxDB organization name
- `token`: InfluxDB access token
- `bucket`: Default bucket name

Example usage:
```typescript
await use_mcp_tool("grafana-manager", "configure_influxdb", {
  organization: "cameranet",
  token: "cameranet-token",
  bucket: "cameranet-bucket"
});
```

### 2. create_camera_overview_dashboard
Creates a dashboard with camera metrics including:
- Camera status (active/warning/error counts)
- Temperature gauge
- Stream status
- Recording status
- Bitrate graph
- FPS graph

### 3. create_nvr_dashboard
Creates a dashboard with NVR performance metrics including:
- Storage usage gauge
- CPU usage graph
- Memory usage graph
- Recording streams count
- Bandwidth in/out graphs
- Recording retention days

### 4. create_network_dashboard
Creates a dashboard with network health metrics including:
- Packet loss graph
- Latency graph
- Bandwidth utilization graph
- Throughput graph

### 5. create_special_cameras_dashboard
Creates a dashboard for special camera types with:

LPR Camera section:
- Plates detected count
- Recognition rate graph

PTZ Camera section:
- Pan position
- Tilt position
- Zoom level
- Movement activity

## Data Structure

The tools expect metrics to be stored in InfluxDB with:
- Measurement name: `device_metrics`
- Tagged with: `device_id`
- Fields matching the panel metrics (e.g., temperature, bitrate, fps, etc.)

## Prerequisites

- Grafana running on port 3000
- InfluxDB running on port 8086
- Admin credentials configured (default: admin/cameranet123)

#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';

const GRAFANA_URL = 'http://localhost:3000';
const GRAFANA_AUTH = {
  username: 'admin',
  password: 'cameranet123'
};

class GrafanaManager {
  private async grafanaRequest(method: string, endpoint: string, data?: any) {
    try {
      const response = await axios({
        method,
        url: `${GRAFANA_URL}/api/${endpoint}`,
        auth: GRAFANA_AUTH,
        data,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Grafana API error: ${error.response?.data?.message || error.message}`);
    }
  }

  async configureInfluxDB(org: string, token: string, bucket: string) {
    const datasource = {
      name: 'InfluxDB',
      type: 'influxdb',
      url: 'http://localhost:8086',
      access: 'proxy',
      basicAuth: false,
      isDefault: true,
      jsonData: {
        version: 'Flux',
        organization: org,
        defaultBucket: bucket,
      },
      secureJsonData: {
        token: token
      }
    };

    return this.grafanaRequest('POST', 'datasources', datasource);
  }

  async createDashboard(title: string, panels: any[]) {
    const dashboard = {
      dashboard: {
        title,
        panels,
        editable: true,
        time: {
          from: 'now-6h',
          to: 'now'
        },
        refresh: '10s'
      },
      overwrite: true
    };

    return this.grafanaRequest('POST', 'dashboards/db', dashboard);
  }
}

const grafanaManager = new GrafanaManager();

const server = new Server(
  {
    name: "grafana-manager",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "configure_influxdb",
        description: "Configure InfluxDB data source in Grafana",
        inputSchema: {
          type: "object",
          properties: {
            organization: {
              type: "string",
              description: "InfluxDB organization"
            },
            token: {
              type: "string",
              description: "InfluxDB access token"
            },
            bucket: {
              type: "string",
              description: "Default bucket name"
            }
          },
          required: ["organization", "token", "bucket"]
        }
      },
      {
        name: "create_camera_overview_dashboard",
        description: "Create Camera Overview Dashboard",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "create_nvr_dashboard",
        description: "Create NVR Performance Dashboard",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "create_network_dashboard",
        description: "Create Network Health Dashboard",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      },
      {
        name: "create_special_cameras_dashboard",
        description: "Create Special Cameras Dashboard",
        inputSchema: {
          type: "object",
          properties: {},
          required: []
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  switch (request.params.name) {
    case "configure_influxdb": {
      const { organization, token, bucket } = request.params.arguments as any;
      await grafanaManager.configureInfluxDB(organization, token, bucket);
      return {
        content: [{
          type: "text",
          text: "InfluxDB data source configured successfully"
        }]
      };
    }

    case "create_camera_overview_dashboard": {
      const panels = [
        {
          title: 'Camera Status',
          type: 'stat',
          gridPos: { x: 0, y: 0, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "status")
              |> group(columns: ["status"])
              |> count()`
          }]
        },
        {
          title: 'Temperature',
          type: 'gauge',
          gridPos: { x: 8, y: 0, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "temperature")`
          }]
        },
        {
          title: 'Stream Status',
          type: 'stat',
          gridPos: { x: 16, y: 0, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "stream_active")`
          }]
        },
        {
          title: 'Recording Status',
          type: 'stat',
          gridPos: { x: 0, y: 4, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "recording")`
          }]
        },
        {
          title: 'Bitrate',
          type: 'graph',
          gridPos: { x: 8, y: 4, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "bitrate")`
          }]
        },
        {
          title: 'FPS',
          type: 'graph',
          gridPos: { x: 16, y: 4, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "fps")`
          }]
        }
      ];

      await grafanaManager.createDashboard('Camera Overview', panels);
      return {
        content: [{
          type: "text",
          text: "Camera Overview dashboard created successfully"
        }]
      };
    }

    case "create_nvr_dashboard": {
      const panels = [
        {
          title: 'Storage Usage',
          type: 'gauge',
          gridPos: { x: 0, y: 0, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "storage_used" or r["_field"] == "storage_total")`
          }]
        },
        {
          title: 'CPU Usage',
          type: 'graph',
          gridPos: { x: 8, y: 0, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "cpu_usage")`
          }]
        },
        {
          title: 'Memory Usage',
          type: 'graph',
          gridPos: { x: 16, y: 0, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "memory_usage")`
          }]
        },
        {
          title: 'Recording Streams',
          type: 'stat',
          gridPos: { x: 0, y: 4, w: 8, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "recording_streams")`
          }]
        },
        {
          title: 'Bandwidth',
          type: 'graph',
          gridPos: { x: 8, y: 4, w: 16, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "bandwidth_in" or r["_field"] == "bandwidth_out")`
          }]
        }
      ];

      await grafanaManager.createDashboard('NVR Performance', panels);
      return {
        content: [{
          type: "text",
          text: "NVR Performance dashboard created successfully"
        }]
      };
    }

    case "create_network_dashboard": {
      const panels = [
        {
          title: 'Packet Loss',
          type: 'graph',
          gridPos: { x: 0, y: 0, w: 12, h: 8 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "packet_loss")`
          }]
        },
        {
          title: 'Latency',
          type: 'graph',
          gridPos: { x: 12, y: 0, w: 12, h: 8 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "latency")`
          }]
        },
        {
          title: 'Bandwidth Utilization',
          type: 'graph',
          gridPos: { x: 0, y: 8, w: 12, h: 8 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "bandwidth_utilization")`
          }]
        },
        {
          title: 'Throughput',
          type: 'graph',
          gridPos: { x: 12, y: 8, w: 12, h: 8 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["_field"] == "throughput")`
          }]
        }
      ];

      await grafanaManager.createDashboard('Network Health', panels);
      return {
        content: [{
          type: "text",
          text: "Network Health dashboard created successfully"
        }]
      };
    }

    case "create_special_cameras_dashboard": {
      const panels = [
        // LPR Section
        {
          title: 'Plates Detected',
          type: 'stat',
          gridPos: { x: 0, y: 0, w: 12, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["device_id"] == "cam-lpr-01")
              |> filter(fn: (r) => r["_field"] == "plates_detected")`
          }]
        },
        {
          title: 'Recognition Rate',
          type: 'graph',
          gridPos: { x: 12, y: 0, w: 12, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["device_id"] == "cam-lpr-01")
              |> filter(fn: (r) => r["_field"] == "recognition_rate")`
          }]
        },
        // PTZ Section
        {
          title: 'Pan Position',
          type: 'gauge',
          gridPos: { x: 0, y: 4, w: 6, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["device_id"] == "cam-ptz-01")
              |> filter(fn: (r) => r["_field"] == "pan_position")`
          }]
        },
        {
          title: 'Tilt Position',
          type: 'gauge',
          gridPos: { x: 6, y: 4, w: 6, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["device_id"] == "cam-ptz-01")
              |> filter(fn: (r) => r["_field"] == "tilt_position")`
          }]
        },
        {
          title: 'Zoom Level',
          type: 'gauge',
          gridPos: { x: 12, y: 4, w: 6, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["device_id"] == "cam-ptz-01")
              |> filter(fn: (r) => r["_field"] == "zoom_level")`
          }]
        },
        {
          title: 'Movement Activity',
          type: 'graph',
          gridPos: { x: 18, y: 4, w: 6, h: 4 },
          targets: [{
            refId: 'A',
            query: `from(bucket: "cameranet-bucket")
              |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
              |> filter(fn: (r) => r["_measurement"] == "device_metrics")
              |> filter(fn: (r) => r["device_id"] == "cam-ptz-01")
              |> filter(fn: (r) => r["_field"] == "pan_position" or r["_field"] == "tilt_position" or r["_field"] == "zoom_level")`
          }]
        }
      ];

      await grafanaManager.createDashboard('Special Cameras', panels);
      return {
        content: [{
          type: "text",
          text: "Special Cameras dashboard created successfully"
        }]
      };
    }

    default:
      throw new Error("Unknown tool");
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Grafana Manager MCP server running on stdio');
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

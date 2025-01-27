import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getRFScanResults } from '../services/api';

const DetailScreen = ({ route }) => {
  const { device } = route.params;
  const [rfData, setRfData] = useState(null);

  useEffect(() => {
    if (device.type === 'nanobeam') {
      getRFScanResults(device.buildingId)
        .then(data => setRfData(data))
        .catch(error => console.error('Failed to fetch RF data:', error));
    }
  }, [device]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{device.name}</Text>
        <Text style={[styles.status, { color: getStatusColor(device.status) }]}>
          {device.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Type:</Text>
          <Text>{device.type}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>IP Address:</Text>
          <Text>{device.ipAddress}</Text>
        </View>
        {device.type === 'nanobeam' && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>RSSI:</Text>
              <Text>{device.rssi} dBm</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Channel:</Text>
              <Text>{device.channel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Bandwidth:</Text>
              <Text>{device.bandwidth} Mbps</Text>
            </View>
          </>
        )}
      </View>

      {rfData && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RF Scan Results</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Interference Level:</Text>
            <Text>{rfData.interferenceLevel}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Recommended Channel:</Text>
            <Text>{rfData.recommendedChannel}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Alerts</Text>
        {device.alerts?.map((alert, index) => (
          <View key={index} style={styles.alertItem}>
            <Text style={styles.alertTime}>{new Date(alert.timestamp).toLocaleString()}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status) => {
  const colors = {
    online: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    offline: '#9E9E9E'
  };
  return colors[status] || colors.offline;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontWeight: '500',
    width: 140,
  },
  alertItem: {
    marginBottom: 12,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
  },
  alertMessage: {
    marginTop: 4,
  },
});

export default DetailScreen;

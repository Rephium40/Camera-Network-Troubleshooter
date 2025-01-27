import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';

const STATUS_COLORS = {
  online: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  offline: '#9E9E9E'
};

const MapMarker = ({ type, status, name, rssi, onPress }) => {
  const markerColor = STATUS_COLORS[status] || STATUS_COLORS.offline;
  
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.container, { borderColor: markerColor }]}>
        <View style={[styles.dot, { backgroundColor: markerColor }]} />
        <Text style={styles.name}>{name}</Text>
        {rssi && <Text style={styles.rssi}>{rssi} dBm</Text>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  name: {
    fontSize: 12,
    fontWeight: '500',
  },
  rssi: {
    fontSize: 10,
    color: '#666',
  },
});

export default MapMarker;

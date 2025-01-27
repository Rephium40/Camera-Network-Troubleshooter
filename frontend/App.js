import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapView, { Marker } from 'react-native-maps';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapMarker from './components/MapMarker';
import DetailScreen from './screens/DetailScreen';
import { getCameraStatus, getNanoBeamStatus } from './services/api';

const Stack = createNativeStackNavigator();

const MapScreen = ({ navigation }) => {
  const [cameras, setCameras] = useState([]);
  const [nanoBeams, setNanoBeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cameraData, nanoBeamData] = await Promise.all([
          getCameraStatus(),
          getNanoBeamStatus()
        ]);
        setCameras(cameraData);
        setNanoBeams(nanoBeamData);
      } catch (error) {
        console.error('Failed to fetch device status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {cameras.map(camera => (
          <Marker
            key={camera.id}
            coordinate={{
              latitude: camera.latitude,
              longitude: camera.longitude
            }}
          >
            <MapMarker
              type="camera"
              status={camera.status}
              name={camera.name}
              onPress={() => navigation.navigate('Detail', { device: camera })}
            />
          </Marker>
        ))}
        {nanoBeams.map(beam => (
          <Marker
            key={beam.id}
            coordinate={{
              latitude: beam.latitude,
              longitude: beam.longitude
            }}
          >
            <MapMarker
              type="nanobeam"
              status={beam.status}
              name={beam.name}
              rssi={beam.rssi}
              onPress={() => navigation.navigate('Detail', { device: beam })}
            />
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Map">
        <Stack.Screen 
          name="Map" 
          component={MapScreen}
          options={{ title: 'Camera Network Map' }}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={({ route }) => ({ 
            title: route.params.device.name,
            headerBackTitle: 'Map'
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default App;

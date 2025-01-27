import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const getCameraStatus = async () => {
  try {
    const response = await api.get('/cameras/status');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch camera status:', error);
    throw error;
  }
};

export const getNanoBeamStatus = async () => {
  try {
    const response = await api.get('/nanobeams/status');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch NanoBeam status:', error);
    throw error;
  }
};

export const getAlerts = async () => {
  try {
    const response = await api.get('/alerts');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch alerts:', error);
    throw error;
  }
};

export const getRFScanResults = async (buildingId) => {
  try {
    const response = await api.get(`/rf-scan/${buildingId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch RF scan results:', error);
    throw error;
  }
};

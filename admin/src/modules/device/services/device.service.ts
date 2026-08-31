import apiClient from '../../../lib/api/client';
import { ApiResponse } from '../../../types/api';

export interface DeviceData {
  id: string;
  name: string;
  deviceUid: string;
  location?: string;
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
  mode: 'LISTENING' | 'ENROLL' | 'UPDATE';
  lastSeen?: string;
  firmwareVersion?: string;
  activeSensors?: string[];
  modeOperationId?: string;
}

export const deviceApi = {
  getAll: async (): Promise<ApiResponse<DeviceData[]>> => {
    const response = await apiClient.get('/devices');
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data } as any;
    }
    return response.data;
  },

  getOne: async (id: string): Promise<ApiResponse<DeviceData>> => {
    const response = await apiClient.get(`/devices/${id}`);
    return response.data;
  },

  create: async (data: { name: string; deviceUid: string; location?: string }): Promise<ApiResponse<DeviceData>> => {
    const response = await apiClient.post('/devices', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DeviceData>): Promise<ApiResponse<DeviceData>> => {
    const response = await apiClient.patch(`/devices/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/devices/${id}`);
    return response.data;
  },

  enable: async (id: string): Promise<ApiResponse<DeviceData>> => {
    const response = await apiClient.post(`/devices/${id}/enable`);
    return response.data;
  },

  disable: async (id: string): Promise<ApiResponse<DeviceData>> => {
    const response = await apiClient.post(`/devices/${id}/disable`);
    return response.data;
  },

  getStatus: async (id: string): Promise<{ status: string; mode: string; lastSeen: string }> => {
    const response = await apiClient.get(`/devices/${id}/status`);
    return response.data;
  },

  getEvents: async (id: string): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get(`/devices/${id}/events`);
    return response.data;
  },
};

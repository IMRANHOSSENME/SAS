import apiClient from '../../../lib/api/client';
import { ApiResponse } from '../../../types/api';

export interface DeviceData {
  id: string;
  name: string;
  deviceUid: string;
  location?: string;
  status: 'ACTIVE' | 'PENDING' | 'DISABLED';
  lastSeen?: string;
  firmwareVersion?: string;
  activeSensors?: string[];
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

  enroll: async (id: string, userId: string, type: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/devices/${id}/enroll`, { userId, type });
    return response.data;
  },

  getEnrollmentStatus: async (id: string): Promise<{ status: string; message: string; updatedAt: string }> => {
    const response = await apiClient.get(`/devices/${id}/enrollment-status`);
    return response.data;
  },
};

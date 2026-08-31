import apiClient from '../../../lib/api/client';
import { ApiResponse } from '../../../types/api';

export interface BiometricData {
  id: string;
  userId: string;
  deviceId: string;
  fingerprintId: number;
  status: string;
  template1?: string;
  template2?: string;
  updatedAt: string;
}

export const biometricApi = {
  getAll: async (userId?: string): Promise<ApiResponse<BiometricData[]>> => {
    const url = userId ? `/biometrics?userId=${userId}` : '/biometrics';
    const response = await apiClient.get(url);
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data } as any;
    }
    return response.data;
  },
  
  getOne: async (id: string): Promise<ApiResponse<BiometricData>> => {
    const response = await apiClient.get(`/biometrics/${id}`);
    return response.data;
  },

  remove: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/biometrics/${id}`);
    return response.data;
  },
};

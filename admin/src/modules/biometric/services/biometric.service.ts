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
  getAll: async (): Promise<ApiResponse<BiometricData[]>> => {
    const response = await apiClient.get('/biometrics');
    // Backend returns a plain array, normalize to ApiResponse format
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data } as any;
    }
    return response.data;
  },
  
  getByUser: async (userId: string): Promise<ApiResponse<BiometricData>> => {
    const response = await apiClient.get(`/biometrics/user/${userId}`);
    return response.data;
  },

  enroll: async (data: { userId: string, deviceId: string, fingerName?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post('/biometrics/enroll', data);
    return response.data;
  },

  completeEnroll: async (id: string, data: { fingerprintId: number }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/biometrics/enroll/${id}/complete`, data);
    return response.data;
  },

  remove: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/biometrics/${id}`);
    return response.data;
  },
};

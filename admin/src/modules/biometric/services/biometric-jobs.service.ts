import apiClient from '../../../lib/api/client';
import { ApiResponse } from '../../../types/api';

export interface BiometricJobData {
  id: string;
  userId: string;
  deviceId: string;
  type: 'ENROLL' | 'UPDATE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  oldFingerprintId?: number;
  newFingerprintId?: number;
  failureReason?: string;
  requestedBy: string;
  requestedAt: string;
  completedAt?: string;
  expiresAt: string;
}

export const biometricJobsApi = {
  getAll: async (): Promise<ApiResponse<BiometricJobData[]>> => {
    const response = await apiClient.get('/biometric-jobs');
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data } as any;
    }
    return response.data;
  },
  
  getOne: async (id: string): Promise<ApiResponse<BiometricJobData>> => {
    const response = await apiClient.get(`/biometric-jobs/${id}`);
    return response.data;
  },

  create: async (data: { userId: string; deviceId: string; type: 'ENROLL' | 'UPDATE'; oldFingerprintId?: number }): Promise<ApiResponse<BiometricJobData>> => {
    const response = await apiClient.post('/biometric-jobs', data);
    return response.data;
  },

  cancel: async (id: string): Promise<ApiResponse<BiometricJobData>> => {
    const response = await apiClient.patch(`/biometric-jobs/${id}/cancel`);
    return response.data;
  },
};

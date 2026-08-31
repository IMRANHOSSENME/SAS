import apiClient from '../../../lib/api/client';
import { ApiResponse } from '../../../types/api';

export interface UserData {
  id: string;
  studentId: string;
  fullName: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  status: string;
  createdAt?: string;
}

export const userApi = {
  getAll: async (): Promise<ApiResponse<UserData[]>> => {
    const response = await apiClient.get('/users');
    if (Array.isArray(response.data)) {
      return { success: true, data: response.data } as any;
    }
    return response.data;
  },
  
  getOne: async (id: string): Promise<ApiResponse<UserData>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  create: async (data: Partial<UserData>): Promise<ApiResponse<UserData>> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<UserData>): Promise<ApiResponse<UserData>> => {
    const response = await apiClient.patch(`/users/${id}`, data);
    return response.data;
  },

  remove: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

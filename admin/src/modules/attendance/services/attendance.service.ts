import apiClient from '../../../lib/api/client';
import { ApiResponse, PaginatedResponse } from '../../../types/api';

export interface AttendanceData {
  id: string;
  userId: string;
  userName?: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';
}

export const attendanceApi = {
  getAll: async (params?: any): Promise<ApiResponse<PaginatedResponse<AttendanceData>>> => {
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  },
  
  getByUser: async (userId: string): Promise<ApiResponse<AttendanceData[]>> => {
    const response = await apiClient.get(`/attendance/user/${userId}`);
    return response.data;
  },

  getLiveFeed: async (date?: string): Promise<any> => {
    const response = await apiClient.get('/attendance/live', { params: { date } });
    return response.data;
  },

  getSummary: async (date?: string): Promise<any> => {
    const response = await apiClient.get('/attendance/summary', { params: { date } });
    return response.data;
  }
};

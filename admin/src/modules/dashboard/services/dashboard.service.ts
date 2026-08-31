import apiClient from '../../../lib/api/client';
import { ApiResponse } from '../../../types/api';

export interface DashboardStats {
  totalUsers: number;
  totalDevices: number;
  activeDevices: number;
  presentToday: number;
  absentToday: number;
  recentActivity: any[]; // Or define an Activity type
}

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get('/dashboard/stats');
    return response.data;
  },
};

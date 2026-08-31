import axios from 'axios';
import { setupInterceptors } from './interceptor';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

setupInterceptors(apiClient);

export default apiClient;

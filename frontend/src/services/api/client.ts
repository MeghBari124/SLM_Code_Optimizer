import axios from 'axios';
import type { ApiResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 120000, // Increased to 2 minutes for long LLM generation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (Phase 3+)
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 402 Payment Required
    if (error.response?.status === 402) {
      // Payment flow will be handled by x402 service
      return Promise.reject(error);
    }

    let defaultMsg = 'An unexpected error occurred';
    if (error.code === 'ECONNABORTED') {
      defaultMsg = 'Request timed out waiting for AI optimization. Please try again.';
    } else if (!error.response) {
      defaultMsg = 'Network error. Please check if the backend is running.';
    }

    // Generic error handling
    const apiError = {
      code: error.response?.data?.error?.code || error.code || 'UNKNOWN_ERROR',
      message: error.response?.data?.error?.message || defaultMsg,
      details: error.response?.data?.error?.details,
    };

    return Promise.reject(apiError);
  }
);

// Helper function for making API calls
export async function apiRequest<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  const response = await apiClient.request<ApiResponse<T>>({
    method,
    url,
    data,
  });
  return response.data;
}

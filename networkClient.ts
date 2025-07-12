import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import store from './src/redux/store';
import { RootState } from './src/redux/store';

const networkClient = axios.create({
  baseURL: 'https://your-api-url.com/api', // TODO: Replace with your API base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token from Redux store
networkClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const state: RootState = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for global error handling
networkClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Example: handle unauthorized globally
    if (error.response && error.response.status === 401) {
      // Optionally dispatch logout or clear token
    }
    return Promise.reject(error);
  }
);

export default networkClient; 
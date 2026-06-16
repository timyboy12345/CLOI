import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

export const getUploadsUrl = (path: string) => {
  if (!path) return '';
  return `${API_URL}/uploads/${path}`;
};

export default api;

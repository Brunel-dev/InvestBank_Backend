import axios from 'axios';

const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const WHATSAPP_AGENT: string =
  (import.meta as any).env?.VITE_WHATSAPP_AGENT || '237695745145';

export const buildWhatsAppLink = (message: string) => {
  return `https://wa.me/${WHATSAPP_AGENT}?text=${encodeURIComponent(message)}`;
};

export default api;

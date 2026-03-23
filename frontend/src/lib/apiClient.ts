import axios from 'axios';
import { env } from './env';

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30_000
});


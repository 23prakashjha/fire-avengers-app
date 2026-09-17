import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, '')
  : import.meta.env.DEV
    ? ''
    : 'https://6qrm4mwj7i.c39.airoapp.ai';

const api = axios.create({
  baseURL: apiBaseUrl ? `${apiBaseUrl}/api` : '/api',
});

export default api;
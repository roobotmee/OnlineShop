import axios from 'axios';

// export const BASE_URL = `http://46.19.67.78:3000`;
export const BASE_URL = `http://localhost:3000`;

export const http = axios.create({
  baseURL: BASE_URL,
});
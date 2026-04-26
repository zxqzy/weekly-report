/**
 * Axios HTTP 客户端配置
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器
client.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// 响应拦截器：统一解包 { code, message, data } 结构
client.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data;
    if (code !== 0) {
      return Promise.reject(new Error(message || '请求失败'));
    }
    return data;
  },
  (error) => {
    const msg =
      error.response?.data?.message ||
      error.message ||
      '网络错误，请稍后重试';
    return Promise.reject(new Error(msg));
  }
);

export default client;

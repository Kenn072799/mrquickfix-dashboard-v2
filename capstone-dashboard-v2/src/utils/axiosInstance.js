import axios from 'axios';
import { isTokenExpired } from './tokenUtils';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");
        if (!token || isTokenExpired(token)) {
            alert('Session expired. Please log in again.');
            window.location.href = '/login-admin';
            return Promise.reject('Token expired');
        }
        config.headers['Authorization'] = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export default axiosInstance;

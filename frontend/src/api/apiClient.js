import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import { Platform } from 'react-native';

const API_URL = Platform.OS === 'web' 
    ? 'http://localhost:8080/api' 
    : 'http://10.0.2.2:8080/api'; // 10.0.2.2 para emuladores Android

const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use(async (config) => {
    try {
        const token = Platform.OS === 'web' 
            ? localStorage.getItem('jwt_token')
            : await SecureStore.getItemAsync('jwt_token');
            
        if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch (e) {
        console.warn("Storage error", e);
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            try {
                if (Platform.OS === 'web') localStorage.removeItem('jwt_token');
                else await SecureStore.deleteItemAsync('jwt_token');
            } catch (e){}
        }
        return Promise.reject(error);
    }
);

export default apiClient;

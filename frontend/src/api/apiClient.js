import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Lee la URL desde app.json → extra.apiUrl
// Para producción: cambiar "apiUrl" en app.json antes del build con EAS
const getApiUrl = () => {
    if (Platform.OS === 'web') {
        return process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';
    }
    return Constants.expoConfig?.extra?.apiUrl || 'http://10.0.2.2:8080/api';
};

const apiClient = axios.create({ baseURL: getApiUrl() });

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
            } catch (e) {}
        }
        return Promise.reject(error);
    }
);

export default apiClient;

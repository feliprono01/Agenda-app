import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkToken();
    }, []);

    const checkToken = async () => {
        try {
            const token = Platform.OS === 'web'
                ? localStorage.getItem('jwt_token')
                : await SecureStore.getItemAsync('jwt_token');
                
            if (token) {
                setUser({ token });
            }
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { token, nombre } = response.data;
        
        if (Platform.OS === 'web') {
            localStorage.setItem('jwt_token', token);
        } else {
            await SecureStore.setItemAsync('jwt_token', token);
        }
        setUser({ token, nombre });
    };

    const logout = async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem('jwt_token');
        } else {
            await SecureStore.deleteItemAsync('jwt_token');
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

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
            const role = Platform.OS === 'web'
                ? localStorage.getItem('user_role')
                : await SecureStore.getItemAsync('user_role');

            if (token) {
                setUser({ token, role });
            }
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await apiClient.post('/auth/login', { email, password });
        const { token, nombre, role } = response.data;

        if (Platform.OS === 'web') {
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('user_role', role);
        } else {
            await SecureStore.setItemAsync('jwt_token', token);
            await SecureStore.setItemAsync('user_role', role);
        }
        setUser({ token, nombre, role });
    };

    const logout = async () => {
        if (Platform.OS === 'web') {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
        } else {
            await SecureStore.deleteItemAsync('jwt_token');
            await SecureStore.deleteItemAsync('user_role');
        }
        setUser(null);
    };

    const isAdmin = user?.role === 'ROLE_ADMIN';

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

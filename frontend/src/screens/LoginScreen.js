import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if(!email || !password) return Alert.alert('Aviso', 'Por favor completá todos los datos.');
        setLoading(true);
        try {
            await login(email, password);
        } catch (e) {
            Alert.alert('Error', 'Credenciales inválidas o error en el servidor. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.card}>
                <View style={styles.iconContainer}>
                    <FontAwesome5 name="stethoscope" size={40} color={theme.colors.primary} />
                </View>
                
                <Text style={styles.title}>Consultorio Mágico</Text>
                <Text style={styles.subtitle}>Gestión Médica Premium</Text>

                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="envelope" size={16} color={theme.colors.primary} style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Correo electrónico" 
                            placeholderTextColor={theme.colors.textLight}
                            value={email} 
                            onChangeText={setEmail} 
                            autoCapitalize="none"
                            keyboardType="email-address"
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="lock" size={16} color={theme.colors.primary} style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Contraseña" 
                            placeholderTextColor={theme.colors.textLight}
                            value={password} 
                            onChangeText={setPassword} 
                            secureTextEntry 
                            editable={!loading}
                        />
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={[styles.btn, loading && styles.btnDisabled]} 
                    onPress={handleLogin} 
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color={theme.colors.surface} />
                    ) : (
                        <Text style={styles.btnText}>Iniciar Sesión</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: theme.spacing.m
    },
    card: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.xl,
        borderRadius: theme.radii.xl,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 8,
        alignItems: 'center'
    },
    iconContainer: {
        width: 80,
        height: 80,
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii.round,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
        borderWidth: 2,
        borderColor: theme.colors.border
    },
    title: { 
        fontSize: 26,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
        fontFamily: theme.fonts.bold
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textLight,
        marginBottom: theme.spacing.xl,
        fontFamily: theme.fonts.regular
    },
    inputWrapper: {
        width: '100%',
        gap: theme.spacing.m
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.m,
        paddingHorizontal: theme.spacing.m,
        height: 56
    },
    inputIcon: {
        marginRight: theme.spacing.m
    },
    input: { 
        flex: 1,
        height: '100%',
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        fontSize: 16,
        outlineStyle: 'none'
    },
    btn: { 
        backgroundColor: theme.colors.cta, 
        width: '100%', 
        height: 56, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: theme.radii.m,
        marginTop: theme.spacing.xl,
        shadowColor: theme.colors.cta,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4
    },
    btnDisabled: {
        backgroundColor: theme.colors.primary,
        opacity: 0.7
    },
    btnText: { 
        color: theme.colors.surface, 
        fontSize: 18, 
        fontFamily: theme.fonts.bold
    }
});

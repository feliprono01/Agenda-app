import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import apiClient from '../api/apiClient';
import { theme } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

export default function NuevoPacienteScreen({ navigation, route }) {
    const { onGoBack } = route.params || {};

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [dni, setDni] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGuardar = async () => {
        if (!nombre || !apellido || !telefono) {
            return Alert.alert('Aviso', 'Por favor, ingresá al menos el nombre, apellido y teléfono.');
        }

        setLoading(true);
        try {
            // Normalizar teléfono: quitar espacios, guiones y paréntesis (conservar el +)
            const telefonoNormalizado = telefono.replace(/[\s\-().]/g, '');

            await apiClient.post('/pacientes', {
                nombre,
                apellido,
                telefono: telefonoNormalizado,
                email,
                dni
            });
            Alert.alert('Éxito', 'Paciente registrado correctamente');
            if (onGoBack) onGoBack();
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'No se pudo guardar el paciente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <FontAwesome5 name="arrow-left" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Nuevo Paciente</Text>
                    <View style={{ width: 20 }} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Datos Personales</Text>

                    <View style={styles.row}>
                        <View style={[styles.inputContainer, { flex: 1, marginRight: theme.spacing.s }]}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Nombre" 
                                placeholderTextColor={theme.colors.textLight}
                                value={nombre} 
                                onChangeText={setNombre} 
                                editable={!loading}
                            />
                        </View>

                        <View style={[styles.inputContainer, { flex: 1, marginLeft: theme.spacing.s }]}>
                            <TextInput 
                                style={styles.input} 
                                placeholder="Apellido" 
                                placeholderTextColor={theme.colors.textLight}
                                value={apellido} 
                                onChangeText={setApellido} 
                                editable={!loading}
                            />
                        </View>
                    </View>

                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="id-card" size={16} color={theme.colors.primary} style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="DNI / Documento" 
                            placeholderTextColor={theme.colors.textLight}
                            value={dni} 
                            onChangeText={setDni} 
                            keyboardType="numeric" 
                            editable={!loading}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Contacto (WhatsApp)</Text>

                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="whatsapp" size={18} color="#25D366" style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Ej: +5493415551234" 
                            placeholderTextColor={theme.colors.textLight}
                            value={telefono} 
                            onChangeText={setTelefono} 
                            keyboardType="phone-pad" 
                            editable={!loading}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <FontAwesome5 name="envelope" size={16} color={theme.colors.primary} style={styles.inputIcon} />
                        <TextInput 
                            style={styles.input} 
                            placeholder="Email (opcional)" 
                            placeholderTextColor={theme.colors.textLight}
                            value={email} 
                            onChangeText={setEmail} 
                            keyboardType="email-address"
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>
                    
                    <TouchableOpacity 
                        style={[styles.btn, loading && styles.btnDisabled]} 
                        onPress={handleGuardar}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.surface} />
                        ) : (
                            <>
                                <FontAwesome5 name="user-plus" size={18} color={theme.colors.surface} style={{ marginRight: 8 }} />
                                <Text style={styles.btnText}>Guardar Paciente</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { padding: theme.spacing.m, paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
        marginBottom: theme.spacing.l,
    },
    backBtn: { padding: theme.spacing.s },
    title: { fontSize: 22, color: theme.colors.text, fontFamily: theme.fonts.bold },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.l,
        padding: theme.spacing.l,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    sectionTitle: {
        fontSize: 16,
        color: theme.colors.primary,
        fontFamily: theme.fonts.bold,
        marginTop: theme.spacing.s,
        marginBottom: theme.spacing.m,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.m,
        paddingHorizontal: theme.spacing.m,
        marginBottom: theme.spacing.m,
        minHeight: 56
    },
    inputIcon: {
        marginRight: theme.spacing.m,
        width: 20,
        textAlign: 'center'
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
        flexDirection: 'row',
        backgroundColor: theme.colors.cta, 
        width: '100%', 
        height: 56, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderRadius: theme.radii.m,
        marginTop: theme.spacing.m,
        shadowColor: theme.colors.cta,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4
    },
    btnDisabled: {
        opacity: 0.7
    },
    btnText: { 
        color: theme.colors.surface, 
        fontSize: 18, 
        fontFamily: theme.fonts.bold
    }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import apiClient from '../api/apiClient';
import { theme } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

export default function DetalleTurnoScreen({ route, navigation }) {
    const { turno } = route.params;
    const [loading, setLoading] = useState(false);

    const cancelarTurno = async () => {
        const executeCancel = async () => {
            setLoading(true);
            try {
                await apiClient.delete(`/turnos/${turno.id}`);
                if (Platform.OS === 'web') {
                    window.alert("Turno cancelado correctamente");
                } else {
                    Alert.alert('Éxito', 'Turno cancelado correctamente');
                }
                if (route.params.onGoBack) route.params.onGoBack();
                navigation.goBack();
            } catch (e) {
                if (Platform.OS === 'web') {
                    window.alert("No se pudo cancelar el turno");
                } else {
                    Alert.alert('Error', 'No se pudo cancelar el turno');
                }
                setLoading(false);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("¿Estás seguro que deseas cancelar este turno? Esta acción no se puede deshacer.")) {
                executeCancel();
            }
        } else {
            Alert.alert(
                "Cancelar Turno",
                "¿Estás seguro que deseas cancelar este turno? Esta acción no se puede deshacer.",
                [
                    { text: "Mantener", style: "cancel" },
                    { text: "Sí, Cancelar", style: "destructive", onPress: executeCancel }
                ]
            );
        }
    };

    const isCancelado = turno.estado === 'CANCELADO';
    // Determinar nombre, en HomeScreen vimos que usaban paciente.nombre y paciente.apellido pero luego arreglamos a pacienteNombre.
    const pacienteStr = turno.pacienteNombre || (turno.paciente ? `${turno.paciente.nombre} ${turno.paciente.apellido}` : 'Sin nombre');

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <FontAwesome5 name="arrow-left" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Detalles del Turno</Text>
                    <View style={{ width: 20 }} />
                </View>

                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <FontAwesome5 name="user-alt" size={24} color={theme.colors.primary} />
                    </View>
                    
                    <Text style={styles.pacienteName}>{pacienteStr}</Text>
                    
                    <View style={[styles.statusBadge, { backgroundColor: isCancelado ? '#FEE2E2' : '#D1FAE5' }]}>
                        <Text style={[styles.statusText, { color: isCancelado ? theme.colors.error : theme.colors.cta }]}>
                            {turno.estado}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <FontAwesome5 name="calendar-alt" size={16} color={theme.colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Fecha y Hora</Text>
                            <Text style={styles.infoValue}>{turno.fechaHora.replace('T', ' a las ')}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <FontAwesome5 name="stethoscope" size={16} color={theme.colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Motivo de la consulta</Text>
                            <Text style={styles.infoValue}>{turno.motivo}</Text>
                        </View>
                    </View>
                </View>

                {!isCancelado && (
                    <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={cancelarTurno}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.error} />
                        ) : (
                            <>
                                <FontAwesome5 name="trash-alt" size={16} color={theme.colors.error} style={{ marginRight: 8 }} />
                                <Text style={styles.cancelBtnText}>Cancelar este Turno</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
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
        padding: theme.spacing.xl,
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        borderWidth: 2,
        borderColor: theme.colors.border,
    },
    pacienteName: {
        fontSize: 22,
        fontFamily: theme.fonts.bold,
        color: theme.colors.text,
        marginBottom: theme.spacing.s,
    },
    statusBadge: {
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 6,
        borderRadius: theme.radii.round,
        marginBottom: theme.spacing.l,
    },
    statusText: {
        fontSize: 12,
        fontFamily: theme.fonts.bold,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.l,
    },
    infoRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: theme.radii.m,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    infoLabel: {
        fontSize: 12,
        color: theme.colors.textLight,
        fontFamily: theme.fonts.medium,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
    },
    cancelBtn: {
        flexDirection: 'row',
        marginTop: theme.spacing.xl,
        padding: theme.spacing.m,
        borderRadius: theme.radii.m,
        borderWidth: 1.5,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: theme.colors.error,
        fontFamily: theme.fonts.bold,
        fontSize: 16,
    }
});

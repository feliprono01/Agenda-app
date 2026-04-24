import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Platform } from 'react-native';
import apiClient from '../api/apiClient';
import { theme } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

const ESTADO_CONFIG = {
    PENDIENTE:   { label: 'Pendiente',   bg: '#FEF9C3', color: '#92400E', icon: 'clock' },
    CONFIRMADO:  { label: 'Confirmado',  bg: '#D1FAE5', color: '#065F46', icon: 'check-circle' },
    CANCELADO:   { label: 'Cancelado',   bg: '#FEE2E2', color: '#991B1B', icon: 'times-circle' },
};

export default function DetalleTurnoScreen({ route, navigation }) {
    const { turno: turnoInicial } = route.params;
    const [turno, setTurno] = useState(turnoInicial);
    const [loading, setLoading] = useState(false);

    const estadoConf = ESTADO_CONFIG[turno.estado] || ESTADO_CONFIG.PENDIENTE;
    const pacienteStr = turno.pacienteNombre ||
        (turno.paciente ? `${turno.paciente.nombre} ${turno.paciente.apellido}` : 'Sin nombre');

    // ── Confirmar turno ──────────────────────────────────────────
    const confirmarTurno = () => {
        Alert.alert(
            'Confirmar Turno',
            `¿Confirmás el turno de ${pacienteStr}?`,
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, Confirmar', onPress: async () => {
                        setLoading(true);
                        try {
                            const { data } = await apiClient.patch(`/turnos/${turno.id}/confirmar`);
                            setTurno(data);
                        } catch (e) {
                            Alert.alert('Error', 'No se pudo confirmar el turno.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    // ── Cancelar turno ───────────────────────────────────────────
    const cancelarTurno = () => {
        Alert.alert(
            'Cancelar Turno',
            '¿Estás seguro que querés cancelar este turno?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, Cancelar', style: 'destructive', onPress: async () => {
                        setLoading(true);
                        try {
                            await apiClient.delete(`/turnos/${turno.id}`);
                            setTurno(prev => ({ ...prev, estado: 'CANCELADO' }));
                        } catch (e) {
                            Alert.alert('Error', 'No se pudo cancelar el turno.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const [hh, mm] = turno.fechaHora.split('T')[1]?.substring(0, 5).split(':') ?? ['--', '--'];
    const fecha = turno.fechaHora.split('T')[0];

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <FontAwesome5 name="arrow-left" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Detalle del Turno</Text>
                    <View style={{ width: 36 }} />
                </View>

                {/* Card principal */}
                <View style={styles.card}>
                    {/* Avatar + nombre */}
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarLetter}>
                            {pacienteStr.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.pacienteName}>{pacienteStr}</Text>

                    {/* Badge de estado */}
                    <View style={[styles.estadoBadge, { backgroundColor: estadoConf.bg }]}>
                        <FontAwesome5 name={estadoConf.icon} size={12} color={estadoConf.color} style={{ marginRight: 6 }} />
                        <Text style={[styles.estadoText, { color: estadoConf.color }]}>
                            {estadoConf.label}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Fecha y hora */}
                    <View style={styles.infoRow}>
                        <View style={styles.timeBox}>
                            <Text style={styles.timeHour}>{hh}:{mm}</Text>
                            <Text style={styles.timeDate}>{fecha.split('-').reverse().join('/')}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoLabel}>Motivo de consulta</Text>
                            <Text style={styles.infoValue}>{turno.motivo || 'Sin especificar'}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconBox}>
                            <FontAwesome5 name="hourglass-half" size={14} color={theme.colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.infoLabel}>Duración</Text>
                            <Text style={styles.infoValue}>{turno.duracionMinutos || 30} minutos</Text>
                        </View>
                    </View>
                </View>

                {/* ── Acciones según estado ── */}
                {loading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 32 }} />
                ) : (
                    <>
                        {/* PENDIENTE → puede confirmar o cancelar */}
                        {turno.estado === 'PENDIENTE' && (
                            <View style={styles.actionsRow}>
                                <TouchableOpacity style={styles.btnConfirmar} onPress={confirmarTurno}>
                                    <FontAwesome5 name="check" size={16} color="#fff" style={{ marginRight: 8 }} />
                                    <Text style={styles.btnConfirmarText}>Confirmar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnCancelar} onPress={cancelarTurno}>
                                    <FontAwesome5 name="times" size={16} color={theme.colors.error} style={{ marginRight: 8 }} />
                                    <Text style={styles.btnCancelarText}>Cancelar</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* CONFIRMADO → solo puede cancelar */}
                        {turno.estado === 'CONFIRMADO' && (
                            <TouchableOpacity style={[styles.btnCancelar, { marginTop: 24 }]} onPress={cancelarTurno}>
                                <FontAwesome5 name="times" size={16} color={theme.colors.error} style={{ marginRight: 8 }} />
                                <Text style={styles.btnCancelarText}>Cancelar turno</Text>
                            </TouchableOpacity>
                        )}

                        {/* CANCELADO → solo info */}
                        {turno.estado === 'CANCELADO' && (
                            <View style={styles.canceladoInfo}>
                                <FontAwesome5 name="info-circle" size={14} color={theme.colors.textLight} />
                                <Text style={styles.canceladoText}>Este turno fue cancelado y no puede modificarse.</Text>
                            </View>
                        )}
                    </>
                )}

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    scrollContent: { padding: theme.spacing.m, paddingBottom: 48 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 44 : 20,
        marginBottom: theme.spacing.l,
    },
    backBtn: { padding: 8 },
    title: { fontSize: 20, color: theme.colors.text, fontFamily: theme.fonts.bold },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.l,
        padding: theme.spacing.l,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
    },
    avatarCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarLetter: { fontSize: 28, color: theme.colors.primary, fontFamily: theme.fonts.bold },
    pacienteName: { fontSize: 22, fontFamily: theme.fonts.bold, color: theme.colors.text, marginBottom: 12 },
    estadoBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: theme.spacing.l,
    },
    estadoText: { fontSize: 13, fontFamily: theme.fonts.bold },
    divider: { width: '100%', height: 1, backgroundColor: theme.colors.border, marginBottom: theme.spacing.l },
    infoRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        gap: 12,
    },
    timeBox: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radii.m,
        padding: 12,
        alignItems: 'center',
        minWidth: 72,
    },
    timeHour: { fontSize: 20, color: '#fff', fontFamily: theme.fonts.bold },
    timeDate: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: theme.fonts.medium },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: theme.radii.m,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoLabel: { fontSize: 12, color: theme.colors.textLight, fontFamily: theme.fonts.medium, marginBottom: 2 },
    infoValue: { fontSize: 15, color: theme.colors.text, fontFamily: theme.fonts.medium },
    actionsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
    },
    btnConfirmar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.cta,
        paddingVertical: 14,
        borderRadius: theme.radii.m,
        elevation: 3,
        shadowColor: theme.colors.cta,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    btnConfirmarText: { color: '#fff', fontFamily: theme.fonts.bold, fontSize: 15 },
    btnCancelar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        paddingVertical: 14,
        borderRadius: theme.radii.m,
    },
    btnCancelarText: { color: theme.colors.error, fontFamily: theme.fonts.bold, fontSize: 15 },
    canceladoInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 24,
        padding: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: theme.radii.m,
    },
    canceladoText: { flex: 1, color: theme.colors.textLight, fontFamily: theme.fonts.regular, fontSize: 13 },
});

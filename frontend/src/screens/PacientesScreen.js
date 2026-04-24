import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { theme } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

export default function PacientesScreen({ navigation }) {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);

    const cargarPacientes = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/pacientes');
            setPacientes(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    // Recarga automática al volver de NuevoPaciente (crear o editar)
    useFocusEffect(useCallback(() => { cargarPacientes(); }, [cargarPacientes]));

    const editarPaciente = (paciente) => {
        navigation.navigate('NuevoPaciente', { paciente });
    };

    const eliminarPaciente = (id) => {
        const executeDelete = async () => {
            try {
                await apiClient.delete(`/pacientes/${id}`);
                cargarPacientes();
            } catch (e) {
                Alert.alert('Error', 'No se pudo eliminar el paciente.');
            }
        };

        Alert.alert(
            'Eliminar Paciente',
            '¿Seguro que querés eliminar este paciente? Se borrarán también sus turnos.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Eliminar', style: 'destructive', onPress: executeDelete }
            ]
        );
    };

    const getInitials = (nombre, apellido) =>
        `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: theme.spacing.s, marginRight: theme.spacing.m }}>
                        <FontAwesome5 name="arrow-left" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.title}>Directorio Médico</Text>
                        <Text style={styles.subtitle}>{pacientes.length} Registrados</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={pacientes}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <FontAwesome5 name="users" size={48} color={theme.colors.border} />
                            <Text style={styles.emptyText}>No hay pacientes registrados</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{getInitials(item.nombre, item.apellido)}</Text>
                            </View>

                            <View style={styles.cardInfo}>
                                <Text style={styles.nombre}>{item.nombre} {item.apellido}</Text>

                                <View style={styles.infoRow}>
                                    <FontAwesome5 name="phone" size={12} color={theme.colors.textLight} style={styles.icon} />
                                    <Text style={styles.detalle}>{item.telefono || 'Sin teléfono'}</Text>
                                </View>

                                <View style={styles.infoRow}>
                                    <FontAwesome5 name="envelope" size={12} color={theme.colors.textLight} style={styles.icon} />
                                    <Text style={styles.detalle}>{item.email || 'Sin email'}</Text>
                                </View>

                                {item.dni ? (
                                    <View style={styles.infoRow}>
                                        <FontAwesome5 name="id-card" size={12} color={theme.colors.textLight} style={styles.icon} />
                                        <Text style={styles.detalle}>DNI {item.dni}</Text>
                                    </View>
                                ) : null}
                            </View>

                            {/* Acciones */}
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}
                                    onPress={() => editarPaciente(item)}
                                >
                                    <FontAwesome5 name="edit" size={14} color="#3B82F6" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#FEF2F2', marginTop: 6 }]}
                                    onPress={() => eliminarPaciente(item.id)}
                                >
                                    <FontAwesome5 name="trash-alt" size={14} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('NuevoPaciente')}
                activeOpacity={0.8}
            >
                <FontAwesome5 name="user-plus" size={24} color={theme.colors.surface} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        paddingHorizontal: theme.spacing.l,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: { fontSize: 24, color: theme.colors.text, fontFamily: theme.fonts.bold },
    subtitle: { fontSize: 14, color: theme.colors.textLight, fontFamily: theme.fonts.medium, marginTop: 4 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: theme.spacing.m, paddingBottom: 100 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: theme.spacing.m, color: theme.colors.textLight, fontFamily: theme.fonts.medium, fontSize: 16 },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.radii.m,
        marginBottom: theme.spacing.m,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    avatar: {
        width: 50, height: 50,
        borderRadius: 25,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.primary + '40',
    },
    avatarText: { fontSize: 18, color: theme.colors.primary, fontFamily: theme.fonts.bold },
    cardInfo: { flex: 1 },
    nombre: { fontSize: 16, color: theme.colors.text, fontFamily: theme.fonts.bold, marginBottom: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    icon: { width: 16, marginRight: 4, textAlign: 'center' },
    detalle: { fontSize: 13, color: theme.colors.textLight, fontFamily: theme.fonts.regular },
    actions: { justifyContent: 'center', marginLeft: 8 },
    actionBtn: { padding: 8, borderRadius: theme.radii.s },
    fab: {
        position: 'absolute',
        bottom: 30, right: 30,
        width: 60, height: 60,
        backgroundColor: theme.colors.cta,
        borderRadius: 30,
        justifyContent: 'center', alignItems: 'center',
        elevation: 6,
        shadowColor: theme.colors.cta,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3, shadowRadius: 8,
    }
});

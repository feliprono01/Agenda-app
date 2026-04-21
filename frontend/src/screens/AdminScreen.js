import React, { useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet,
    ActivityIndicator, Alert, Modal, TextInput, ScrollView,
    KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { theme } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

const ROLES = [
    { label: 'Médico', value: 'ROLE_MEDICO' },
    { label: 'Administrador', value: 'ROLE_ADMIN' },
];

export default function AdminScreen({ navigation }) {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editando, setEditando] = useState(null); // null = nuevo usuario

    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('ROLE_MEDICO');
    const [guardando, setGuardando] = useState(false);

    const cargarUsuarios = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get('/admin/users');
            setUsuarios(data);
        } catch (e) {
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(cargarUsuarios);

    const abrirNuevo = () => {
        setEditando(null);
        setNombre('');
        setEmail('');
        setPassword('');
        setRol('ROLE_MEDICO');
        setModalVisible(true);
    };

    const abrirEditar = (user) => {
        setEditando(user);
        setNombre(user.nombre);
        setEmail(user.email);
        setPassword('');
        setRol(user.role);
        setModalVisible(true);
    };

    const guardar = async () => {
        if (!nombre.trim() || !email.trim()) {
            Alert.alert('Error', 'Nombre y email son obligatorios');
            return;
        }
        if (!editando && !password.trim()) {
            Alert.alert('Error', 'La contraseña es obligatoria para un nuevo usuario');
            return;
        }

        setGuardando(true);
        try {
            if (editando) {
                const body = { nombre, email, role: rol };
                if (password.trim()) body.password = password;
                await apiClient.put(`/admin/users/${editando.id}`, body);
            } else {
                await apiClient.post('/admin/users', { nombre, email, password, role: rol });
            }
            setModalVisible(false);
            cargarUsuarios();
        } catch (e) {
            const msg = e.response?.data?.message || 'Error al guardar el usuario';
            Alert.alert('Error', msg);
        } finally {
            setGuardando(false);
        }
    };

    const eliminar = (user) => {
        Alert.alert(
            'Eliminar usuario',
            `¿Seguro que querés eliminar a ${user.nombre}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar', style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/admin/users/${user.id}`);
                            cargarUsuarios();
                        } catch (e) {
                            Alert.alert('Error', e.response?.data?.message || 'No se pudo eliminar el usuario');
                        }
                    }
                }
            ]
        );
    };

    const getRolChip = (role) => {
        const isAdmin = role === 'ROLE_ADMIN';
        return (
            <View style={[styles.chip, { backgroundColor: isAdmin ? '#EDE9FE' : '#D1FAE5' }]}>
                <Text style={[styles.chipText, { color: isAdmin ? '#7C3AED' : '#059669' }]}>
                    {isAdmin ? 'Admin' : 'Médico'}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <FontAwesome5 name="arrow-left" size={18} color={theme.colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
                    <Text style={styles.headerSub}>{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</Text>
                </View>
                <TouchableOpacity style={styles.addBtn} onPress={abrirNuevo}>
                    <FontAwesome5 name="plus" size={16} color="#fff" />
                    <Text style={styles.addBtnText}>Nuevo</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={usuarios}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <FontAwesome5 name="user-slash" size={40} color={theme.colors.border} />
                            <Text style={styles.emptyText}>No hay usuarios registrados</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {item.nombre?.charAt(0)?.toUpperCase() || '?'}
                                </Text>
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.cardName}>{item.nombre}</Text>
                                <Text style={styles.cardEmail}>{item.email}</Text>
                                {getRolChip(item.role)}
                            </View>
                            <View style={styles.cardActions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}
                                    onPress={() => abrirEditar(item)}
                                >
                                    <FontAwesome5 name="edit" size={14} color="#3B82F6" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: '#FEE2E2', marginTop: 8 }]}
                                    onPress={() => eliminar(item)}
                                >
                                    <FontAwesome5 name="trash" size={14} color={theme.colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Modal crear / editar */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>
                                {editando ? 'Editar usuario' : 'Nuevo usuario'}
                            </Text>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.label}>Nombre completo *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={nombre}
                                    onChangeText={setNombre}
                                    placeholder="Dr. Juan Pérez"
                                    placeholderTextColor={theme.colors.textLight}
                                />

                                <Text style={styles.label}>Email *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    placeholder="medico@consultorio.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor={theme.colors.textLight}
                                />

                                <Text style={styles.label}>
                                    Contraseña {editando ? '(dejá en blanco para no cambiar)' : '*'}
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    value={password}
                                    onChangeText={setPassword}
                                    placeholder={editando ? 'Sin cambios' : 'Mínimo 6 caracteres'}
                                    secureTextEntry
                                    placeholderTextColor={theme.colors.textLight}
                                />

                                <Text style={styles.label}>Rol *</Text>
                                <View style={styles.roleRow}>
                                    {ROLES.map((r) => (
                                        <TouchableOpacity
                                            key={r.value}
                                            style={[
                                                styles.roleBtn,
                                                rol === r.value && styles.roleBtnActive
                                            ]}
                                            onPress={() => setRol(r.value)}
                                        >
                                            <FontAwesome5
                                                name={r.value === 'ROLE_ADMIN' ? 'user-cog' : 'user-md'}
                                                size={16}
                                                color={rol === r.value ? '#fff' : theme.colors.textLight}
                                            />
                                            <Text style={[
                                                styles.roleBtnText,
                                                rol === r.value && styles.roleBtnTextActive
                                            ]}>
                                                {r.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>

                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => setModalVisible(false)}
                                    disabled={guardando}
                                >
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={guardar}
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? <ActivityIndicator color="#fff" size="small" />
                                        : <Text style={styles.saveBtnText}>
                                            {editando ? 'Guardar cambios' : 'Crear usuario'}
                                        </Text>
                                    }
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: theme.spacing.m,
        backgroundColor: theme.colors.background,
    },
    backBtn: {
        padding: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.round,
    },
    headerTitle: { fontSize: 20, color: theme.colors.text, fontFamily: theme.fonts.bold },
    headerSub: { fontSize: 13, color: theme.colors.textLight, fontFamily: theme.fonts.regular },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.radii.m,
        gap: 6,
    },
    addBtnText: { color: '#fff', fontFamily: theme.fonts.bold, fontSize: 14 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: theme.spacing.m, paddingBottom: 40 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: 16, color: theme.colors.textLight, fontFamily: theme.fonts.medium, fontSize: 16 },
    card: {
        flexDirection: 'row',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.m,
        padding: theme.spacing.m,
        marginBottom: theme.spacing.m,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: { fontSize: 20, color: theme.colors.primary, fontFamily: theme.fonts.bold },
    cardInfo: { flex: 1 },
    cardName: { fontSize: 16, color: theme.colors.text, fontFamily: theme.fonts.bold, marginBottom: 2 },
    cardEmail: { fontSize: 13, color: theme.colors.textLight, fontFamily: theme.fonts.regular, marginBottom: 6 },
    chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
    chipText: { fontSize: 12, fontFamily: theme.fonts.bold },
    cardActions: { justifyContent: 'center' },
    actionBtn: { padding: 8, borderRadius: theme.radii.s },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: theme.spacing.l,
        maxHeight: '90%',
    },
    modalTitle: {
        fontSize: 20,
        color: theme.colors.text,
        fontFamily: theme.fonts.bold,
        marginBottom: theme.spacing.l,
        textAlign: 'center',
    },
    label: {
        fontSize: 13,
        color: theme.colors.textLight,
        fontFamily: theme.fonts.medium,
        marginBottom: 6,
        marginTop: 12,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.radii.m,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 12,
        fontSize: 15,
        color: theme.colors.text,
        fontFamily: theme.fonts.regular,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    roleRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
    roleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: theme.radii.m,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.background,
    },
    roleBtnActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    roleBtnText: { fontSize: 14, color: theme.colors.textLight, fontFamily: theme.fonts.medium },
    roleBtnTextActive: { color: '#fff' },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: theme.spacing.l,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    cancelBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: theme.radii.m,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    cancelBtnText: { color: theme.colors.textLight, fontFamily: theme.fonts.bold, fontSize: 15 },
    saveBtn: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: theme.radii.m,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
    },
    saveBtnText: { color: '#fff', fontFamily: theme.fonts.bold, fontSize: 15 },
});

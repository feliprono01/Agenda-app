import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Modal, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import apiClient from '../api/apiClient';
import { theme } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';

export default function NuevoTurnoScreen({ navigation }) {
    const [pacientes, setPacientes] = useState([]);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Fecha/hora unificadas en un objeto Date
    const [selectedDateTime, setSelectedDateTime] = useState(() => {
        const d = new Date();
        d.setHours(d.getHours() + 1, 0, 0, 0); // default: 1 hora desde ahora
        return d;
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [motivo, setMotivo] = useState('');
    const [loading, setLoading] = useState(false);

    // ── Helpers de formato ──────────────────────────────────────────
    const fmtDate = (d) => d.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
    const fmtTime = (d) => d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    const toISODate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const toISOTime = (d) => `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

    useEffect(() => {
        cargarPacientes();
    }, []);

    const cargarPacientes = async () => {
        try {
            const { data } = await apiClient.get('/pacientes');
            setPacientes(data);
        } catch (e) {
            console.error("Error al cargar pacientes", e);
        }
    };

    const handleGuardar = async () => {
        if (!pacienteSeleccionado || !motivo) {
            return Alert.alert('Aviso', 'Por favor, completá todos los campos y selecciona un paciente.');
        }

        // Validar que el turno no sea en el pasado
        const fechaHoraFormat = `${toISODate(selectedDateTime)}T${toISOTime(selectedDateTime)}:00`;
        if (selectedDateTime <= new Date()) {
            return Alert.alert(
                'Horario inválido',
                'No podés agendar turnos para un horario que ya pasó. Seleccioná una hora futura.'
            );
        }

        setLoading(true);
        try {
            await apiClient.post('/turnos', {
                pacienteId: pacienteSeleccionado.id,
                fechaHora: fechaHoraFormat,
                duracionMinutos: 30,
                motivo
            });
            Alert.alert('Éxito', 'Turno agendado correctamente');
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'No se pudo crear el turno.');
        } finally {
            setLoading(false);
        }
    };

    const onChangeDate = (event, date) => {
        setShowDatePicker(false);
        if (date) {
            setSelectedDateTime(prev => {
                const next = new Date(prev);
                next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
                return next;
            });
            // En Android abrimos el picker de hora a continuación
            if (Platform.OS === 'android') setShowTimePicker(true);
        }
    };

    const onChangeTime = (event, date) => {
        setShowTimePicker(false);
        if (date) {
            setSelectedDateTime(prev => {
                const next = new Date(prev);
                next.setHours(date.getHours(), date.getMinutes());
                return next;
            });
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
                    <Text style={styles.title}>Nuevo Turno</Text>
                    <View style={{ width: 20 }} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Datos del Paciente</Text>
                    
                    <TouchableOpacity 
                        style={styles.selectorContainer} 
                        onPress={() => setModalVisible(true)}
                        disabled={loading}
                    >
                        <FontAwesome5 name="user-alt" size={16} color={theme.colors.primary} style={styles.inputIcon} />
                        <Text style={[styles.selectorText, !pacienteSeleccionado && { color: theme.colors.textLight }]}>
                            {pacienteSeleccionado ? `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}` : 'Toca para seleccionar un paciente'}
                        </Text>
                        <FontAwesome5 name="chevron-down" size={14} color={theme.colors.border} />
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Fecha y Hora</Text>

                    {/* Botón Fecha */}
                    <TouchableOpacity
                        style={styles.pickerBtn}
                        onPress={() => setShowDatePicker(true)}
                        disabled={loading}
                    >
                        <FontAwesome5 name="calendar-alt" size={16} color={theme.colors.primary} style={styles.inputIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pickerLabel}>Fecha</Text>
                            <Text style={styles.pickerValue}>{fmtDate(selectedDateTime)}</Text>
                        </View>
                        <FontAwesome5 name="chevron-right" size={12} color={theme.colors.border} />
                    </TouchableOpacity>

                    {/* Botón Hora */}
                    <TouchableOpacity
                        style={styles.pickerBtn}
                        onPress={() => setShowTimePicker(true)}
                        disabled={loading}
                    >
                        <FontAwesome5 name="clock" size={16} color={theme.colors.primary} style={styles.inputIcon} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pickerLabel}>Hora</Text>
                            <Text style={styles.pickerValue}>{fmtTime(selectedDateTime)}</Text>
                        </View>
                        <FontAwesome5 name="chevron-right" size={12} color={theme.colors.border} />
                    </TouchableOpacity>

                    {/* DateTimePickers — en iOS se muestran inline, en Android como dialog */}
                    {showDatePicker && (
                        <DateTimePicker
                            value={selectedDateTime}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            minimumDate={new Date()}
                            onChange={onChangeDate}
                            locale="es-AR"
                        />
                    )}
                    {showTimePicker && (
                        <DateTimePicker
                            value={selectedDateTime}
                            mode="time"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            is24Hour
                            onChange={onChangeTime}
                        />
                    )}

                    <View style={[styles.inputContainer, styles.textAreaContainer]}>
                        <FontAwesome5 name="notes-medical" size={16} color={theme.colors.primary} style={[styles.inputIcon, { marginTop: 16 }]} />
                        <TextInput 
                            style={[styles.input, styles.textArea]} 
                            placeholder="Motivo de la consulta" 
                            placeholderTextColor={theme.colors.textLight}
                            value={motivo} 
                            onChangeText={setMotivo} 
                            multiline
                            numberOfLines={3}
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
                                <FontAwesome5 name="check-circle" size={18} color={theme.colors.surface} style={{ marginRight: 8 }} />
                                <Text style={styles.btnText}>Confirmar Turno</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Modal para selección de paciente */}
            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar Paciente</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <FontAwesome5 name="times" size={20} color={theme.colors.text} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={pacientes}
                            keyExtractor={item => item.id.toString()}
                            style={{ maxHeight: 350 }}
                            ListEmptyComponent={
                                <Text style={{ textAlign: 'center', marginVertical: 20, color: theme.colors.textLight }}>
                                    No hay pacientes registrados.
                                </Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.modalItem}
                                    onPress={() => {
                                        setPacienteSeleccionado(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <View style={styles.avatarMini}>
                                        <Text style={styles.avatarMiniText}>
                                            {item.nombre.charAt(0)}{item.apellido.charAt(0)}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.modalItemName}>{item.nombre} {item.apellido}</Text>
                                        <Text style={styles.modalItemDoc}>{item.dni || 'Sin DNI'}</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity 
                            style={styles.nuevoPacienteBtn}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('NuevoPaciente');
                            }}
                        >
                            <FontAwesome5 name="user-plus" size={16} color={theme.colors.cta} />
                            <Text style={styles.nuevoPacienteText}>Crear Nuevo Paciente</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    selectorContainer: {
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
    selectorText: {
        flex: 1,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        fontSize: 16,
    },
    pickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.m,
        paddingHorizontal: theme.spacing.m,
        paddingVertical: 12,
        marginBottom: theme.spacing.m,
        minHeight: 56,
    },
    pickerLabel: {
        fontSize: 11,
        color: theme.colors.textLight,
        fontFamily: theme.fonts.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    pickerValue: {
        fontSize: 15,
        color: theme.colors.text,
        fontFamily: theme.fonts.bold,
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
    textAreaContainer: {
        alignItems: 'flex-start',
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
    textArea: {
        height: 100,
        paddingTop: 16,
        textAlignVertical: 'top'
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
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: theme.spacing.l,
        paddingBottom: 40,
        maxHeight: '80%'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.l
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: theme.fonts.bold,
        color: theme.colors.text
    },
    closeBtn: {
        padding: 5
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    avatarMini: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.primary + '20',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 15
    },
    avatarMiniText: {
        color: theme.colors.primary,
        fontFamily: theme.fonts.bold,
        fontSize: 14
    },
    modalItemName: {
        fontSize: 16,
        fontFamily: theme.fonts.bold,
        color: theme.colors.text
    },
    modalItemDoc: {
        fontSize: 13,
        color: theme.colors.textLight,
        fontFamily: theme.fonts.medium,
        marginTop: 2
    },
    nuevoPacienteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        padding: 15,
        borderWidth: 1.5,
        borderColor: theme.colors.cta,
        borderRadius: theme.radii.m,
        borderStyle: 'dashed'
    },
    nuevoPacienteText: {
        color: theme.colors.cta,
        fontFamily: theme.fonts.bold,
        fontSize: 16,
        marginLeft: 10
    }
});

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { theme } from '../constants/theme';
import { FontAwesome5 } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configurando calendario en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar', 'Abr', 'May', 'Jun', 'Jul.', 'Ago', 'Sept.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function HomeScreen({ navigation }) {
    const { user, logout, isAdmin } = useAuth();
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToday = () => new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(getToday());

    const cargarTurnos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/turnos?desde=${selectedDate}&hasta=${selectedDate}`);
            setTurnos(response.data);
        } catch (e) {
            console.error("No se pudo cargar turnos", e);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    // Recarga al volver a la pantalla — wrapper sync requerido por useFocusEffect
    useFocusEffect(
        useCallback(() => { cargarTurnos(); }, [cargarTurnos])
    );

    const getStatusChip = (estado) => {
        let color = theme.colors.textLight;
        let bg = '#F1F5F9';
        if(estado === 'CONFIRMADO') { color = theme.colors.cta; bg = '#D1FAE5'; }
        if(estado === 'CANCELADO') { color = theme.colors.error; bg = '#FEE2E2'; }
        return (
            <View style={[styles.statusChip, { backgroundColor: bg }]}>
                <Text style={[styles.statusText, { color }]}>{estado}</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hola, Bienvenido</Text>
                    <Text style={styles.userName}>Mi Agenda</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {isAdmin && (
                        <TouchableOpacity
                            style={[styles.headerBtn, { backgroundColor: '#EDE9FE' }]}
                            onPress={() => navigation.navigate('Admin')}
                        >
                            <FontAwesome5 name="user-cog" size={18} color="#7C3AED" />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.headerBtn, { backgroundColor: theme.colors.cta + '20' }]}
                        onPress={() => navigation.navigate('Pacientes')}
                    >
                        <FontAwesome5 name="users" size={18} color={theme.colors.cta} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerBtn, { backgroundColor: '#FEE2E2' }]} onPress={logout}>
                        <FontAwesome5 name="sign-out-alt" size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Calendar */}
            <Calendar
                style={styles.calendar}
                theme={{
                    backgroundColor: theme.colors.background,
                    calendarBackground: theme.colors.surface,
                    textSectionTitleColor: theme.colors.primary,
                    selectedDayBackgroundColor: theme.colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: theme.colors.cta,
                    dayTextColor: theme.colors.text,
                    textDisabledColor: '#CBD5E1',
                    arrowColor: theme.colors.primary,
                    monthTextColor: theme.colors.text,
                    textMonthFontFamily: theme.fonts.bold,
                    textDayFontFamily: theme.fonts.medium,
                    textDayHeaderFontFamily: theme.fonts.bold,
                }}
                onDayPress={day => setSelectedDate(day.dateString)}
                markedDates={{
                    [selectedDate]: { selected: true, disableTouchEvent: true, selectedDotColor: 'orange' }
                }}
            />

            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Turnos para este día</Text>
            </View>

            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={turnos}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <FontAwesome5 name="calendar-check" size={48} color={theme.colors.border} />
                            <Text style={styles.emptyText}>Día libre de turnos</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.card}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('DetalleTurno', { turno: item })}
                        >
                            <View style={styles.timeBox}>
                                <Text style={styles.timeText}>{item.fechaHora.split('T')[1].substring(0,5)}</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.patientName}>{item.pacienteNombre}</Text>
                                <Text style={styles.motiveText} numberOfLines={1}>{item.motivo}</Text>
                            </View>
                            {getStatusChip(item.estado)}
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('NuevoTurno')}
                activeOpacity={0.8}
            >
                <FontAwesome5 name="plus" size={24} color={theme.colors.surface} />
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.l,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: theme.spacing.m,
        backgroundColor: theme.colors.background,
    },
    greeting: { fontSize: 16, color: theme.colors.textLight, fontFamily: theme.fonts.medium },
    userName: { fontSize: 24, color: theme.colors.text, fontFamily: theme.fonts.bold },
    headerBtn: {
        padding: 10,
        borderRadius: theme.radii.round,
    },
    calendar: {
        marginHorizontal: theme.spacing.m,
        borderRadius: theme.radii.l,
        elevation: 4,
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        paddingBottom: theme.spacing.s,
    },
    listHeader: {
        paddingHorizontal: theme.spacing.l,
        paddingTop: theme.spacing.l,
        paddingBottom: theme.spacing.s,
    },
    listTitle: { fontSize: 18, color: theme.colors.text, fontFamily: theme.fonts.bold },
    listContent: { paddingHorizontal: theme.spacing.m, paddingBottom: 100 },
    loaderContainer: { paddingVertical: 40, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { marginTop: theme.spacing.m, color: theme.colors.textLight, fontFamily: theme.fonts.medium, fontSize: 16 },
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
    timeBox: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.s,
        borderRadius: theme.radii.s,
        marginRight: theme.spacing.m,
    },
    timeText: { color: theme.colors.primary, fontFamily: theme.fonts.bold, fontSize: 16 },
    cardContent: { flex: 1, paddingRight: theme.spacing.m },
    patientName: { fontSize: 16, color: theme.colors.text, fontFamily: theme.fonts.bold, marginBottom: 2 },
    motiveText: { fontSize: 14, color: theme.colors.textLight, fontFamily: theme.fonts.regular },
    statusChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 12, fontFamily: theme.fonts.bold },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        backgroundColor: theme.colors.cta,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: theme.colors.cta,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    }
});

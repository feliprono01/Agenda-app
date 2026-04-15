import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import NuevoTurnoScreen from '../screens/NuevoTurnoScreen';
import DetalleTurnoScreen from '../screens/DetalleTurnoScreen';
import PacientesScreen from '../screens/PacientesScreen';
import NuevoPacienteScreen from '../screens/NuevoPacienteScreen';
import { theme } from '../constants/theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const { user, loading } = useAuth();
    if (loading) return null;

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background }
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="NuevoTurno" component={NuevoTurnoScreen} />
                        <Stack.Screen name="DetalleTurno" component={DetalleTurnoScreen} />
                        <Stack.Screen name="Pacientes" component={PacientesScreen} />
                        <Stack.Screen name="NuevoPaciente" component={NuevoPacienteScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

import { Tabs } from 'expo-router';
import { Platform, Text } from 'react-native';
// IMPORTANTE: Importamos useSafeAreaInsets
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { 
          backgroundColor: '#0f172a', 
          borderTopWidth: 0,
          // AQUI ESTA LA MAGIA:
          // Le decimos que la altura base es 60, PERO que le sume el espacio de los botones del sistema (insets.bottom)
          height: 60 + (Platform.OS === 'android' ? insets.bottom : 0),
          // Y le ponemos un padding abajo igual al tamaño de esos botones, para "empujar" los iconos hacia arriba
          paddingBottom: (Platform.OS === 'android' ? insets.bottom : 0) + 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#64748b',
        animation: 'shift', 
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      
      <Tabs.Screen
        name="reserva"
        options={{
          title: 'Reservar',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📅</Text>,
        }}
      />

      <Tabs.Screen
        name="cronograma"
        options={{
          title: 'Cronograma',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />

      <Tabs.Screen
        name="avisos"
        options={{
          title: 'Avisos',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔔</Text>,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tabs>
  );
}
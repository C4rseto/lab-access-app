import { Ionicons } from '@expo/vector-icons';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function AvisosScreen() {
  const [misSolicitudes, setMisSolicitudes] = useState<any[]>([]);
  const [nombreDocente, setNombreDocente] = useState('');

  useEffect(() => {
    const correo = auth.currentUser?.email;
    if (!correo) return;

    onValue(ref(db, 'laboratorio/usuarios'), (snap) => {
      const users = snap.val();
      const user = Object.values(users || {}).find((u: any) => u.correo === correo);
      if (user) {
        const nombre = (user as any).nombre;
        setNombreDocente(nombre);

        onValue(ref(db, 'reservas'), (snapReservas) => {
          const data = snapReservas.val();
          if (data) {
            const todas = Object.values(data) as any[];
            const miHistorial = todas.filter(r => r.estudiante === nombre).reverse();
            setMisSolicitudes(miHistorial);
          }
        });
      }
    });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Avisos</Text>
        <Text style={styles.subtitle}>Estado de tus solicitudes de laboratorio en tiempo real.</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {misSolicitudes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={40} color="#334155" />
              <Text style={styles.emptyText}>Aún no tienes solicitudes.</Text>
            </View>
          ) : (
            misSolicitudes.map((item, index) => {
              const statusStyle = getStatusStyle(item.estado);

              return (
                <View key={index} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.labName}>{item.laboratorio}</Text>
                    
                    <View style={[styles.badge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.border }]}>
                      <Text style={[styles.badgeText, { color: statusStyle.text }]}>
                        {item.estado.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={14} color="#64748b" style={styles.icon} />
                    <Text style={styles.dateText}>{item.fecha} | {item.horaInicio} - {item.horaFin}</Text>
                  </View>

                  <View style={styles.divider} />
                  
                  <Text style={styles.motivoText}>"{item.motivo}"</Text>
                </View>
              );
            })
          )}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Función auxiliar para colores premium según el estado
const getStatusStyle = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'aprobado': 
      return { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#10b981' }; 
    case 'denegado': 
      return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' }; 
    default: 
      return { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', text: '#f59e0b' }; 
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: '#090d16',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: { 
    fontSize: 14, 
    color: '#94a3b8', 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#090d16',
  },
  listContainer: { 
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  card: { 
    backgroundColor: '#172033', 
    padding: 20, 
    borderRadius: 16, 
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  labName: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#ffffff' 
  },
  badge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: { 
    fontSize: 10, 
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
  },
  dateText: { 
    fontSize: 13, 
    color: '#94a3b8',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 12,
  },
  motivoText: { 
    fontSize: 13, 
    color: '#64748b', 
    fontStyle: 'italic' 
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 30,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
  },
  emptyText: { 
    textAlign: 'center', 
    color: '#64748b', 
    marginTop: 15,
    fontSize: 15,
    fontWeight: '500',
  }
});
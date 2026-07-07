import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function AvisosScreen() {
  const [misSolicitudes, setMisSolicitudes] = useState<any[]>([]);
  const [nombreDocente, setNombreDocente] = useState('');

  useEffect(() => {
    const correo = auth.currentUser?.email;
    if (!correo) return;

    // 1. Primero obtener el nombre del usuario logueado
    onValue(ref(db, 'laboratorio/usuarios'), (snap) => {
      const users = snap.val();
      const user = Object.values(users || {}).find((u: any) => u.correo === correo);
      if (user) {
        const nombre = (user as any).nombre;
        setNombreDocente(nombre);

        // 2. Escuchar solo las reservas de este usuario
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Avisos</Text>
        <Text style={styles.subtitle}>Estado de tus solicitudes de laboratorio.</Text>
      </View>

      <View style={styles.listContainer}>
        {misSolicitudes.length === 0 ? (
          <Text style={styles.emptyText}>Aún no tienes solicitudes.</Text>
        ) : (
          misSolicitudes.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.labName}>{item.laboratorio}</Text>
                {/* Etiqueta dinámica según estado */}
                <View style={[styles.badge, { backgroundColor: getStatusColor(item.estado).bg }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(item.estado).text }]}>
                    {item.estado.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.dateText}>📅 {item.fecha} | {item.horaInicio} - {item.horaFin}</Text>
              <Text style={styles.motivoText}>"{item.motivo}"</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// Función auxiliar para colores según el estado
const getStatusColor = (estado: string) => {
  switch (estado) {
    case 'aprobado': return { bg: '#d1fae5', text: '#059669' }; // Verde
    case 'denegado': return { bg: '#fee2e2', text: '#dc2626' }; // Rojo
    default: return { bg: '#fef3c7', text: '#d97706' };         // Amarillo (pendiente)
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#090d16', padding: 25, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 5 },
  listContainer: { padding: 20 },
  card: { backgroundColor: '#ffffff', padding: 20, borderRadius: 20, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  labName: { fontSize: 16, fontWeight: 'bold', color: '#1e293b' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  dateText: { fontSize: 13, color: '#64748b', marginBottom: 5 },
  motivoText: { fontSize: 12, color: '#475569', fontStyle: 'italic' },
  emptyText: { textAlign: 'center', color: '#94a3b8', marginTop: 50 }
});
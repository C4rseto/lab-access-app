import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function HomeScreen() {
  const [reservaActiva, setReservaActiva] = useState<any>(null);
  const [nombreDocente, setNombreDocente] = useState('Docente');
  const [pinUsuario, setPinUsuario] = useState('----'); // Estado para guardar el PIN real
  const [labAsignado, setLabAsignado] = useState('Cargando...'); // Estado para guardar el lab real
  const [verPin, setVerPin] = useState(false);

  useEffect(() => {
    const correo = auth.currentUser?.email;
    if (!correo) return;

    const usuariosRef = ref(db, 'laboratorio/usuarios');
    const reservasRef = ref(db, 'reservas');

    onValue(usuariosRef, (snapUsuarios) => {
      const users = snapUsuarios.val();
      const user = Object.values(users || {}).find((u: any) => u.correo === correo);
      
      if (user) {
        setNombreDocente((user as any).nombre || 'Docente');
        setPinUsuario((user as any).pin || '----'); // Guardamos el PIN de la base de datos
        setLabAsignado((user as any).laboratorio || 'Sin asignar'); // Guardamos su Lab
      }

      onValue(reservasRef, (snapReservas) => {
        const data = snapReservas.val();
        if (data) {
          const activa = Object.values(data).find(
            (r: any) => r.estado === 'aprobado' && r.estudiante === (user as any)?.nombre
          );
          setReservaActiva(activa);
        } else {
          setReservaActiva(null);
        }
      });
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.welcome}>Hola, {nombreDocente} 👋</Text>
        <View style={styles.cardWrapper}>
          <View style={styles.activeAccess}>
            <View style={{ flex: 1 }}>
              <Text style={styles.accessTitle}>TU ACCESO DE HOY</Text>
              {/* Muestra la reserva activa o su laboratorio normal */}
              <Text style={styles.labName}>{reservaActiva?.laboratorio || labAsignado}</Text>
              <Text style={styles.timeInfo}>Hasta las 13:00 hrs.</Text>
              <View style={styles.pinContainer}>
                <Text style={styles.pinLabel}>ESTADO DEL PIN:</Text>
                <Text style={{ color: '#10b981', fontSize: 14, fontWeight: 'bold' }}>
                  🔐 Encriptado y Seguro
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.pinButton} onPress={() => setVerPin(!verPin)}>
              <Text style={styles.pinButtonText}>{verPin ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.bodyContainer}>
        <Text style={styles.sectionTitle}>Disponibilidad rápida</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          <View style={[styles.statusCard, styles.cardAvailable]}><Text style={styles.statusLabName}>Lab. Software</Text><Text style={styles.statusTextAvailable}>🟢 Disponible</Text></View>
          <View style={[styles.statusCard, styles.cardOccupied]}><Text style={styles.statusLabName}>Lab. Hardware</Text><Text style={styles.statusTextOccupied}>🔴 Ocupado</Text></View>
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerBox: { backgroundColor: '#090d16', padding: 24, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  welcome: { color: '#ffffff', fontSize: 18, marginBottom: 20 },
  cardWrapper: { minHeight: 140, justifyContent: 'center' },
  activeAccess: { backgroundColor: '#1e293b', padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  accessTitle: { color: '#10b981', fontSize: 12, fontWeight: 'bold' },
  labName: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', marginVertical: 4 },
  timeInfo: { color: '#94a3b8', fontSize: 14 },
  pinContainer: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  pinLabel: { color: '#64748b', fontSize: 10, marginRight: 8 },
  pinValue: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', letterSpacing: 4 },
  pinButton: { backgroundColor: '#334155', padding: 12, borderRadius: 12, marginLeft: 15 },
  pinButtonText: { fontSize: 20 },
  bodyContainer: { padding: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 15 },
  horizontalScroll: { flexDirection: 'row' },
  statusCard: { padding: 15, borderRadius: 15, marginRight: 12, width: 140, borderWidth: 1 },
  cardAvailable: { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
  cardOccupied: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  statusLabName: { fontWeight: 'bold', color: '#1e293b', marginBottom: 8, fontSize: 14 },
  statusTextAvailable: { color: '#059669', fontSize: 12, fontWeight: 'bold' },
  statusTextOccupied: { color: '#dc2626', fontSize: 12, fontWeight: 'bold' },
});
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function HomeScreen() {
  const [reservaActiva, setReservaActiva] = useState<any>(null);
  const [nombreDocente, setNombreDocente] = useState('Docente');
  const [pinUsuario, setPinUsuario] = useState('----'); 
  const [labAsignado, setLabAsignado] = useState('Cargando...'); 
  const [verPin, setVerPin] = useState(false);

  // Lógica de Firebase intacta
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
        setPinUsuario((user as any).pin || '----');
        setLabAsignado((user as any).laboratorio || 'Sin asignar');
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

  // Función para obtener las iniciales del docente (Ej. "Ingeniero Porras" -> "IP")
  const getIniciales = (nombre: string) => {
    if (!nombre || nombre === 'Docente') return 'IP';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerBox}>
          <View>
            <Text style={styles.welcomeSubtitle}>Bienvenido de vuelta</Text>
            <Text style={styles.welcomeTitle}>{nombreDocente} 👋</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getIniciales(nombreDocente)}</Text>
          </View>
        </View>

        {/* TARJETA PRINCIPAL: ACCESO DE HOY */}
        <View style={styles.mainCardWrapper}>
          <View style={styles.mainCard}>
            
            <View style={styles.cardHeaderRow}>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>TU ACCESO DE HOY</Text>
              </View>
              <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                <Text style={styles.securityText}>Seguridad Activa</Text>
              </View>
            </View>

            <Text style={styles.labName}>{reservaActiva?.laboratorio || labAsignado}</Text>
            <Text style={styles.timeInfo}>Válido hasta las 13:00 hrs.</Text>

            <View style={styles.pinSection}>
              <View style={{ flex: 1 }}>
                <Text style={styles.pinLabel}>ESTADO DEL PIN</Text>
                <Text style={styles.pinValue}>
                  {verPin ? `🔑 ${pinUsuario}` : '🔐 Encriptado y Seguro'}
                </Text>
              </View>
              <TouchableOpacity style={styles.eyeButton} onPress={() => setVerPin(!verPin)}>
                <Ionicons name={verPin ? "eye-off" : "eye"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            {/* Marca de agua de fondo (decorativa) */}
            <Ionicons name="key" size={120} color="rgba(255,255,255,0.02)" style={styles.watermarkIcon} />
          </View>
        </View>

        {/* SECCIÓN DISPONIBILIDAD RÁPIDA */}
        <View style={styles.bodyContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>DISPONIBILIDAD RÁPIDA</Text>
            <View style={styles.realTimeBadge}>
              <View style={styles.dotGreen} />
              <Text style={styles.realTimeText}>Tiempo real</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabName}>Lab. Software</Text>
              <View style={styles.statusRow}>
                <View style={styles.dotGreen} />
                <Text style={styles.statusTextAvailable}>Disponible</Text>
              </View>
            </View>
            <View style={styles.statusCard}>
              <Text style={styles.statusLabName}>Lab. Hardware</Text>
              <View style={styles.statusRow}>
                <View style={styles.dotRed} />
                <Text style={styles.statusTextOccupied}>Ocupado</Text>
              </View>
            </View>
          </ScrollView>

          {/* BOTÓN SOLICITAR NUEVA SESIÓN */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/reserva')} // Redirige a la pestaña de reservas
          >
            <View style={styles.actionIconWrapper}>
              <Ionicons name="calendar" size={20} color="#ffffff" />
            </View>
            <View style={styles.actionTextWrapper}>
              <Text style={styles.actionTitle}>Solicitar nueva sesión</Text>
              <Text style={styles.actionSubtitle}>Reserva laboratorios en segundos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ESTILOS PREMIUM MODO OSCURO
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090d16',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: { 
    flex: 1, 
    backgroundColor: '#090d16' 
  },
  headerBox: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeSubtitle: { 
    color: '#94a3b8', 
    fontSize: 14, 
    marginBottom: 4,
    fontWeight: '500'
  },
  welcomeTitle: { 
    color: '#ffffff', 
    fontSize: 24, 
    fontWeight: 'bold' 
  },
  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 16,
  },
  mainCardWrapper: { 
    paddingHorizontal: 24, 
    marginTop: 20 
  },
  mainCard: { 
    backgroundColor: '#172033', 
    padding: 24, 
    borderRadius: 24, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeContainer: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  labName: { 
    color: '#ffffff', 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 6 
  },
  timeInfo: { 
    color: '#94a3b8', 
    fontSize: 14,
    fontWeight: '500',
  },
  pinSection: { 
    marginTop: 30, 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  pinLabel: { 
    color: '#64748b', 
    fontSize: 11, 
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 6,
  },
  pinValue: { 
    color: '#10b981', 
    fontSize: 15, 
    fontWeight: 'bold' 
  },
  eyeButton: { 
    backgroundColor: '#0f172a', 
    padding: 12, 
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  watermarkIcon: {
    position: 'absolute',
    right: -20,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  bodyContainer: { 
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 40,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#94a3b8', 
    letterSpacing: 1.5 
  },
  realTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  realTimeText: {
    color: '#10b981',
    fontSize: 12,
  },
  horizontalScroll: { 
    flexDirection: 'row',
    marginBottom: 20,
  },
  statusCard: { 
    backgroundColor: '#172033',
    padding: 18, 
    borderRadius: 16, 
    marginRight: 12, 
    width: 150, 
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statusLabName: { 
    fontWeight: 'bold', 
    color: '#ffffff', 
    marginBottom: 12, 
    fontSize: 14 
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotGreen: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  dotRed: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  statusTextAvailable: { 
    color: '#10b981', 
    fontSize: 13, 
    fontWeight: 'bold' 
  },
  statusTextOccupied: { 
    color: '#ef4444', 
    fontSize: 13, 
    fontWeight: 'bold' 
  },
  actionButton: {
    backgroundColor: '#172033',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  actionIconWrapper: {
    backgroundColor: '#047857', // Verde más oscuro para el icono
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionTextWrapper: {
    flex: 1,
  },
  actionTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionSubtitle: {
    color: '#64748b',
    fontSize: 13,
  },
});
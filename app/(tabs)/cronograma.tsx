import { Ionicons } from '@expo/vector-icons';
import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function CronogramaScreen() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('Todos');
  const [miNombre, setMiNombre] = useState(''); // Para saber cuáles reservas son "Mías"

  const diasSemanaFull = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const tabs = ['Todos', 'Lunes', 'Martes', 'Mié', 'Jue', 'Vie', 'Sáb'];

  useEffect(() => {
    // 1. Obtener mi nombre para etiquetar mis reservas
    const correo = auth.currentUser?.email;
    if (correo) {
      onValue(ref(db, 'laboratorio/usuarios'), (snap) => {
        const users = snap.val();
        const user = Object.values(users || {}).find((u: any) => u.correo === correo);
        if (user) setMiNombre((user as any).nombre);
      });
    }

    // 2. Cargar Reservas y Docentes
    const resRef = ref(db, 'reservas');
    const docentesRef = ref(db, 'docentes');

    let reservasData: any = {};
    let docentesData: any = {};

    const procesarDatos = () => {
      let listaCombinada: any[] = [];

      if (reservasData) {
        const listaReservas = Object.values(reservasData)
          .filter((r: any) => r.estado === 'aprobado')
          .map((r: any) => {
            let diaAsignado = 'Desconocido';
            const fechaStr = r.fecha ? String(r.fecha).toLowerCase() : '';

            if (fechaStr.includes('/')) {
              const partes = fechaStr.split('/');
              if (partes.length === 3) {
                const dateObj = new Date(parseInt(partes[2]), parseInt(partes[1]) - 1, parseInt(partes[0]));
                if (!isNaN(dateObj.getTime())) diaAsignado = diasSemanaFull[dateObj.getDay()];
              }
            } else {
              if (fechaStr.includes('lunes')) diaAsignado = 'Lunes';
              else if (fechaStr.includes('martes')) diaAsignado = 'Martes';
              else if (fechaStr.includes('miércoles') || fechaStr.includes('miercoles')) diaAsignado = 'Miércoles';
              else if (fechaStr.includes('jueves')) diaAsignado = 'Jueves';
              else if (fechaStr.includes('viernes')) diaAsignado = 'Viernes';
              else if (fechaStr.includes('sábado') || fechaStr.includes('sabado')) diaAsignado = 'Sábado';
              else if (fechaStr.includes('domingo')) diaAsignado = 'Domingo';
            }

            return { 
              ...r, 
              diaSemana: diaAsignado, 
              tipo: 'reserva', 
              titulo: `Reserva: ${r.estudiante || 'Usuario'}`,
              propietario: r.estudiante
            };
          });
        listaCombinada = [...listaCombinada, ...listaReservas];
      }

      if (docentesData) {
        Object.values(docentesData).forEach((docente: any) => {
          if (docente.horarios) {
            const horariosList = Array.isArray(docente.horarios) ? docente.horarios : Object.values(docente.horarios);
            
            horariosList.forEach((horario: any) => {
              listaCombinada.push({
                diaSemana: horario.dia || horario.diaSemana || 'Desconocido', 
                tipo: 'fijo',
                titulo: docente.nombre || 'Docente',
                propietario: docente.nombre,
                laboratorio: docente.laboratorio || horario.laboratorio || 'Lab. no especificado',
                fecha: '', 
                horaInicio: horario.horaInicio || horario.inicio || '',
                horaFin: horario.horaFin || horario.fin || ''
              });
            });
          }
        });
      }

      setEventos(listaCombinada);
    };

    const unsubReservas = onValue(resRef, (snap) => {
      reservasData = snap.val() || {};
      procesarDatos();
    });

    const unsubDocentes = onValue(docentesRef, (snap) => {
      docentesData = snap.val() || {};
      procesarDatos();
    });

    return () => {
      unsubReservas();
      unsubDocentes();
    };
  }, []);

  // Función para mapear las pestañas abreviadas al nombre completo del día
  const obtenerDiasAMostrar = () => {
    if (selectedTab === 'Todos') return ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    if (selectedTab === 'Mié') return ['Miércoles'];
    if (selectedTab === 'Jue') return ['Jueves'];
    if (selectedTab === 'Vie') return ['Viernes'];
    if (selectedTab === 'Sáb') return ['Sábado'];
    return [selectedTab];
  };

  const diasAMostrar = obtenerDiasAMostrar();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Cronograma Semanal</Text>
        <Text style={styles.subtitle}>Horarios de reserva consolidados de la facultad.</Text>
        
        {/* TABS DE DÍAS */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => {
              const isActive = selectedTab === tab;
              return (
                <TouchableOpacity 
                  key={tab} 
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setSelectedTab(tab)}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <View style={styles.tabLineBackground} />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {diasAMostrar.map(dia => {
          const eventosDelDia = eventos.filter(e => e.diaSemana === dia);
          
          // Si estamos en un día específico y está vacío, mostramos el mensaje de vacío
          if (eventosDelDia.length === 0 && selectedTab !== 'Todos') {
            return (
              <View key={dia} style={styles.diaContainer}>
                <View style={styles.diaHeaderBox}>
                  <View style={styles.diaDot} />
                  <Text style={styles.diaTitle}>{dia.toUpperCase()}</Text>
                </View>
                <View style={styles.emptyCard}>
                  <Ionicons name="calendar-clear-outline" size={30} color="#334155" />
                  <Text style={styles.vacio}>Día libre, sin reservas.</Text>
                </View>
              </View>
            );
          }

          // Si estamos en "Todos" y el día está vacío, simplemente lo saltamos para que no haga bulto
          if (eventosDelDia.length === 0 && selectedTab === 'Todos') return null;
          
          return (
            <View key={dia} style={styles.diaContainer}>
              <View style={styles.diaHeaderBox}>
                <View style={styles.diaDot} />
                <Text style={styles.diaTitle}>{dia.toUpperCase()}</Text>
              </View>
              
              {eventosDelDia.map((e, i) => {
                const esMio = e.propietario === miNombre;
                const colorBorde = esMio ? '#06b6d4' : (e.tipo === 'reserva' ? '#06b6d4' : '#f59e0b');

                return (
                  <View key={i} style={[styles.card, { borderLeftColor: colorBorde }]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.nombre} numberOfLines={1}>{e.titulo}</Text>
                      {esMio && (
                        <View style={styles.miaPill}>
                          <Text style={styles.miaText}>Mía</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Ionicons name={e.laboratorio.includes('Cómputo') ? 'desktop-outline' : 'hardware-chip-outline'} size={14} color="#64748b" style={styles.icon} />
                      <Text style={styles.lab}>{e.laboratorio}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                      <Ionicons name="time-outline" size={14} color="#64748b" style={styles.icon} />
                      <Text style={styles.hora}>
                        {e.fecha ? `${e.fecha} | ` : ''}{e.horaInicio} - {e.horaFin}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
        <View style={{ height: 40 }} /> {/* Espacio extra al final */}
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
    backgroundColor: '#090d16', 
    paddingHorizontal: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 30,
    backgroundColor: '#090d16',
  },
  mainTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: { 
    fontSize: 14, 
    color: '#94a3b8', 
    marginBottom: 25,
  },
  tabsContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  tabLineBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1e293b',
    zIndex: -1,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#ffffff',
  },
  tabText: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#10b981',
  },
  diaContainer: { 
    marginBottom: 25,
  },
  diaHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  diaDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  diaTitle: { 
    color: '#10b981', 
    fontSize: 13, 
    fontWeight: 'bold', 
    letterSpacing: 1.5,
  },
  card: { 
    backgroundColor: '#172033', 
    padding: 18, 
    borderRadius: 16, 
    marginBottom: 12, 
    borderLeftWidth: 4,
    borderWidth: 1,
    borderTopColor: '#1e293b',
    borderRightColor: '#1e293b',
    borderBottomColor: '#1e293b',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nombre: { 
    color: '#ffffff', 
    fontWeight: 'bold', 
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  miaPill: {
    borderColor: '#10b981',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  miaText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  icon: {
    marginRight: 6,
  },
  lab: { 
    color: '#94a3b8', 
    fontSize: 13,
  },
  hora: { 
    color: '#64748b', 
    fontSize: 13, 
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
  },
  vacio: { 
    color: '#475569', 
    fontSize: 14, 
    marginTop: 10, 
    fontWeight: '500' 
  }
});
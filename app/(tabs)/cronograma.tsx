import { onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { db } from '../../firebase';

export default function CronogramaScreen() {
  const [eventos, setEventos] = useState<any[]>([]);

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    const resRef = ref(db, 'reservas');
    const docentesRef = ref(db, 'docentes'); // AHORA APUNTAMOS A DOCENTES

    let reservasData: any = {};
    let docentesData: any = {};

    const procesarDatos = () => {
      let listaCombinada: any[] = [];

      // 1. Procesar Reservas Aprobadas (Tu nodo 'reservas')
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
                if (!isNaN(dateObj.getTime())) diaAsignado = diasSemana[dateObj.getDay()];
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
              titulo: `Reserva: ${r.estudiante || 'Usuario'}`
            };
          });
        listaCombinada = [...listaCombinada, ...listaReservas];
      }

      // 2. Procesar Horarios Fijos (De tu nodo 'docentes' -> 'horarios')
      if (docentesData) {
        Object.values(docentesData).forEach((docente: any) => {
          // Verificamos si el docente tiene el nodo "horarios"
          if (docente.horarios) {
            // Convertimos los horarios en un arreglo por si están como objeto
            const horariosList = Array.isArray(docente.horarios) ? docente.horarios : Object.values(docente.horarios);
            
            horariosList.forEach((horario: any) => {
              listaCombinada.push({
                // Asegúrate de que tu panel web guarde el día como 'dia' o 'diaSemana'
                diaSemana: horario.dia || horario.diaSemana || 'Desconocido', 
                tipo: 'fijo',
                titulo: docente.nombre || 'Docente',
                laboratorio: docente.laboratorio || horario.laboratorio || 'Lab. no especificado',
                fecha: '', // Los fijos no suelen tener fecha exacta
                horaInicio: horario.horaInicio || horario.inicio || '',
                horaFin: horario.horaFin || horario.fin || ''
              });
            });
          }
        });
      }

      setEventos(listaCombinada);
    };

    // Escuchamos ambos nodos en tiempo real
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

  const diasAMostrar = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cronograma Semanal</Text>
      
      {diasAMostrar.map(dia => {
        const eventosDelDia = eventos.filter(e => e.diaSemana === dia);
        
        return (
          <View key={dia} style={styles.diaContainer}>
            <Text style={styles.diaTitle}>{dia}</Text>
            
            {eventosDelDia.length === 0 ? (
              <Text style={styles.vacio}>— DÍA LIBRE —</Text>
            ) : (
              eventosDelDia.map((e, i) => (
                <View 
                  key={i} 
                  style={[
                    styles.card, 
                    { borderLeftColor: e.tipo === 'reserva' ? '#f59e0b' : '#3b82f6' } 
                  ]}
                >
                  <Text style={styles.nombre}>{e.titulo}</Text>
                  <Text style={styles.lab}>📍 {e.laboratorio}</Text>
                  <Text style={styles.hora}>
                    🕒 {e.fecha ? `${e.fecha} | ` : ''}{e.horaInicio} - {e.horaFin}
                  </Text>
                </View>
              ))
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#090d16', 
    padding: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50,
  },
  title: { fontSize: 24, color: '#fff', fontWeight: 'bold', marginBottom: 20 },
  diaContainer: { marginBottom: 25 },
  diaTitle: { color: '#10b981', fontSize: 16, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 5 },
  card: { backgroundColor: '#1e293b', padding: 12, borderRadius: 8, marginTop: 10, borderLeftWidth: 4 },
  nombre: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  lab: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  hora: { color: '#fbbf24', fontSize: 12, marginTop: 4 },
  vacio: { color: '#475569', fontSize: 12, marginTop: 10, fontStyle: 'italic' }
});
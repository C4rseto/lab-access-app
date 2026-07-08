import { Ionicons } from '@expo/vector-icons'; // Importamos los iconos
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { onValue, push, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function ReservaScreen() {
  const [nombreDocente, setNombreDocente] = useState('Docente');
  const [form, setForm] = useState({ laboratorio: 'Lab. Cómputo', fecha: '', horaInicio: '', horaFin: '', motivo: '' });

  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [activeField, setActiveField] = useState<'fecha' | 'horaInicio' | 'horaFin' | null>(null);

  // Lógica intacta
  useEffect(() => {
    const correo = auth.currentUser?.email;
    if (!correo) return;
    onValue(ref(db, 'laboratorio/usuarios'), (snap) => {
      const users = snap.val();
      const user = Object.values(users || {}).find((u: any) => u.correo === correo);
      setNombreDocente(user ? (user as any).nombre : 'Docente');
    });
  }, []);

  const openPicker = (field: 'fecha' | 'horaInicio' | 'horaFin', pickerMode: 'date' | 'time') => {
    setActiveField(field);
    setMode(pickerMode);
    setShowPicker(true);
  };

  const onChangePicker = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate && activeField) {
      const valor = mode === 'date' 
        ? selectedDate.toLocaleDateString('es-ES') 
        : selectedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setForm({ ...form, [activeField]: valor });
    }
  };

  const enviarSolicitud = () => {
    if (!form.fecha || !form.horaInicio || !form.horaFin || !form.motivo) {
      Alert.alert("Error", "Por favor, completa todos los campos.");
      return;
    }
    push(ref(db, 'reservas'), {
      ...form, 
      estudiante: nombreDocente, 
      estado: 'pendiente', 
      fechaSolicitud: new Date().toLocaleString()
    }).then(() => {
      Alert.alert("Éxito", "Solicitud enviada al administrador.");
      setForm({ laboratorio: 'Lab. Cómputo', fecha: '', horaInicio: '', horaFin: '', motivo: '' });
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* CABECERA */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Nueva Reserva</Text>
          <Text style={styles.subtitle}>Selecciona y solicita acceso formal.</Text>
        </View>
        
        <View style={styles.bodyContainer}>
          
          {/* LABORATORIO */}
          <Text style={styles.label}>LABORATORIO REQUERIDO</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="git-network-outline" size={20} color="#64748b" style={styles.icon} />
            <Picker
              selectedValue={form.laboratorio}
              onValueChange={(val) => setForm({...form, laboratorio: val})}
              style={styles.picker}
              dropdownIconColor="#ffffff" // Flechita en Android
              itemStyle={{ color: '#ffffff', fontSize: 15 }} // Texto en iOS
            >
              <Picker.Item label="Lab. Cómputo" value="Lab. Cómputo" color={Platform.OS === 'android' ? '#ffffff' : undefined} />
              <Picker.Item label="Lab. Electrónica" value="Lab. Electrónica" color={Platform.OS === 'android' ? '#ffffff' : undefined} />
              <Picker.Item label="Lab. Química" value="Lab. Química" color={Platform.OS === 'android' ? '#ffffff' : undefined} />
            </Picker>
          </View>
          
          {/* FECHA */}
          <Text style={styles.label}>FECHA SOLICITADA</Text>
          <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('fecha', 'date')}>
            <Ionicons name="calendar-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput 
              style={styles.inputFull} 
              placeholder="dd/mm/aaaa" 
              placeholderTextColor="#475569" 
              value={form.fecha} 
              editable={false} 
              pointerEvents="none" 
            />
            <Ionicons name="calendar" size={18} color="#1e293b" />
          </TouchableOpacity>

          {/* HORAS */}
          <View style={styles.row}>
            <View style={{flex: 1, marginRight: 15}}>
              <Text style={styles.label}>HORA INICIO</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('horaInicio', 'time')}>
                <Ionicons name="time-outline" size={20} color="#64748b" style={styles.icon} />
                <TextInput 
                  style={styles.inputFull} 
                  placeholder="--:--" 
                  placeholderTextColor="#475569" 
                  value={form.horaInicio} 
                  editable={false} 
                  pointerEvents="none" 
                />
              </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.label}>HORA FIN</Text>
              <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('horaFin', 'time')}>
                <Ionicons name="time-outline" size={20} color="#64748b" style={styles.icon} />
                <TextInput 
                  style={styles.inputFull} 
                  placeholder="--:--" 
                  placeholderTextColor="#475569" 
                  value={form.horaFin} 
                  editable={false} 
                  pointerEvents="none" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* MOTIVO */}
          <Text style={styles.label}>MOTIVO ACADÉMICO / PROYECTO</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput 
              style={styles.textArea} 
              multiline 
              placeholder="Describa el proyecto o clase..." 
              placeholderTextColor="#475569"
              value={form.motivo} 
              onChangeText={(t) => setForm({...form, motivo: t})} 
              textAlignVertical="top"
            />
          </View>
          
          {/* BOTÓN ENVIAR */}
          <TouchableOpacity style={styles.submitButton} onPress={enviarSolicitud}>
            <Text style={styles.submitText}>Enviar Solicitud de Acceso</Text>
          </TouchableOpacity>
        </View>

        {/* COMPONENTE NATIVO DEL PICKER (FECHA/HORA) */}
        {showPicker && (
          <DateTimePicker 
            value={new Date()} 
            mode={mode} 
            is24Hour={true} 
            onChange={onChangePicker} 
            themeVariant="dark" // Intenta forzar el modo oscuro en iOS
          />
        )}
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
  header: { 
    paddingHorizontal: 25, 
    paddingTop: 30, 
    paddingBottom: 20 
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
  },
  bodyContainer: { 
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  label: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#94a3b8', 
    marginBottom: 8,
    marginTop: 20,
    letterSpacing: 1,
    marginLeft: 4,
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#1e293b', 
    borderWidth: 1, 
    borderColor: '#334155', 
    borderRadius: 14, 
    paddingHorizontal: 15,
    height: 55,
  },
  icon: {
    marginRight: 10,
  },
  picker: {
    flex: 1,
    color: '#ffffff',
    marginLeft: -10, // Ajuste para alinear con los text inputs
  },
  inputFull: { 
    flex: 1, 
    color: '#ffffff', 
    fontSize: 15,
    height: '100%',
  },
  row: { 
    flexDirection: 'row',
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingTop: 15,
  },
  textArea: {
    flex: 1,
    width: '100%',
    color: '#ffffff',
    fontSize: 15,
  },
  submitButton: { 
    backgroundColor: '#10b981', 
    padding: 18, 
    borderRadius: 14, 
    alignItems: 'center', 
    marginTop: 35,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});
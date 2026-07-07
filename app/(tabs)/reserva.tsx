import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker'; // Asegúrate de haber instalado esto
import { onValue, push, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function ReservaScreen() {
  const [nombreDocente, setNombreDocente] = useState('Docente');
  const [form, setForm] = useState({ laboratorio: 'Lab. Cómputo', fecha: '', horaInicio: '', horaFin: '', motivo: '' });

  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [activeField, setActiveField] = useState<'fecha' | 'horaInicio' | 'horaFin' | null>(null);

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Nueva Reserva</Text>
        <Text style={styles.subtitle}>Selecciona y solicita acceso.</Text>
      </View>
      
      <View style={styles.bodyContainer}>
        <Text style={styles.label}>Laboratorio</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={form.laboratorio}
            onValueChange={(val) => setForm({...form, laboratorio: val})}
          >
            <Picker.Item label="💻 Lab. Cómputo" value="Lab. Cómputo" />
            <Picker.Item label="⚡ Lab. Electrónica" value="Lab. Electrónica" />
            <Picker.Item label="🧪 Lab. Química" value="Lab. Química" />
          </Picker>
        </View>
        
        <Text style={styles.label}>Fecha solicitada</Text>
        <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('fecha', 'date')}>
          <TextInput style={styles.inputFull} placeholder="dd/mm/aaaa" value={form.fecha} editable={false} pointerEvents="none" />
          <Text style={styles.inputIcon}>📅</Text>
        </TouchableOpacity>

        <View style={styles.row}>
          <View style={{flex: 1, marginRight: 10}}>
            <Text style={styles.label}>Inicio</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('horaInicio', 'time')}>
              <TextInput style={styles.inputFull} placeholder="--:--" value={form.horaInicio} editable={false} pointerEvents="none" />
              <Text style={styles.inputIcon}>🕒</Text>
            </TouchableOpacity>
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.label}>Fin</Text>
            <TouchableOpacity style={styles.inputContainer} onPress={() => openPicker('horaFin', 'time')}>
              <TextInput style={styles.inputFull} placeholder="--:--" value={form.horaFin} editable={false} pointerEvents="none" />
              <Text style={styles.inputIcon}>🕒</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Motivo</Text>
        <TextInput style={[styles.input, {height: 80}]} multiline placeholder="Describe el proyecto..." value={form.motivo} onChangeText={(t) => setForm({...form, motivo: t})} />
        
        <TouchableOpacity style={styles.submitButton} onPress={enviarSolicitud}>
          <Text style={styles.submitText}>Enviar Solicitud</Text>
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker value={new Date()} mode={mode} is24Hour={true} onChange={onChangePicker} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { backgroundColor: '#090d16', padding: 25, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  mainTitle: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 5 },
  bodyContainer: { padding: 25 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 15, padding: 15 },
  pickerContainer: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 15, paddingHorizontal: 15, marginBottom: 10 },
  inputFull: { flex: 1, paddingVertical: 15, color: '#000' },
  inputIcon: { fontSize: 16, color: '#64748b' },
  row: { flexDirection: 'row' },
  submitButton: { backgroundColor: '#10b981', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 30 },
  submitText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' }
});
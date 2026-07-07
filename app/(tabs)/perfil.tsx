import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { onValue, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState<any>(null);
  const [userKey, setUserKey] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoPin, setNuevoPin] = useState('');
  const router = useRouter();

  useEffect(() => {
    const correo = auth.currentUser?.email;
    if (!correo) return;

    onValue(ref(db, 'laboratorio/usuarios'), (snap) => {
      const users = snap.val();
      const key = Object.keys(users || {}).find(k => users[k].correo === correo);
      if (key) {
        setUserKey(key);
        setUsuario(users[key]);
      }
    });
  }, []);

  const handleSavePin = async () => {
    if (/^\d{4}$/.test(nuevoPin)) {
      const hashedPin = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nuevoPin);
      if (userKey) {
        const updates: any = {};
        updates[`laboratorio/usuarios/${userKey}/pin`] = hashedPin;
        updates[`docentes/${userKey}/pin`] = hashedPin;
        await update(ref(db), updates);
        setModalVisible(false);
        setNuevoPin('');
        Alert.alert("Éxito", "PIN actualizado correctamente.");
      }
    } else {
      Alert.alert("Error", "El PIN debe ser de 4 dígitos.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de salir?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => signOut(auth).then(() => router.replace('/')) }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{usuario?.nombre?.charAt(0) || 'U'}</Text></View>
        <Text style={styles.name}>{usuario?.nombre || 'Cargando...'}</Text>
        <Text style={styles.email}>{usuario?.correo || '---'}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Información de Cuenta</Text>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Laboratorio Asignado</Text>
          <Text style={styles.value}>{usuario?.laboratorio || 'No asignado'}</Text>
          <View style={styles.divider} />
          
          <Text style={styles.label}>PIN de Acceso</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={[styles.value, {color: '#10b981'}]}>●●●● (Cambiar PIN)</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          <Text style={styles.label}>Estado</Text>
          <Text style={[styles.value, { color: usuario?.habilitado ? '#10b981' : '#ef4444' }]}>
            {usuario?.habilitado ? '✅ Habilitado' : '❌ Deshabilitado'}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DE CAMBIO DE PIN */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo PIN</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="0000"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              value={nuevoPin}
              onChangeText={setNuevoPin}
            />
            <View style={{flexDirection: 'row', width: '100%', gap: 10}}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleSavePin}><Text style={{color: '#fff', fontWeight: 'bold'}}>Guardar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { alignItems: 'center', backgroundColor: '#090d16', paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 40, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  email: { fontSize: 14, color: '#94a3b8', marginTop: 5 },
  body: { padding: 25 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
  infoCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 11, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', fontWeight: '600' },
  value: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 12 },
  logoutButton: { backgroundColor: '#fee2e2', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#dc2626', fontWeight: 'bold' },
  // Estilos del Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 25, borderRadius: 20, width: '85%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { borderWidth: 1, borderColor: '#e2e8f0', width: '100%', padding: 15, borderRadius: 10, marginBottom: 20, textAlign: 'center', fontSize: 20, letterSpacing: 10 },
  btnCancel: { padding: 15, borderRadius: 10, backgroundColor: '#f1f5f9', flex: 1, alignItems: 'center' },
  btnSave: { padding: 15, borderRadius: 10, backgroundColor: '#10b981', flex: 1, alignItems: 'center' }
});
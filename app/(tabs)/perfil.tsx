import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { onValue, ref, update } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebase';

export default function PerfilScreen() {
  const [usuario, setUsuario] = useState<any>(null);
  const [userKey, setUserKey] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoPin, setNuevoPin] = useState('');
  const router = useRouter();

  // Lógica intacta
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
    Alert.alert("Cerrar Sesión", "¿Estás seguro de salir del portal?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => signOut(auth).then(() => router.replace('/')) }
    ]);
  };

  // Función para iniciales
  const getIniciales = (nombre: string) => {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    return nombre.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* HEADER / AVATAR */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{getIniciales(usuario?.nombre)}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <View style={styles.verifiedBadgeBg}>
                <Ionicons name="checkmark" size={10} color="#090d16" />
              </View>
            </View>
          </View>
          <Text style={styles.userName}>{usuario?.nombre || 'Cargando...'}</Text>
          <Text style={styles.userEmail}>{usuario?.correo || '---'}</Text>
        </View>

        {/* INFO CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMACIÓN DE CUENTA</Text>

          {/* Fila 1: Laboratorio */}
          <View style={styles.infoRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="desktop-outline" size={20} color="#64748b" style={styles.icon} />
              <Text style={styles.rowLabel}>Laboratorio Asignado</Text>
            </View>
            <Text style={styles.rowValue}>{usuario?.laboratorio || 'No asignado'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Fila 2: PIN */}
          <View style={styles.infoRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="key-outline" size={20} color="#64748b" style={styles.icon} />
              <Text style={styles.rowLabel}>PIN de Acceso</Text>
            </View>
            <View style={styles.pinContainer}>
              <Text style={styles.pinDots}>•••• </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={styles.changePinText}>(Cambiar PIN)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Fila 3: Estado */}
          <View style={styles.infoRow}>
            <View style={styles.rowLeft}>
              <Ionicons name="toggle" size={20} color="#64748b" style={styles.icon} />
              <Text style={styles.rowLabel}>Estado del Docente</Text>
            </View>
            
            <View style={[styles.statusPill, { 
              backgroundColor: usuario?.habilitado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderColor: usuario?.habilitado ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }]}>
              <View style={[styles.statusDot, { backgroundColor: usuario?.habilitado ? '#10b981' : '#ef4444' }]} />
              <Text style={[styles.statusText, { color: usuario?.habilitado ? '#10b981' : '#ef4444' }]}>
                {usuario?.habilitado ? 'Habilitado' : 'Deshabilitado'}
              </Text>
            </View>

          </View>

        </View>

        {/* LOGOUT BUTTON */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="power" size={20} color="#ef4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Cerrar Sesión Segura</Text>
          </TouchableOpacity>
        </View>

        {/* MODAL DE CAMBIO DE PIN (Adaptado a Dark Mode) */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconWrapper}>
                <Ionicons name="lock-closed" size={24} color="#10b981" />
              </View>
              <Text style={styles.modalTitle}>Configurar Nuevo PIN</Text>
              <Text style={styles.modalSubtitle}>Ingresa 4 dígitos para tu acceso físico.</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="0000"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
                value={nuevoPin}
                onChangeText={setNuevoPin}
              />
              
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity style={styles.btnCancel} onPress={() => {
                  setModalVisible(false);
                  setNuevoPin('');
                }}>
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnSave} onPress={handleSavePin}>
                  <Text style={styles.btnSaveText}>Guardar PIN</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
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
  profileHeader: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#090d16',
    borderRadius: 12,
    padding: 3,
  },
  verifiedBadgeBg: {
    backgroundColor: '#10b981',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#94a3b8',
  },
  card: {
    backgroundColor: '#172033',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 1,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  rowValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 12,
  },
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinDots: {
    fontSize: 14,
    color: '#ffffff',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  changePinText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: 'bold',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomContainer: {
    marginTop: 'auto',
    marginBottom: 40,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  /* ESTILOS DEL MODAL (DARK MODE) */
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(2, 6, 23, 0.8)', // Fondo más oscuro
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: { 
    backgroundColor: '#172033', 
    padding: 30, 
    borderRadius: 24, 
    width: '100%', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  modalIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#ffffff',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 25,
  },
  modalInput: { 
    borderWidth: 1, 
    borderColor: '#334155', 
    backgroundColor: '#0f172a',
    color: '#ffffff',
    width: '100%', 
    padding: 15, 
    borderRadius: 14, 
    marginBottom: 25, 
    textAlign: 'center', 
    fontSize: 24, 
    letterSpacing: 15,
    fontWeight: 'bold',
  },
  modalButtonsRow: {
    flexDirection: 'row', 
    width: '100%', 
    gap: 12
  },
  btnCancel: { 
    paddingVertical: 14, 
    borderRadius: 14, 
    backgroundColor: '#1e293b', 
    flex: 1, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnCancelText: {
    color: '#cbd5e1',
    fontWeight: '600',
  },
  btnSave: { 
    paddingVertical: 14, 
    borderRadius: 14, 
    backgroundColor: '#10b981', 
    flex: 1, 
    alignItems: 'center' 
  },
  btnSaveText: {
    color: '#ffffff', 
    fontWeight: 'bold'
  }
});
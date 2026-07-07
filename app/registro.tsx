import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
// ¡NUEVO: Importamos sendEmailVerification!
import * as Crypto from 'expo-crypto';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { get, ref, update } from 'firebase/database';
import { auth, db } from '../firebase';

export default function RegistroScreen() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegistro = async () => {
    if (!correo || !password || !pin) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }
    if (pin.length !== 4) {
      Alert.alert('Error', 'El PIN debe tener exactamente 4 dígitos');
      return;
    }

    setLoading(true);
    try {
      const correoLimpio = correo.trim().toLowerCase();

      const snapshot = await get(ref(db, 'docentes')); 
      const usuarios = snapshot.val();
      
      let userKey = null;

      if (usuarios) {
        for (const key in usuarios) {
          if (usuarios[key].correo?.toLowerCase() === correoLimpio) {
            userKey = key;
            break;
          }
        }
      }

      if (!userKey) {
        Alert.alert('Acceso Denegado', 'Tu correo no está registrado. Pide al administrador que te agregue.');
        setLoading(false);
        return;
      }

      // Creamos el usuario
      const userCredential = await createUserWithEmailAndPassword(auth, correoLimpio, password);
      
      // ¡NUEVO: Enviamos el correo de verificación!
      await sendEmailVerification(userCredential.user);

      const hashedPin = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        pin
      );

      const updates: any = {};
      updates[`laboratorio/usuarios/${userKey}/pin`] = hashedPin;
      updates[`docentes/${userKey}/pin`] = hashedPin;

      await update(ref(db), updates);

      // Cambiamos el mensaje para avisarles del correo
      Alert.alert('¡Casi listo!', 'Te hemos enviado un enlace a tu correo. Por favor, verifícalo para poder iniciar sesión.');
      router.replace('/'); 
    } catch (error: any) {
      Alert.alert('Error', 'Hubo un problema al registrar la cuenta. Es posible que este correo ya tenga contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Activa tu Cuenta</Text>
      <Text style={styles.subtitle}>Verifica tu correo asignado y crea tu PIN de seguridad.</Text>

      <Text style={styles.label}>Correo electrónico (asignado por Admin):</Text>
      <TextInput style={styles.input} placeholder="correo@ejemplo.com" placeholderTextColor="#475569" keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} />

      <Text style={styles.label}>Crea una Contraseña (App):</Text>
      <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" placeholderTextColor="#475569" secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={styles.label}>Crea tu PIN de Acceso (Puerta):</Text>
      <TextInput style={styles.input} placeholder="0000" placeholderTextColor="#475569" keyboardType="numeric" maxLength={4} secureTextEntry value={pin} onChangeText={setPin} />

      <TouchableOpacity style={styles.button} onPress={handleRegistro} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Verificando...' : 'Activar Cuenta'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.linkContainer}>
        <Text style={styles.linkText}>¿Ya activaste tu cuenta? <Text style={styles.linkBold}>Inicia sesión</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#090d16', paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 50 },
  title: { fontSize: 28, color: '#ffffff', fontWeight: 'bold' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 30, marginTop: 5 },
  label: { color: '#94a3b8', marginBottom: 8, marginTop: 15, fontSize: 13, fontWeight: 'bold' },
  input: { backgroundColor: '#0f172a', padding: 15, borderRadius: 10, color: '#ffffff', borderWidth: 1, borderColor: '#1e293b' },
  button: { backgroundColor: '#10b981', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 30, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
  linkContainer: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#94a3b8', fontSize: 14 },
  linkBold: { color: '#10b981', fontWeight: 'bold' }
});
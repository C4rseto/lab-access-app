import { router } from 'expo-router';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth'; // Importamos signOut
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { auth } from '../firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor llena todos los campos');
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // FILTRO 1: Evitar que el admin entre a la app móvil
      const adminEmail = "admin@universidad.edu.pe"; 
      if (user.email?.toLowerCase() === adminEmail.toLowerCase()) {
        Alert.alert('Acceso Denegado', 'Eres administrador. Inicia sesión en el panel web.');
        await signOut(auth);
        setLoading(false);
        return;
      }

      // FILTRO 2 DE SEGURIDAD: Validar correo verificado
      if (!user.emailVerified) {
        Alert.alert(
          'Correo no verificado 📧', 
          'Por favor, revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en el enlace para confirmar tu cuenta.'
        );
        await signOut(auth); // Cerramos la sesión inmediatamente para que no se quede "logueado a medias"
        setLoading(false);
        return;
      }
      
      // Si pasa los dos filtros, lo mandamos al home
      router.replace('/home');
      
    } catch (error: any) {
      // Manejo de errores más específico
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Correo o contraseña incorrectos');
      } else {
        Alert.alert('Error', 'Ocurrió un problema al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.innerContainer}>
        
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🛡️</Text>
        </View>

        <Text style={styles.title}>LabAccess</Text>
        <Text style={styles.subtitle}>Portal del Docente</Text>

        <View style={styles.form}>
          <TextInput 
            style={styles.input} 
            placeholder="Correo electrónico" 
            placeholderTextColor="#475569" 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address"
          />

          <TextInput 
            style={styles.input} 
            placeholder="Contraseña" 
            placeholderTextColor="#475569" 
            value={password} 
            onChangeText={setPassword} 
            secureTextEntry 
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>¿Tu cuenta es nueva? </Text>
          <TouchableOpacity onPress={() => router.push('/registro')}>
            <Text style={styles.registerLink}>Actívala aquí</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#10b981',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
  },
  iconText: { fontSize: 40 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#ffffff', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#94a3b8', marginBottom: 44 },
  form: { width: '100%', gap: 14 },
  input: {
    width: '100%',
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#ffffff',
    fontSize: 15,
  },
  button: {
    width: '100%',
    backgroundColor: '#10b981',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footerContainer: { flexDirection: 'row', marginTop: 24 },
  footerText: { color: '#94a3b8' },
  registerLink: { color: '#10b981', fontWeight: 'bold' }
});
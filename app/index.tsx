import { Ionicons } from '@expo/vector-icons'; // Importamos los iconos
import { router } from 'expo-router';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { auth } from '../firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // TU LÓGICA INTACTA DE FIREBASE
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
        await signOut(auth);
        setLoading(false);
        return;
      }
      
      // Si pasa los dos filtros, lo mandamos al home
      router.replace('/home');
      
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Correo o contraseña incorrectos');
      } else {
        Alert.alert('Error', 'Ocurrió un problema al iniciar sesión. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // NUEVO DISEÑO PREMIUM
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        
        {/* CABECERA Y LOGO */}
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
            <Ionicons name="shield-checkmark" size={45} color="#fff" />
          </View>
          <Text style={styles.title}>LabAccess</Text>
          <Text style={styles.subtitle}>PORTAL DEL DOCENTE</Text>
          <Text style={styles.description}>
            Inicie sesión con sus credenciales institucionales seguras.
          </Text>
        </View>

        {/* FORMULARIO */}
        <View style={styles.formContainer}>
          
          <Text style={styles.label}>CORREO INSTITUCIONAL</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ej. edins19n@gmail.com"
              placeholderTextColor="#475569"
              value={email} // Conectado a tu estado
              onChangeText={setEmail} // Conectado a tu estado
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>CONTRASEÑA</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#64748b" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#475569"
              value={password} // Conectado a tu estado
              onChangeText={setPassword} // Conectado a tu estado
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Ingresar al Portal</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Tu cuenta es nueva? </Text>
          {/* Conectado a tu ruta de registro */}
          <TouchableOpacity onPress={() => router.push('/registro')}>
            <Text style={styles.footerLink}>Actívala aquí</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ESTILOS PREMIUM
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    backgroundColor: '#10b981',
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 15,
  },
  description: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#334155',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    height: '100%',
  },
  button: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  footerLink: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
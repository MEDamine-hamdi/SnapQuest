import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password)
      return Alert.alert('Erreur', 'Remplis tous les champs');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🗺️ SnapQuest</Text>
      <Text style={styles.subtitle}>Connecte-toi pour explorer</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#5a6080"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#5a6080"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Se connecter</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>Pas de compte ? S'inscrire</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f', justifyContent: 'center', padding: 28 },
  logo: { fontSize: 32, fontWeight: '800', color: '#f5a623', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: '#9198c0', textAlign: 'center', marginBottom: 28 },
  input: { backgroundColor: '#1e2130', borderRadius: 12, padding: 16, color: '#e8eaf6', marginBottom: 12, borderWidth: 1, borderColor: '#2e3250' },
  btn: { backgroundColor: '#f5a623', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0a0b0f', fontWeight: '800', fontSize: 16 },
  link: { color: '#4fc3f7', textAlign: 'center', marginTop: 20 },
});
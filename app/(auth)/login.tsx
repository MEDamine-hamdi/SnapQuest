import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password)
      return Alert.alert('Remplis tous les champs');
    setLoading(true);
    try {
      await signUp(email, password, username);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur', e.message);
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <TextInput style={styles.input} placeholder="Nom d'utilisateur"
        placeholderTextColor="#5a6080" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="Email"
        placeholderTextColor="#5a6080" value={email} onChangeText={setEmail}
        keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Mot de passe"
        placeholderTextColor="#5a6080" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Inscription...' : "S'inscrire"}</Text>
      </TouchableOpacity>
      <Link href="/(auth)/login" style={styles.link}>Déjà un compte ? Connecte-toi</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f', justifyContent: 'center', padding: 28 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 28 },
  input: { backgroundColor: '#0e1117', borderWidth: 1, borderColor: '#1e2130',
    borderRadius: 10, padding: 14, color: '#d4daf0', marginBottom: 14, fontSize: 15 },
  btn: { backgroundColor: '#f5a623', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  link: { color: '#5a6080', textAlign: 'center', marginTop: 20, fontSize: 14 },
});
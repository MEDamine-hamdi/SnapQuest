import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';

const INTERESTS = [
  '📸 Photo', '🏛️ Histoire', '🍜 Gastronomie', '🌿 Nature',
  '🎨 Art', '🏃 Sport', '🎭 Culture', '🌊 Mer'
];

export default function RegisterScreen() {
  const [form, setForm] = useState({ username: '', email: '', password: '', age_range: '18-22' });
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (i: string) => {
    setSelectedInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const handleRegister = async () => {
    if (!form.username || !form.email || !form.password) {
      Alert.alert('Erreur', 'Remplis tous les champs'); return;
    }
    if (selectedInterests.length === 0) {
      Alert.alert('Erreur', 'Choisis au moins un intérêt'); return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        ...form,
        interests: selectedInterests.map(i => i.split(' ').slice(1).join(' ').toLowerCase()),
      });
      Alert.alert('Compte créé !', 'Tu peux maintenant te connecter.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (e: any) {
      // Show the actual server error instead of a generic message
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        'Erreur inconnue';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.logo}>🗺️ SnapQuest</Text>
        <Text style={styles.subtitle}>Crée ton compte explorateur</Text>

        {[
          { key: 'username', placeholder: 'Pseudo' },
          { key: 'email', placeholder: 'Email', keyboard: 'email-address' },
          { key: 'password', placeholder: 'Mot de passe', secure: true },
        ].map(({ key, placeholder, keyboard, secure }) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#5a6080"
            value={(form as any)[key]}
            onChangeText={v => setForm(prev => ({ ...prev, [key]: v }))}
            keyboardType={(keyboard as any) || 'default'}
            autoCapitalize="none"
            secureTextEntry={secure}
          />
        ))}

        <Text style={styles.label}>Tranche d'âge</Text>
        <View style={styles.row}>
          {['16-18', '18-22', '23-25', '26-30', '30+'].map(age => (
            <TouchableOpacity
              key={age}
              style={[styles.chip, form.age_range === age && styles.chipActive]}
              onPress={() => setForm(prev => ({ ...prev, age_range: age }))}>
              <Text style={[styles.chipText, form.age_range === age && styles.chipTextActive]}>{age}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Tes intérêts</Text>
        <View style={styles.row}>
          {INTERESTS.map(i => (
            <TouchableOpacity
              key={i}
              style={[styles.chip, selectedInterests.includes(i) && styles.chipActive]}
              onPress={() => toggleInterest(i)}>
              <Text style={[styles.chipText, selectedInterests.includes(i) && styles.chipTextActive]}>{i}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.btnText}>Créer mon compte</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f' },
  inner: { padding: 24, paddingTop: 60 },
  logo: { fontSize: 32, fontWeight: '800', color: '#f5a623', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: '#9198c0', textAlign: 'center', marginBottom: 28 },
  input: { backgroundColor: '#1e2130', borderRadius: 12, padding: 16, color: '#e8eaf6', marginBottom: 12, borderWidth: 1, borderColor: '#2e3250' },
  label: { color: '#9198c0', fontWeight: '700', fontSize: 12, letterSpacing: 1, marginBottom: 8, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { backgroundColor: '#1e2130', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#2e3250' },
  chipActive: { backgroundColor: '#f5a623', borderColor: '#f5a623' },
  chipText: { color: '#9198c0', fontSize: 13 },
  chipTextActive: { color: '#0a0b0f', fontWeight: '700' },
  btn: { backgroundColor: '#f5a623', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0a0b0f', fontWeight: '800', fontSize: 16 },
  link: { color: '#4fc3f7', textAlign: 'center', marginTop: 20 }
});

import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, Alert,
  StyleSheet, ScrollView, ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../services/api';

export default function ChallengeDetailScreen() {
  const { id } = useLocalSearchParams();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{ validated: boolean; score: number; message: string } | null>(null);

  // challenge data fetché via useEffect + api.get(`/challenges/${id}`) ...

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'Active la caméra dans les paramètres');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const submitPhoto = async () => {
    if (!photoUri) return;
    setVerifying(true);

    const formData = new FormData();
    formData.append('photo', {
      uri: photoUri,
      type: 'image/jpeg',
      name: 'challenge_photo.jpg'
    } as any);
    formData.append('challenge_id', id as string);

    try {
      const res = await api.post('/challenges/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch {
      Alert.alert('Erreur', 'Problème lors de la vérification');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      { /* En-tête défi */ }
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Défi : {id}</Text>
      </View>

      { /* Étapes du défi */ }
      <View style={styles.steps}>
        <Text style={styles.sectionTitle}>📍 Étapes</Text>
        { /* Rendu steps... */ }
      </View>

      { /* Section photo */ }
      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>📸 Preuve photo</Text>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.previewImage} />
        ) : (
          <TouchableOpacity style={styles.cameraBtn} onPress={takePhoto}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraBtnText}>Prendre une photo</Text>
          </TouchableOpacity>
        )}
        {photoUri && !result && (
          <TouchableOpacity style={styles.submitBtn} onPress={submitPhoto} disabled={verifying}>
            {verifying ? (
              <><ActivityIndicator color="#000" /><Text style={styles.submitText}> IA en cours...</Text></>
            ) : (
              <Text style={styles.submitText}>🤖 Vérifier avec l'IA</Text>
            )}
          </TouchableOpacity>
        )}
        {result && (
          <View style={[styles.resultCard, { borderColor: result.validated ? '#66bb6a' : '#e8523a' }]}>
            <Text style={styles.resultIcon}>{result.validated ? '✅' : '❌'}</Text>
            <Text style={styles.resultScore}>Score de confiance : {result.score}%</Text>
            <Text style={styles.resultMsg}>{result.message}</Text>
            {result.validated && <Text style={styles.xpGain}>🎉 +120 XP gagnés !</Text>}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f' },
  header: { padding: 20, paddingTop: 56 },
  back: { color: '#4fc3f7', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#e8eaf6' },
  steps: { padding: 20 },
  sectionTitle: { color: '#9198c0', fontWeight: '700', marginBottom: 12, fontSize: 13, letterSpacing: 0.1 },
  photoSection: { padding: 20 },
  cameraBtn: { backgroundColor: '#1e2130', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: '#2e3250', borderStyle: 'dashed' },
  cameraIcon: { fontSize: 48, marginBottom: 8 },
  cameraBtnText: { color: '#9198c0' },
  previewImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 12 },
  submitBtn: { backgroundColor: '#f5a623', borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  submitText: { color: '#000', fontWeight: '800', fontSize: 15 },
  resultCard: { backgroundColor: '#1e2130', borderRadius: 12, padding: 20, borderWidth: 2, alignItems: 'center', marginTop: 12 },
  resultIcon: { fontSize: 40, marginBottom: 8 },
  resultScore: { color: '#f5a623', fontWeight: '700', marginBottom: 4 },
  resultMsg: { color: '#9198c0', textAlign: 'center', marginBottom: 8 },
  xpGain: { color: '#66bb6a', fontWeight: '800', fontSize: 18 }
});
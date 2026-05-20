import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';

type Challenge = {
  id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  completed: boolean;
};

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: replace with real API call to your FastAPI backend
    setTimeout(() => {
      setChallenges([
        { id: '1', title: 'Visite la Médina', description: 'Explore les ruelles historiques de Tunis', points: 100, category: 'Culture', completed: false },
        { id: '2', title: 'Coucher de soleil à Sidi Bou Said', description: 'Prends une photo du coucher de soleil', points: 150, category: 'Nature', completed: false },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color="#f5a623" size="large" /></View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Défis</Text>
      <FlatList data={challenges} keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}
            onPress={() => router.push(`/challenge/${item.id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.points}>+{item.points} pts</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.description}</Text>
          </TouchableOpacity>
        )} contentContainerStyle={{ gap: 12, padding: 16 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0b0f' },
  header: { fontSize: 26, fontWeight: '800', color: '#fff', padding: 20, paddingBottom: 0 },
  card: { backgroundColor: '#0e1117', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#1e2130' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  category: { fontSize: 11, color: '#4ecdc4', fontWeight: '700', textTransform: 'uppercase' },
  points: { fontSize: 12, color: '#f5a623', fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 6 },
  desc: { fontSize: 13, color: '#5a6080' },
});
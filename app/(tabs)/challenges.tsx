import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';

type UserChallenge = {
  id: string;
  status: string;
  xp_earned: number;
  completed_at: string;
  challenges: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    xp_reward: number;
    location_hint: string;
  };
};

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<UserChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'accepted' | 'completed'>('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await api.get('/challenges');
      setChallenges(res.data);
    } catch (e) {
      console.error('Failed to fetch challenges', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = filter === 'all'
    ? challenges
    : challenges.filter(c => c.status === filter);

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color="#f5a623" size="large" /></View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mes Défis</Text>

      {/* Filter tabs */}
      <View style={styles.tabs}>
        {(['all', 'accepted', 'completed'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, filter === tab && styles.tabActive]}
            onPress={() => setFilter(tab)}>
            <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'Tous' : tab === 'accepted' ? 'En cours' : 'Terminés'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {filter === 'completed'
              ? 'Aucun défi terminé pour l\'instant'
              : 'Aucun défi en cours — demande à SnapBot !'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, item.status === 'completed' && styles.cardCompleted]}
              onPress={() => router.push(`/challenge/${item.challenges.id}`)}>
              <View style={styles.cardTop}>
                <Text style={styles.category}>{item.challenges.category}</Text>
                <View style={styles.rightBadge}>
                  {item.status === 'completed' ? (
                    <Text style={styles.completedBadge}>✅ +{item.xp_earned} XP</Text>
                  ) : (
                    <Text style={styles.points}>+{item.challenges.xp_reward} XP</Text>
                  )}
                </View>
              </View>
              <Text style={styles.title}>{item.challenges.title}</Text>
              <Text style={styles.location}>📍 {item.challenges.location_hint}</Text>
              <Text style={styles.difficulty}>{item.challenges.difficulty}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ gap: 12, padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0b0f' },
  header: { fontSize: 26, fontWeight: '800', color: '#fff', padding: 20, paddingBottom: 12 },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1e2130', borderWidth: 1, borderColor: '#2e3250' },
  tabActive: { backgroundColor: '#f5a623', borderColor: '#f5a623' },
  tabText: { color: '#9198c0', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#000' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#5a6080', textAlign: 'center', fontSize: 14 },
  card: { backgroundColor: '#0e1117', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#1e2130' },
  cardCompleted: { borderColor: '#2a4a2a', backgroundColor: '#0e1a0e' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  category: { fontSize: 11, color: '#4ecdc4', fontWeight: '700', textTransform: 'uppercase' },
  rightBadge: { flexDirection: 'row', alignItems: 'center' },
  points: { fontSize: 12, color: '#f5a623', fontWeight: '700' },
  completedBadge: { fontSize: 12, color: '#66bb6a', fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 4 },
  location: { fontSize: 12, color: '#9198c0', marginBottom: 4 },
  difficulty: { fontSize: 11, color: '#5a6080', textTransform: 'uppercase' },
});
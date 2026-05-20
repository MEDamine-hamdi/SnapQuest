import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

type Player = { id: string; username: string; points: number; rank: number };

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: fetch from Supabase leaderboard view
    setTimeout(() => {
      setPlayers([
        { id: '1', username: 'med_amine', points: 2450, rank: 1 },
        { id: '2', username: 'kiwi_dev', points: 1800, rank: 2 },
        { id: '3', username: 'tunisie_explorer', points: 1200, rank: 3 },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const medalColor = (rank: number) =>
    rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : '#5a6080';

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color="#f5a623" size="large" /></View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Classement</Text>
      <FlatList data={players} keyExtractor={p => p.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={[styles.rank, { color: medalColor(item.rank) }]}>#{item.rank}</Text>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.points}>{item.points} pts</Text>
          </View>
        )} contentContainerStyle={{ padding: 16, gap: 8 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0b0f' },
  header: { fontSize: 26, fontWeight: '800', color: '#fff', padding: 20, paddingBottom: 0 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0e1117',
    borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#1e2130' },
  rank: { fontSize: 16, fontWeight: '800', width: 48 },
  username: { flex: 1, fontSize: 15, color: '#d4daf0', fontWeight: '600' },
  points: { fontSize: 14, color: '#f5a623', fontWeight: '700' },
});
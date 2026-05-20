import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

const LEVELS = [
  { level: 1, name: 'Explorateur', minXP: 0, maxXP: 500 },
  { level: 2, name: 'Aventurier', minXP: 500, maxXP: 1200 },
  { level: 3, name: 'Voyageur', minXP: 1200, maxXP: 2500 },
  { level: 4, name: 'Découvreur', minXP: 2500, maxXP: 5000 },
  { level: 5, name: 'Maître Tunisien', minXP: 5000, maxXP: Infinity },
];

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [badges, setBadges] = useState([]);
  const { logout } = useAuth();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    const res = await api.get('/users/me');
    setUser(res.data.user);
    setBadges(res.data.badges);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const getCurrentLevel = (xp: number) =>
    LEVELS.find(l => xp >= l.minXP && xp < l.maxXP) || LEVELS[LEVELS.length - 1];

  const getXPProgress = (xp: number, level: typeof LEVELS[0]) => {
    if (level.maxXP === Infinity) return 100;
    return ((xp - level.minXP) / (level.maxXP - level.minXP)) * 100;
  };

  if (!user) return null;
  const level = getCurrentLevel(user.total_xp);
  const progress = getXPProgress(user.total_xp, level);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{user.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.levelName}>{level.name} — Niveau {level.level}</Text>
      </View>

      { /* Barre XP */ }
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>⚡ {user.total_xp} XP</Text>
          <Text style={styles.xpNext}>Prochain niveau : {level.maxXP === Infinity ? 'MAX' : level.maxXP + ' XP'}</Text>
        </View>
        <View style={styles.xpBar}>
          <View style={[styles.xpFill, { width: `${progress}%` }]} />
        </View>
      </View>

      { /* Stats */ }
      <View style={styles.statsRow}>
        {[
          { label: 'Défis', value: user.challenges_completed, icon: '🏆' },
          { label: 'Streak', value: `${user.streak}j`, icon: '🔥' },
          { label: 'Badges', value: badges.length, icon: '🎖️' },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      { /* Badges */ }
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>🎖️ Badges obtenus</Text>
        <View style={styles.badgeGrid}>
          {badges.map((b: any) => (
            <View key={b.id} style={styles.badgeItem}>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Déconnexion</Text>
      </TouchableOpacity>
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <Text style={styles.badgeName}>{b.name}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f' },
  header: { alignItems: 'center', padding: 32, paddingTop: 56 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f5a623', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#000' },
  name: { fontSize: 24, fontWeight: '800', color: '#e8eaf6' },
  levelName: { color: '#9198c0', marginTop: 4 },
  xpCard: { margin: 16, backgroundColor: '#1e2130', borderRadius: 12, padding: 16 },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel: { color: '#f5a623', fontWeight: '700' },
  xpNext: { color: '#9198c0', fontSize: 12 },
  xpBar: { height: 6, backgroundColor: '#2e3250', borderRadius: 3 },
  xpFill: { height: 6, backgroundColor: '#f5a623', borderRadius: 3 },
  statsRow: { flexDirection: 'row', margin: 16, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#1e2130', borderRadius: 12, padding: 14, alignItems: 'center' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { color: '#e8eaf6', fontWeight: '800', fontSize: 18 },
  statLabel: { color: '#9198c0', fontSize: 11 },
  badgesSection: { padding: 16 },,
  logoutButton: { marginHorizontal: 16, marginBottom: 32, backgroundColor: '#d32f2f', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { color: '#9198c0', fontWeight: '700', fontSize: 13, letterSpacing: 1, marginBottom: 12 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeItem: { backgroundColor: '#1e2130', borderRadius: 8, padding: 12, alignItems: 'center', width: 80 },
  badgeEmoji: { fontSize: 28, marginBottom: 4 },
  badgeName: { color: '#9198c0', fontSize: 10, textAlign: 'center' }
});
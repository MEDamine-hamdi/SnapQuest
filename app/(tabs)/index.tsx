import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import { api } from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  challenge?: Challenge;
}

interface Challenge {
  title: string;
  description?: string;
  xp_reward: number;
  difficulty: string;
  category: string;
  steps: string[];
  proof_required: string;
  location_hint: string;
  time_estimate: string;
  tip: string;
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '🗺️ Salut ! Je suis SnapBot. Dis-moi où tu veux aller et je te propose un défi personnalisé en Tunisie ! Ex: "Je suis à Tunis, j\'aime la photo, j\'ai 2h"'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: input,
        history: messages.slice(-6)
      });
      const { reply, challenge } = res.data;
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        challenge
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Désolé, une erreur s\'est produite. Réessaie !'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const acceptChallenge = async (challenge: Challenge, messageId: string) => {
    setAccepting(messageId);
    try {
      const res = await api.post('/challenges/accept', challenge);
      router.push(`/challenge/${res.data.challenge_id}`);
    } catch {
      Alert.alert('Erreur', 'Impossible d\'accepter le défi, réessaie.');
    } finally {
      setAccepting(null);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={styles.bubbleText}>{item.content}</Text>
      {item.challenge && (
        <TouchableOpacity
          style={styles.challengeCard}
          onPress={() => acceptChallenge(item.challenge!, item.id)}
          disabled={accepting === item.id}
        >
          <Text style={styles.challengeTitle}>🏆 {item.challenge.title}</Text>
          <Text style={styles.challengeXP}>+{item.challenge.xp_reward} XP · {item.challenge.difficulty}</Text>
          {accepting === item.id ? (
            <ActivityIndicator size="small" color="#4fc3f7" style={{ marginTop: 4 }} />
          ) : (
            <Text style={styles.challengeAccept}>Accepter ce défi →</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ SnapBot</Text>
        <Text style={styles.headerSub}>Ton guide IA en Tunisie</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {loading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#f5a623" />
          <Text style={styles.typingText}>SnapBot cherche un défi pour toi...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ex: Je veux explorer Sidi Bou Saïd..."
          placeholderTextColor="#5a6080"
          multiline
          maxLength={200}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f' },
  header: { padding: 20, paddingTop: 56, backgroundColor: '#10121a', borderBottomWidth: 1, borderBottomColor: '#1e2130' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#f5a623' },
  headerSub: { fontSize: 12, color: '#9198c0', marginTop: 2 },
  list: { flex: 1 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 14, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#1e2130', borderBottomRightRadius: 4 },
  botBubble: { alignSelf: 'flex-start', backgroundColor: '#181b26', borderWidth: 1, borderColor: '#2e3250', borderBottomLeftRadius: 4 },
  bubbleText: { color: '#e8eaf6', fontSize: 14, lineHeight: 20 },
  challengeCard: { backgroundColor: '#252840', borderRadius: 10, padding: 12, marginTop: 10, borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)' },
  challengeTitle: { color: '#e8eaf6', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  challengeXP: { color: '#f5a623', fontSize: 12, marginBottom: 8 },
  challengeAccept: { color: '#4fc3f7', fontSize: 13, fontWeight: '600' },
  typingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  typingText: { color: '#9198c0', fontSize: 13 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, backgroundColor: '#10121a', borderTopWidth: 1, borderTopColor: '#1e2130' },
  textInput: { flex: 1, backgroundColor: '#1e2130', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#e8eaf6', maxHeight: 100 },
  sendBtn: { backgroundColor: '#f5a623', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#000', fontSize: 18, fontWeight: '800' }
});
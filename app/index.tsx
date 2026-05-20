import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

type Message = { id: string; role: 'user' | 'assistant'; text: string };

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: 'Salam ! Je suis ton guide SnapQuest. Dis-moi ce qui t\'intéresse en Tunisie 🇹🇳' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<any>(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      // TODO: POST to your FastAPI RAG endpoint
      // const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/chat`, { method:'POST', body: JSON.stringify({message: input}) });
      // const data = await res.json();
      const reply = 'Je te recommande de visiter la Médina de Tunis ! C\'est un défi parfait pour toi 🏛️';
      setMessages(prev => [...prev, { id: (Date.now()+1).toString(), role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', text: 'Erreur de connexion au serveur.' }]);
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Text style={styles.header}>Chatbot</Text>
      <FlatList ref={listRef} data={messages} keyExtractor={m => m.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.bubbleText, item.role === 'user' && styles.userText]}>{item.text}</Text>
          </View>
        )} contentContainerStyle={{ padding: 16, gap: 10 }} />
      {loading && <Text style={styles.typing}>En train d'écrire...</Text>}
      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput}
          placeholder="Pose ta question..." placeholderTextColor="#5a6080"
          onSubmitEditing={sendMessage} returnKeyType="send" />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0b0f' },
  header: { fontSize: 26, fontWeight: '800', color: '#fff', padding: 20, paddingBottom: 8 },
  bubble: { maxWidth: '80%', borderRadius: 14, padding: 12 },
  userBubble: { backgroundColor: '#f5a623', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#0e1117', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#1e2130' },
  bubbleText: { fontSize: 14, color: '#d4daf0', lineHeight: 20 },
  userText: { color: '#000' },
  typing: { color: '#5a6080', fontSize: 12, paddingHorizontal: 20, paddingBottom: 8 },
  inputRow: { flexDirection: 'row', gap: 10, padding: 16, paddingTop: 8,
    borderTopWidth: 1, borderColor: '#1e2130' },
  input: { flex: 1, backgroundColor: '#0e1117', borderRadius: 10, padding: 12,
    color: '#d4daf0', borderWidth: 1, borderColor: '#1e2130', fontSize: 14 },
  sendBtn: { backgroundColor: '#f5a623', borderRadius: 10, width: 44, justifyContent: 'center', alignItems: 'center' },
  sendText: { color: '#000', fontSize: 20, fontWeight: '700' },
});
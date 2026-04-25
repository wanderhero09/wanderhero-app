import React, {useEffect, useState, useRef, useCallback} from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, BASE_URL} from '../theme';
import {useStore} from '../store';
import {getMessages, sendMessage, readMessages, getStatus} from '../api';

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

export default function ChatScreen({route, navigation}: any) {
  const {username: otherUser} = route.params;
  const {user} = useStore();
  const isGlobal = otherUser === '__global__';
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');
  const flatRef = useRef<FlatList>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`${BASE_URL}/messages/${user.username}/${otherUser}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
      if (!isGlobal) readMessages(otherUser, user.username);
    } catch {}
  }, [user, otherUser]);

  useEffect(() => {
    load();
    const i = setInterval(load, 2000);
    const j = !isGlobal ? setInterval(async () => {
      try {
        const s = await getStatus(otherUser);
        setStatus(s.online ? '🟢 онлайн' : '⚫ офлайн');
      } catch {}
    }, 5000) : null;
    return () => { clearInterval(i); if (j) clearInterval(j); };
  }, [load]);

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => flatRef.current?.scrollToEnd({animated: false}), 100);
  }, [messages.length]);

  const handleSend = async () => {
    if (!user || !text.trim()) return;
    const t = text.trim();
    setText('');
    await sendMessage(user.username, otherUser, t);
    load();
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 8}}>
          <Text style={{color: Colors.pink, fontSize: 20}}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10}}
          onPress={() => !isGlobal && navigation.navigate('UserProfile', {username: otherUser})}>
          <Text style={{fontSize: 28}}>{isGlobal ? '🌐' : '👤'}</Text>
          <View>
            <Text style={s.headerName}>{isGlobal ? 'Глобальний чат' : otherUser}</Text>
            {!isGlobal && <Text style={s.headerStatus}>{status}</Text>}
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(item, i) => item.id || i.toString()}
        renderItem={({item}) => {
          const isMe = item.from === user?.username;
          return (
            <View style={[s.msgWrap, isMe ? s.msgMe : s.msgOther]}>
              {!isMe && (
                <Image source={{uri: `${BASE_URL}/uploads/avatars/${item.from}.jpg`}} style={s.msgAvatar}
                  defaultSource={require('../../assets/default-avatar.png')} />
              )}
              <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleOther]}>
                {!isMe && !isGlobal && <Text style={s.bubbleSender}>{item.from}</Text>}
                <Text style={s.bubbleText}>{item.text || (item.fileUrl ? '📎 Файл' : '')}</Text>
                <Text style={s.bubbleTime}>{formatTime(item.time)}</Text>
              </View>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingVertical: 10}}
        onContentSizeChange={() => flatRef.current?.scrollToEnd({animated: true})}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={s.inputArea}>
          <TextInput
            style={s.input}
            placeholder="Повідомлення..."
            placeholderTextColor={Colors.muted}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity style={s.sendBtn} onPress={handleSend}>
            <Text style={{color: '#fff', fontSize: 18}}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.dark},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: 'rgba(5,5,15,0.97)'},
  headerName: {fontSize: 16, fontWeight: '700', color: Colors.text},
  headerStatus: {fontSize: 12, color: Colors.muted, marginTop: 1},
  msgWrap: {flexDirection: 'row', marginHorizontal: 10, marginVertical: 3, alignItems: 'flex-end', gap: 8},
  msgMe: {flexDirection: 'row-reverse'},
  msgOther: {},
  msgAvatar: {width: 28, height: 28, borderRadius: 14},
  bubble: {maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10},
  bubbleMe: {backgroundColor: Colors.purple, borderBottomRightRadius: 4},
  bubbleOther: {backgroundColor: 'rgba(20,20,40,0.95)', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border},
  bubbleSender: {fontSize: 11, fontWeight: '700', color: Colors.cyan, marginBottom: 3},
  bubbleText: {color: '#fff', fontSize: 15, lineHeight: 21},
  bubbleTime: {fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right'},
  inputArea: {flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingHorizontal: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: 'rgba(5,5,15,0.97)'},
  input: {flex: 1, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: Colors.text, fontSize: 15, maxHeight: 120},
  sendBtn: {width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.purple, alignItems: 'center', justifyContent: 'center'},
});

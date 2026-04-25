// DialogsScreen.tsx
import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, BASE_URL} from '../theme';
import {useStore} from '../store';
import {getDialogs, readMessages} from '../api';

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'щойно';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} хв`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} год`;
  return `${new Date(ts).getDate()}.${new Date(ts).getMonth() + 1}`;
}

export default function DialogsScreen({navigation}: any) {
  const {user, setUnread} = useStore();
  const [dialogs, setDialogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getDialogs(user.username);
      const seen = new Set();
      const deduped: any[] = [];
      for (const m of data) {
        const other = m.from === user.username ? m.to : m.from;
        if (!seen.has(other)) { seen.add(other); deduped.push({...m, other}); }
      }
      setDialogs(deduped);
      setUnread(deduped.filter((d: any) => !d.read && d.from !== user.username).length);
    } catch {}
  }, [user]);

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [load]);

  const filtered = dialogs.filter(d => search ? d.other.toLowerCase().includes(search.toLowerCase()) : true);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>Повідомлення</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Chat', {username: '__global__'})}>
          <Text style={{fontSize: 22}}>🌐</Text>
        </TouchableOpacity>
      </View>
      <View style={s.searchWrap}>
        <Text style={{fontSize: 16, marginRight: 8}}>🔍</Text>
        <TextInput style={s.search} placeholder="Пошук..." placeholderTextColor={Colors.muted} value={search} onChangeText={setSearch} />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item, i) => item.id || i.toString()}
        renderItem={({item}) => {
          const isUnread = !item.read && item.from !== user?.username;
          const preview = item.text ? item.text.slice(0, 50) : item.fileUrl ? '📎 Файл' : '🎭 Стікер';
          return (
            <TouchableOpacity
              style={[s.item, isUnread && {backgroundColor: 'rgba(255,45,107,0.04)'}]}
              onPress={() => navigation.navigate('Chat', {username: item.other})}>
              <Image source={{uri: `${BASE_URL}/uploads/avatars/${item.other}.jpg`}} style={s.avatar} defaultSource={require('../../assets/default-avatar.png')} />
              {isUnread && <View style={s.dot} />}
              <View style={{flex: 1, marginLeft: 12}}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <Text style={[s.name, isUnread && {color: '#fff'}]}>{item.other}</Text>
                  <Text style={s.time}>{formatTime(item.time)}</Text>
                </View>
                <Text style={[s.preview, isUnread && {color: Colors.text, fontWeight: '600'}]} numberOfLines={1}>
                  {item.from === user?.username ? 'Ти: ' : ''}{preview}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.dark},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border},
  title: {fontSize: 22, fontWeight: '800', color: Colors.text},
  searchWrap: {flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 14, paddingHorizontal: 14},
  search: {flex: 1, height: 44, color: Colors.text, fontSize: 15},
  item: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.03)', position: 'relative'},
  avatar: {width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: Colors.border},
  dot: {position: 'absolute', bottom: 12, left: 52, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.pink, borderWidth: 2, borderColor: Colors.dark},
  name: {fontSize: 16, fontWeight: '700', color: Colors.text},
  time: {fontSize: 11, color: Colors.muted},
  preview: {fontSize: 13, color: Colors.muted, marginTop: 3},
});

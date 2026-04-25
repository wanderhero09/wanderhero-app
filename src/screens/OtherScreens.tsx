// ExploreScreen.tsx
import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Image} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, BASE_URL} from '../theme';
import {getProfile} from '../api';

export function ExploreScreen({navigation}: any) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const search = async (q: string) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    try {
      const r = await getProfile(q);
      if (r.username) setResults([r]);
      else setResults([]);
    } catch { setResults([]); }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.searchWrap}>
        <Text style={{fontSize: 18, marginRight: 8}}>🔍</Text>
        <TextInput style={s.input} placeholder="Пошук користувачів..." placeholderTextColor={Colors.muted} value={query} onChangeText={search} autoCapitalize="none" />
      </View>
      <FlatList
        data={results}
        keyExtractor={i => i.username}
        renderItem={({item}) => (
          <TouchableOpacity style={s.row} onPress={() => navigation.navigate('UserProfile', {username: item.username})}>
            <Image source={{uri: `${BASE_URL}/uploads/avatars/${item.username}.jpg`}} style={s.avatar} defaultSource={require('../../assets/default-avatar.png')} />
            <View style={{marginLeft: 12}}>
              <Text style={s.name}>{item.username}</Text>
              <Text style={s.meta}>{item.followers?.length || 0} підписників</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{alignItems: 'center', paddingTop: 80}}>
            <Text style={{fontSize: 48, opacity: 0.3}}>🔍</Text>
            <Text style={{color: Colors.muted, marginTop: 12}}>Введи нікнейм для пошуку</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// UploadScreen.tsx
import {Alert as RNAlert, ScrollView} from 'react-native';
import {useStore} from '../store';
import {uploadFile} from '../api';

export function UploadScreen({navigation}: any) {
  const {user} = useStore();
  const [caption, setCaption] = useState('');

  const pickAndUpload = async (type: string) => {
    RNAlert.alert('Завантаження', 'Для завантаження файлів використовуй веб-версію wanderhero.pro або додай expo-image-picker');
  };

  const OPTIONS = [
    {emoji: '📸', label: 'Фото', type: 'photo'},
    {emoji: '🎥', label: 'Відео', type: 'video'},
    {emoji: '🎵', label: 'Музика', type: 'music'},
    {emoji: '📁', label: 'Файл', type: 'other'},
  ];

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.dark}} edges={['top']}>
      <ScrollView contentContainerStyle={{padding: 20, gap: 20}}>
        <Text style={{fontSize: 22, fontWeight: '800', color: Colors.text}}>🚀 Новий пост</Text>
        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 12}}>
          {OPTIONS.map(o => (
            <TouchableOpacity key={o.label} style={us.optCard} onPress={() => pickAndUpload(o.type)}>
              <Text style={{fontSize: 32}}>{o.emoji}</Text>
              <Text style={{fontSize: 13, fontWeight: '700', color: Colors.muted}}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={us.captionInput}
          placeholder="Додай підпис... #хештег"
          placeholderTextColor={Colors.muted}
          value={caption}
          onChangeText={setCaption}
          multiline
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// SettingsScreen.tsx
export function SettingsScreen({navigation}: any) {
  const {user, logout} = useStore();
  const handleLogout = () => {
    Alert.alert('Вийти?', '', [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Вийти', style: 'destructive', onPress: () => { logout(); }},
    ]);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: Colors.dark}} edges={['top']}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{color: Colors.pink, fontSize: 20}}>←</Text>
        </TouchableOpacity>
        <Text style={{fontSize: 18, fontWeight: '700', color: Colors.text}}>Налаштування</Text>
        <View style={{width: 40}} />
      </View>
      <View style={{padding: 20, gap: 14}}>
        <View style={{backgroundColor: 'rgba(10,10,25,0.95)', borderWidth: 1, borderColor: Colors.border, borderRadius: 16, padding: 16}}>
          <Text style={{fontSize: 16, fontWeight: '800', color: Colors.text, marginBottom: 8}}>Акаунт</Text>
          <Text style={{color: Colors.muted}}>👤 {user?.username}</Text>
        </View>
        <TouchableOpacity
          style={{height: 52, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,45,107,0.3)', backgroundColor: 'rgba(255,45,107,0.07)', alignItems: 'center', justifyContent: 'center'}}
          onPress={handleLogout}>
          <Text style={{color: Colors.pink, fontSize: 15, fontWeight: '700'}}>🚪 Вийти з акаунту</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Re-exports
export default ExploreScreen;

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.dark},
  searchWrap: {flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 14, paddingHorizontal: 14},
  input: {flex: 1, height: 48, color: Colors.text, fontSize: 16},
  row: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)'},
  avatar: {width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: Colors.border},
  name: {fontSize: 16, fontWeight: '700', color: Colors.text},
  meta: {fontSize: 12, color: Colors.muted, marginTop: 2},
});

const us = StyleSheet.create({
  optCard: {flex: 1, minWidth: '40%', alignItems: 'center', gap: 8, padding: 20, backgroundColor: Colors.inputBg, borderRadius: 16, borderWidth: 1, borderColor: Colors.border},
  captionInput: {backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 12, padding: 14, color: Colors.text, fontSize: 15, minHeight: 80, textAlignVertical: 'top'},
});

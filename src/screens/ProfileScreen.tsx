// ProfileScreen.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Dimensions, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, BASE_URL} from '../theme';
import {useStore} from '../store';
import {getProfile, getUserPosts, follow, unfollow, getPremium} from '../api';

const {width: SW} = Dimensions.get('window');
const GRID = (SW - 4) / 3;

// Stub for missing imports
const getPremium_stub = async (u: string) => ({premium: false});

export default function ProfileScreen({route, navigation}: any) {
  const {user: currentUser} = useStore();
  const username = route?.params?.username || currentUser?.username || '';
  const isMe = username === currentUser?.username;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [premium, setPremium] = useState(false);

  useEffect(() => {
    if (!username) return;
    getProfile(username).then(p => {
      setProfile(p);
      setFollowing(p.followers?.includes(currentUser?.username));
    }).catch(() => {});
    getUserPosts(username).then(p => setPosts(p.posts || [])).catch(() => {});
    getPremium_stub(username).then(p => setPremium(p.premium)).catch(() => {});
  }, [username]);

  const handleFollow = async () => {
    if (!currentUser) return;
    if (following) await unfollow(currentUser.username, username);
    else await follow(currentUser.username, username);
    setFollowing(!following);
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding: 4}}>
          <Text style={{color: Colors.pink, fontSize: 20}}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{username}</Text>
        {isMe && (
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Text style={{fontSize: 22}}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.profileSection}>
          <View style={s.topRow}>
            <Image source={{uri: `${BASE_URL}/uploads/avatars/${username}.jpg`}} style={s.avatar}
              defaultSource={require('../../assets/default-avatar.png')} />
            <View style={s.stats}>
              {[{v: posts.length, l: 'Пости'}, {v: profile?.followers?.length || 0, l: 'Підписники'}, {v: profile?.following?.length || 0, l: 'Підписки'}].map((st, i) => (
                <View key={i} style={{alignItems: 'center'}}>
                  <Text style={s.statVal}>{st.v}</Text>
                  <Text style={s.statLabel}>{st.l}</Text>
                </View>
              ))}
            </View>
          </View>
          <Text style={s.displayName}>{profile?.displayName || username}</Text>
          {profile?.bio ? <Text style={s.bio}>{profile.bio}</Text> : null}

          <View style={s.btns}>
            {isMe ? (
              <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Settings')}>
                <Text style={s.btnText}>Редагувати</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity style={[s.btn, following && {borderColor: Colors.pink}]} onPress={handleFollow}>
                  <Text style={s.btnText}>{following ? 'Відписатись' : 'Підписатись'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Chat', {username})}>
                  <Text style={s.btnText}>Написати</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 2}}>
          {posts.map(p => (
            <View key={p.id} style={{width: GRID, height: GRID}}>
              {p.type === 'photo'
                ? <Image source={{uri: `${BASE_URL}${p.url}`}} style={{width: '100%', height: '100%'}} />
                : <View style={{width: '100%', height: '100%', backgroundColor: 'rgba(255,45,107,0.1)', alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{fontSize: 32}}>{p.type === 'video' ? '🎥' : '🎵'}</Text>
                  </View>
              }
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.dark},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border},
  headerTitle: {fontSize: 17, fontWeight: '700', color: Colors.text},
  profileSection: {padding: 16},
  topRow: {flexDirection: 'row', alignItems: 'center', gap: 20},
  avatar: {width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: Colors.border},
  stats: {flex: 1, flexDirection: 'row', justifyContent: 'space-around'},
  statVal: {fontSize: 20, fontWeight: '800', color: Colors.text},
  statLabel: {fontSize: 11, color: Colors.muted, marginTop: 2},
  displayName: {fontSize: 17, fontWeight: '800', color: Colors.text, marginTop: 14},
  bio: {fontSize: 14, color: 'rgba(240,230,255,0.8)', marginTop: 6, lineHeight: 20},
  btns: {flexDirection: 'row', gap: 10, marginTop: 14},
  btn: {flex: 1, height: 36, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)'},
  btnText: {fontSize: 13, fontWeight: '700', color: Colors.text},
});

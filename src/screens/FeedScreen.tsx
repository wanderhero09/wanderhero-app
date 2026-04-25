import React, {useEffect, useState, useCallback} from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Image, TextInput, Alert, RefreshControl, Dimensions, StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, BASE_URL} from '../theme';
import {useStore} from '../store';
import {getFeed, likePost, addComment, deletePost, getDialogs} from '../api';

const {width: SW} = Dimensions.get('window');

function formatTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'щойно';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} хв тому`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} год тому`;
  return new Date(ts).toLocaleDateString('uk');
}

function PostCard({post, currentUser, onRefresh, navigation}: any) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUser));
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    await likePost(post.id, currentUser);
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    setComments([...comments, {username: currentUser, text: comment}]);
    setComment('');
    await addComment(post.id, currentUser, comment);
  };

  const handleDelete = () => {
    Alert.alert('Видалити пост?', '', [
      {text: 'Скасувати', style: 'cancel'},
      {text: 'Видалити', style: 'destructive', onPress: async () => {
        await deletePost(post.id);
        onRefresh();
      }},
    ]);
  };

  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', {username: post.owner})}>
          <Image
            source={{uri: `${BASE_URL}/uploads/avatars/${post.owner}.jpg`}}
            style={s.avatar}
            defaultSource={require('../../assets/default-avatar.png')}
          />
        </TouchableOpacity>
        <View style={{flex: 1, marginLeft: 10}}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile', {username: post.owner})}>
            <Text style={s.username}>{post.owner}</Text>
          </TouchableOpacity>
          <Text style={s.time}>{formatTime(post.time)}</Text>
        </View>
        {post.owner === currentUser && (
          <TouchableOpacity onPress={handleDelete} style={{padding: 8}}>
            <Text style={{color: Colors.muted, fontSize: 18}}>···</Text>
          </TouchableOpacity>
        )}
      </View>

      {post.type === 'photo' && (
        <Image source={{uri: `${BASE_URL}${post.url}`}} style={s.postImg} resizeMode="cover" />
      )}
      {post.type === 'music' && (
        <View style={s.musicCard}>
          <Text style={{fontSize: 36}}>🎵</Text>
          <Text style={s.musicName} numberOfLines={1}>{post.name || 'Аудіо'}</Text>
        </View>
      )}

      {post.caption ? <Text style={s.caption}>{post.caption}</Text> : null}

      <View style={s.actions}>
        <TouchableOpacity style={s.actBtn} onPress={handleLike}>
          <Text style={{fontSize: 22}}>{liked ? '💖' : '🤍'}</Text>
          <Text style={s.actCount}>{likesCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.actBtn}>
          <Text style={{fontSize: 22}}>💬</Text>
          <Text style={s.actCount}>{comments.length}</Text>
        </TouchableOpacity>
      </View>

      {comments.slice(-2).map((c: any, i: number) => (
        <Text key={i} style={s.commentRow}>
          <Text style={{fontWeight: '700'}}>{c.username} </Text>{c.text}
        </Text>
      ))}

      <View style={s.commentInput}>
        <TextInput
          style={s.commentField}
          placeholder="Коментар..."
          placeholderTextColor={Colors.muted}
          value={comment}
          onChangeText={setComment}
          onSubmitEditing={handleComment}
          returnKeyType="send"
        />
        <TouchableOpacity onPress={handleComment}>
          <Text style={{color: Colors.pink, fontSize: 18}}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FeedScreen({navigation}: any) {
  const {user, setUnread} = useStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getFeed();
      setPosts(Array.isArray(data) ? data : []);
    } catch {}
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(async () => {
      if (!user) return;
      try {
        const d = await getDialogs(user.username);
        setUnread(d.filter((x: any) => !x.read && x.from !== user.username).length);
      } catch {}
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
      <View style={s.header}>
        <Text style={s.logo}>WanderHero</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Dialogs')}>
          <Text style={{fontSize: 24}}>💬</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={posts}
        keyExtractor={i => i.id}
        renderItem={({item}) => (
          <PostCard post={item} currentUser={user?.username} onRefresh={load} navigation={navigation} />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); load();}} tintColor={Colors.pink} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={{fontSize: 48, opacity: 0.3}}>🌌</Text>
            <Text style={{color: Colors.muted, marginTop: 12}}>Лента порожня</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.dark},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border},
  logo: {fontSize: 22, fontWeight: '900', color: Colors.pink},
  card: {backgroundColor: 'rgba(10,10,25,0.95)', borderWidth: 1, borderColor: Colors.border, borderRadius: 20, marginHorizontal: 12, marginBottom: 14, overflow: 'hidden'},
  cardHeader: {flexDirection: 'row', alignItems: 'center', padding: 12},
  avatar: {width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: Colors.border},
  username: {fontSize: 15, fontWeight: '700', color: Colors.text},
  time: {fontSize: 11, color: Colors.muted, marginTop: 2},
  postImg: {width: '100%', height: SW * 0.75},
  musicCard: {flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: 'rgba(255,45,107,0.06)'},
  musicName: {flex: 1, fontSize: 14, fontWeight: '700', color: Colors.text},
  caption: {paddingHorizontal: 14, paddingVertical: 8, fontSize: 14, color: Colors.text},
  actions: {flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 6, gap: 4},
  actBtn: {flexDirection: 'row', alignItems: 'center', gap: 6, padding: 6},
  actCount: {fontSize: 13, fontWeight: '700', color: Colors.muted},
  commentRow: {paddingHorizontal: 14, paddingBottom: 4, fontSize: 13, color: Colors.text},
  commentInput: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)'},
  commentField: {flex: 1, backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: Colors.text, fontSize: 14},
  empty: {alignItems: 'center', paddingVertical: 80},
});

import React, {useState} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import {Colors} from '../theme';
import {useStore} from '../store';
import {login, register} from '../api';

export default function AuthScreen() {
  const {setUser} = useStore();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Помилка', 'Заповни всі поля');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (tab === 'login') {
        res = await login(username.trim(), password);
      } else {
        res = await register(username.trim(), password, email.trim());
        if (!res.error) res = await login(username.trim(), password);
      }
      if (res.error) Alert.alert('Помилка', res.error);
      else setUser({username: res.username});
    } catch {
      Alert.alert('Помилка', 'Немає зв\'язку з сервером');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{flex: 1}}>
      <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <Text style={s.logo}>WanderHero</Text>
          <Text style={s.logoJp}>ワンダーヒーロー</Text>
        </View>

        <View style={s.card}>
          <View style={s.tabs}>
            {(['login', 'register'] as const).map(t => (
              <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabActive]} onPress={() => setTab(t)}>
                <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                  {t === 'login' ? 'ВХІД' : 'РЕЄСТРАЦІЯ'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.form}>
            <View style={s.field}>
              <Text style={s.label}>НІКНЕЙМ</Text>
              <TextInput style={s.input} value={username} onChangeText={setUsername}
                placeholder="your_username" placeholderTextColor={Colors.muted}
                autoCapitalize="none" autoCorrect={false} />
            </View>

            {tab === 'register' && (
              <View style={s.field}>
                <Text style={s.label}>EMAIL</Text>
                <TextInput style={s.input} value={email} onChangeText={setEmail}
                  placeholder="email@example.com" placeholderTextColor={Colors.muted}
                  keyboardType="email-address" autoCapitalize="none" />
              </View>
            )}

            <View style={s.field}>
              <Text style={s.label}>ПАРОЛЬ</Text>
              <TextInput style={s.input} value={password} onChangeText={setPassword}
                placeholder="••••••••" placeholderTextColor={Colors.muted}
                secureTextEntry onSubmitEditing={handle} />
            </View>

            <TouchableOpacity style={[s.btn, loading && {opacity: 0.6}]} onPress={handle} disabled={loading}>
              <Text style={s.btnText}>{loading ? 'Завантаження...' : tab === 'login' ? 'УВІЙТИ' : 'ЗАРЕЄСТРУВАТИСЬ'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.version}>WanderHero v1.0 • wanderhero.pro</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.dark},
  content: {flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20},
  logoWrap: {alignItems: 'center', marginBottom: 30},
  logo: {fontSize: 36, fontWeight: '900', color: Colors.pink, letterSpacing: -1},
  logoJp: {fontSize: 11, color: Colors.muted, letterSpacing: 5, marginTop: 6},
  card: {width: '100%', maxWidth: 400, backgroundColor: 'rgba(10,10,25,0.95)', borderWidth: 1, borderColor: Colors.border, borderRadius: 24, overflow: 'hidden'},
  tabs: {flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.border},
  tabBtn: {flex: 1, paddingVertical: 16, alignItems: 'center'},
  tabActive: {borderBottomWidth: 2, borderBottomColor: Colors.pink},
  tabText: {fontSize: 12, fontWeight: '700', letterSpacing: 2, color: Colors.muted},
  tabTextActive: {color: Colors.pink},
  form: {padding: 24, gap: 14},
  field: {gap: 6},
  label: {fontSize: 10, fontWeight: '700', letterSpacing: 2, color: Colors.muted},
  input: {backgroundColor: Colors.inputBg, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: 12, paddingHorizontal: 14, height: 50, color: Colors.text, fontSize: 16},
  btn: {height: 50, borderRadius: 14, backgroundColor: Colors.pink, alignItems: 'center', justifyContent: 'center', marginTop: 6},
  btnText: {color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 1.5},
  version: {marginTop: 30, fontSize: 11, color: Colors.muted, opacity: 0.5},
});

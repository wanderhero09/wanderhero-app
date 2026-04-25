import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  username: string;
  avatar?: string;
  bio?: string;
  displayName?: string;
  premium?: boolean;
}

interface AppState {
  user: User | null;
  unreadCount: number;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  setUnread: (count: number) => void;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  unreadCount: 0,
  setUser: (user) => {
    set({user});
    if (user) AsyncStorage.setItem('username', user.username);
  },
  updateUser: (data) => {
    const current = get().user;
    if (current) set({user: {...current, ...data}});
  },
  setUnread: (count) => set({unreadCount: count}),
  logout: () => {
    AsyncStorage.removeItem('username');
    set({user: null, unreadCount: 0});
  },
  loadUser: async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) set({user: {username}});
    } catch {}
  },
}));

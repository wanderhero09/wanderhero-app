import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, View, StatusBar} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Colors} from './theme';
import {useStore} from './store';

// Screens
import AuthScreen from './screens/AuthScreen';
import FeedScreen from './screens/FeedScreen';
import DialogsScreen from './screens/DialogsScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import UploadScreen from './screens/UploadScreen';
import ExploreScreen from './screens/ExploreScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({emoji, label, focused, badge}: {emoji: string; label: string; focused: boolean; badge?: number}) {
  return (
    <View style={{alignItems: 'center', gap: 2}}>
      <Text style={{fontSize: 22}}>{emoji}</Text>
      <Text style={{fontSize: 9, fontWeight: '700', color: focused ? Colors.pink : Colors.muted}}>
        {label}
      </Text>
      {!!badge && (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: Colors.pink, borderRadius: 8,
          minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: Colors.dark,
        }}>
          <Text style={{color: '#fff', fontSize: 9, fontWeight: '700'}}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </View>
  );
}

function MainTabs() {
  const {unreadCount} = useStore();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(5,5,15,0.97)',
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon emoji="🏠" label="Лента" focused={focused} />}}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon emoji="🔍" label="Пошук" focused={focused} />}}
      />
      <Tab.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          tabBarIcon: () => (
            <View style={{
              width: 50, height: 50, borderRadius: 25,
              backgroundColor: Colors.pink,
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
              shadowColor: Colors.pink,
              shadowOffset: {width: 0, height: 4},
              shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
            }}>
              <Text style={{fontSize: 24, color: '#fff'}}>➕</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Dialogs"
        component={DialogsScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon emoji="💬" label="Чат" focused={focused} badge={unreadCount} />}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarIcon: ({focused}) => <TabIcon emoji="👤" label="Профіль" focused={focused} />}}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const {user, loadUser} = useStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.dark} />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: {backgroundColor: Colors.dark},
              animation: 'slide_from_right',
            }}>
            {!user ? (
              <Stack.Screen name="Auth" component={AuthScreen} />
            ) : (
              <>
                <Stack.Screen name="Main" component={MainTabs} />
                <Stack.Screen name="Chat" component={ChatScreen} />
                <Stack.Screen name="UserProfile" component={ProfileScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{animation: 'slide_from_bottom'}} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { User, onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth } from '../firebaseservices/firebase';
import { AuthScreen } from '../screens/AuthScreen';
import { colors } from '../theme/colors';

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  if (isLoadingAuth) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;
          if (route.name === 'index' || route.name === 'map') iconName = 'map';
          else if (route.name === 'list') iconName = 'list';
          else if (route.name === 'profile') iconName = 'user';
          else iconName = 'camera';
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabelStyle,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="list" options={{ title: 'List' }} />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarButton: (props) => (
            <TouchableOpacity
              style={styles.floatingButton}
              onPress={props.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.floatingInner}>
                <Feather name="camera" size={28} color="white" />
                <Text style={styles.floatingText}>Add</Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  tabBar: {
    height: 72,
    paddingBottom: 10,
    paddingTop: 6,
    backgroundColor: colors.card,
    borderTopColor: colors.border,
  },
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: '600',
  },
  floatingButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 8px 18px rgba(194, 65, 12, 0.28)',
  },
  floatingText: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});

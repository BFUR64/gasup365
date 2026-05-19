import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function RootLayout() {
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

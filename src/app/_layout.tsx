// src/app/_layout.tsx
import { Feather } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors'; // adjust path if needed

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Feather.glyphMap;
          if (route.name === 'map') iconName = 'map';
          else if (route.name === 'list') iconName = 'list';
          else if (route.name === 'profile') iconName = 'user';
          else iconName = 'camera';
          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 5 },
      })}
    >
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingText: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
});
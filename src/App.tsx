// App.tsx (fixed)
import { Feather } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CameraCaptureScreen } from './screens/CameraCaptureScreen';
import { MapViewScreen } from './screens/MapViewScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { StationListScreen } from './screens/StationListScreen';
import { colors } from './theme/colors';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
        <Tab.Navigator
            screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Feather.glyphMap;
                if (route.name === 'Map') iconName = 'map';
                else if (route.name === 'List') iconName = 'list';
                else if (route.name === 'Add') iconName = 'camera';
                else iconName = 'user';
                return <Feather name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.muted,
            headerShown: false,
            tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 5 },
            })}
        >
            <Tab.Screen name="Map" component={MapViewScreen} />
            <Tab.Screen name="List" component={StationListScreen} />
            <Tab.Screen
            name="Add"
            component={CameraCaptureScreen}
            options={{
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
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
        </NavigationContainer>
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
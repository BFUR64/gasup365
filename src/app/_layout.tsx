import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import {
  PixelifySans_500Medium,
  PixelifySans_600SemiBold,
  PixelifySans_700Bold,
} from "@expo-google-fonts/pixelify-sans";
import { Silkscreen_400Regular } from "@expo-google-fonts/silkscreen";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router";
import { User, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Hotbar } from "../components/Hotbar";
import { PixelScene } from "../components/PixelScene";
import { auth } from "../firebaseservices/firebase";
import { useIsWide } from "../hooks/useLayout";
import { AuthScreen } from "../screens/AuthScreen";
import { colors, palette } from "../theme/colors";
import { fonts } from "../theme/tokens";

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const wide = useIsWide();
  const [fontsLoaded, fontError] = useFonts({
    PixelifySans_500Medium,
    PixelifySans_600SemiBold,
    PixelifySans_700Bold,
    Silkscreen_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setIsLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  // A font failure falls back to system fonts rather than blocking the app.
  if (isLoadingAuth || (!fontsLoaded && !fontError)) {
    return <BootScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <Tabs
      tabBar={(props) => <Hotbar {...(props as any)} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? "left" : "bottom",
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Map" }} />
      <Tabs.Screen name="map" options={{ href: null }} />
      <Tabs.Screen name="list" options={{ title: "Stations" }} />
      <Tabs.Screen name="add" options={{ title: "Scan" }} />
      <Tabs.Screen name="profile" options={{ title: "Me" }} />
    </Tabs>
  );
}

// Session check: the Kalibo scene with the logo and a LOADING tag (DESIGN-002 §7.1).
const BootScreen: React.FC = () => (
  <View style={styles.boot}>
    <PixelScene />
    <View style={styles.bootContent} accessibilityLabel="Loading GasUp365">
      <Image
        source={require("../../assets/images/Gasup.png")}
        style={styles.bootLogo}
        accessibilityLabel="GasUp365"
      />
      <Text style={styles.bootTag}>LOADING…</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: palette.grass400 },
  bootContent: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "40%",
    alignItems: "center",
    gap: 12,
  },
  bootLogo: { width: 312, height: 75 },
  bootTag: {
    fontFamily: fonts.tag,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: colors.surfaceTint,
    backgroundColor: colors.outline,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});

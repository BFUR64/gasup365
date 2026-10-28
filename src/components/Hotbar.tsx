import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useIsWide } from "../hooks/useLayout";
import { colors, palette } from "../theme/colors";
import { pixel } from "../theme/pixel";
import { fonts, shadow } from "../theme/tokens";
import { IconName } from "../ui/icons";
import { PixelIcon } from "./ui/PixelIcon";

interface Slot {
  key: string;
  route: string;
  label: string;
  railLabel: string;
  icon: IconName;
  soon?: boolean;
}

interface HotbarProps {
  state: {
    routes: { name: string; key: string; params?: object }[];
    index: number;
  };
  descriptors: any;
  emitter: { emit: (event: any) => { defaultPrevented?: boolean } };
  navigateToTab: (routeKey: string) => void;
  insets: { top: number; right: number; bottom: number; left: number };
}

// Five slots, raised Scan in the middle (DESIGN-002 §4.2). Rewards is a
// "SOON" preview that opens Me until FEAT-003 builds the Rewards screen.
const LEFT: Slot[] = [
  { key: "map", route: "index", label: "Map", railLabel: "Map", icon: "map" },
  {
    key: "stations",
    route: "list",
    label: "Stations",
    railLabel: "Stns",
    icon: "stations",
  },
];
const RIGHT: Slot[] = [
  {
    key: "rewards",
    route: "profile",
    label: "Rewards",
    railLabel: "Rwds",
    icon: "rewards",
    soon: true,
  },
  { key: "me", route: "profile", label: "Me", railLabel: "Me", icon: "me" },
];
const SCAN_ROUTE = "add";

export const Hotbar: React.FC<HotbarProps> = ({
  state,
  emitter,
  navigateToTab,
  insets,
}) => {
  const wide = useIsWide();
  const activeRoute = state.routes[state.index]?.name;

  const go = (routeName: string) => {
    const route = state.routes.find(
      (candidate) => candidate.name === routeName,
    );
    if (!route) return;

    const event = emitter.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (activeRoute !== routeName && !event.defaultPrevented) {
      navigateToTab(route.key);
    }
  };

  const renderSlot = (slot: Slot) => {
    const active = activeRoute === slot.route && !slot.soon;
    return (
      <Pressable
        key={slot.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        accessibilityLabel={
          slot.soon ? `${slot.label}, coming soon` : slot.label
        }
        onPress={() => go(slot.route)}
        style={({ pressed }) => [
          styles.slot,
          wide && styles.railSlot,
          active ? styles.slotOn : styles.slotOff,
          pressed && pixel.pressed,
        ]}
      >
        <PixelIcon
          name={slot.icon}
          size={24}
          color={active ? colors.onAction : colors.surfaceTint}
        />
        <Text
          style={[
            styles.label,
            { color: active ? colors.onAction : colors.surfaceTint },
          ]}
        >
          {wide ? slot.railLabel : slot.label}
        </Text>
        {slot.soon ? (
          <View style={styles.soon}>
            <Text style={styles.soonText}>SOON</Text>
          </View>
        ) : null}
        {active && !wide ? (
          <View style={styles.arrow}>
            <PixelArrow />
          </View>
        ) : null}
      </Pressable>
    );
  };

  const scanActive = activeRoute === SCAN_ROUTE;
  const scan = (
    <Pressable
      key="scan"
      accessibilityRole="tab"
      accessibilityState={{ selected: scanActive }}
      accessibilityLabel="Scan a price board"
      onPress={() => go(SCAN_ROUTE)}
      style={({ pressed }) => [
        styles.scan,
        wide ? styles.railScan : styles.scanRaised,
        scanActive && styles.scanActive,
        pressed && styles.scanPressed,
      ]}
    >
      <PixelIcon name="camera" size={wide ? 28 : 32} color={colors.onAction} />
      <Text style={[styles.label, styles.scanLabel]}>SCAN</Text>
    </Pressable>
  );

  if (wide) {
    return (
      <View
        accessibilityRole="tablist"
        accessibilityLabel="Main"
        style={[styles.rail, { paddingTop: insets.top + 16 }]}
      >
        <Image
          source={require("../../assets/images/Gasup.png")}
          style={styles.railLogo}
          accessibilityLabel="GasUp365"
        />
        {LEFT.map(renderSlot)}
        {scan}
        {RIGHT.map(renderSlot)}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Main"
      style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      {LEFT.map(renderSlot)}
      {scan}
      {RIGHT.map(renderSlot)}
    </View>
  );
};

const PixelArrow: React.FC = () => (
  <View style={styles.arrowShape}>
    <View style={[styles.arrowRow, { width: 12 }]} />
    <View style={[styles.arrowRow, { width: 8 }]} />
    <View style={[styles.arrowRow, { width: 4 }]} />
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.outline,
    borderTopWidth: 4,
    borderTopColor: colors.shade,
    boxShadow: shadow.up,
    overflow: "visible",
  },
  rail: {
    width: 88,
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 6,
    backgroundColor: colors.outline,
    borderRightWidth: 4,
    borderRightColor: colors.shade,
  },
  railLogo: { width: 76, height: 18, marginVertical: 8 },
  slot: {
    width: 72,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 2,
  },
  railSlot: { height: 64 },
  slotOn: {
    backgroundColor: colors.action,
    borderColor: colors.highlight,
    boxShadow: "inset 0px 0px 0px 2px #3B1A08",
  },
  slotOff: {
    backgroundColor: palette.brown800,
    borderColor: palette.brown950,
    boxShadow: "inset 2px 2px 0px #2A1105",
  },
  label: {
    fontFamily: fonts.tag,
    fontSize: 12,
    lineHeight: 14,
    textTransform: "uppercase",
  },
  soon: {
    position: "absolute",
    top: -10,
    right: -6,
    paddingHorizontal: 3,
    backgroundColor: colors.highlight,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  soonText: {
    fontFamily: fonts.tag,
    fontSize: 12,
    lineHeight: 14,
    color: colors.outline,
  },
  arrow: { position: "absolute", top: -14, alignSelf: "center" },
  arrowShape: { alignItems: "center" },
  arrowRow: { height: 2, backgroundColor: colors.highlight },
  scan: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: colors.action,
    borderWidth: 2,
    borderColor: colors.surfaceTint,
    boxShadow:
      "inset 2px 2px 0px #FFB066, inset -2px -2px 0px #C2410C, 0px 0px 0px 2px #3B1A08, 0px 6px 0px #1B0B03",
  },
  scanRaised: { width: 82, height: 76, top: -16 },
  railScan: { width: 72, height: 76 },
  scanActive: {
    boxShadow:
      "inset 2px 2px 0px #FFB066, inset -2px -2px 0px #C2410C, 0px 0px 0px 2px #3B1A08, 0px 0px 0px 6px #FFD54A",
  },
  scanPressed: { transform: [{ translateY: 4 }] },
  scanLabel: { color: colors.onAction, letterSpacing: 0.5 },
});

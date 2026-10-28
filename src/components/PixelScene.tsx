import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useReducedMotion } from '../hooks/useLayout';
import { palette } from '../theme/colors';
import { art } from '../ui/pixelArt';
import { Sprite } from './ui/PixelIcon';

// A slow horizontal loop; Reduce Motion leaves the sprite where it starts.
const useDrift = (from: number, to: number, duration: number, delay = 0) => {
  const reduced = useReducedMotion();
  const value = useRef(new Animated.Value(from)).current;

  useEffect(() => {
    if (reduced) return;
    value.setValue(from + ((to - from) * delay) / duration);
    const loop = Animated.loop(
      Animated.timing(value, { toValue: to, duration, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [delay, duration, from, reduced, to, value]);

  return value;
};

const TOWN = [
  { sprite: art.palm, left: 10, top: 216, w: 36, h: 45 },
  { sprite: art.nipaHut, left: 52, top: 240, w: 48, h: 36 },
  { sprite: art.church, left: 150, top: 212, w: 64, h: 64 },
  { sprite: art.nipaHut, left: 236, top: 240, w: 48, h: 36 },
  { sprite: art.palm, left: 300, top: 216, w: 36, h: 45 },
  { sprite: art.palm, left: 344, top: 228, w: 36, h: 45 },
];

// Parallax Kalibo backdrop for Auth and Boot (DESIGN-002 §5.1, §7.1, §7.2).
export const PixelScene: React.FC = () => {
  const { width } = useWindowDimensions();
  const cloudA = useDrift(-80, width + 80, 48000);
  const cloudB = useDrift(-80, width + 80, 64000, 30000);
  const jeepney = useDrift(-140, width + 30, 9000);
  const hillCount = Math.ceil(width / 390);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.band, { top: 0, height: 90, backgroundColor: palette.sky400 }]} />
      <View style={[styles.band, { top: 90, height: 120, backgroundColor: palette.sky300 }]} />
      <View style={[styles.band, { top: 210, height: 30, backgroundColor: palette.sky200 }]} />
      <Animated.View style={[styles.abs, { top: 58, transform: [{ translateX: cloudA }] }]}>
        <Sprite art={art.cloud} width={64} height={24} />
      </Animated.View>
      <Animated.View style={[styles.abs, { top: 150, transform: [{ translateX: cloudB }] }]}>
        <Sprite art={art.cloud} width={48} height={18} />
      </Animated.View>
      <View style={[styles.band, { top: 232, height: 12, backgroundColor: palette.sky600 }]} />
      <View style={[styles.abs, styles.hills, { top: 196 }]}>
        {Array.from({ length: hillCount }, (_, index) => (
          <Sprite key={index} art={art.hills} width={390} height={72} />
        ))}
      </View>
      <View style={[styles.band, { top: 268, height: 40, backgroundColor: palette.grass400, borderTopWidth: 4, borderTopColor: palette.grass700 }]} />
      {TOWN.map((item, index) => (
        <View key={index} style={[styles.abs, { left: (item.left / 390) * width, top: item.top }]}>
          <Sprite art={item.sprite} width={item.w} height={item.h} />
        </View>
      ))}
      <View style={[styles.band, styles.road, { top: 284 }]} />
      <View style={[styles.abs, styles.laneRow, { top: 306 }]}>
        {Array.from({ length: Math.ceil(width / 32) }, (_, index) => (
          <View key={index} style={styles.lane} />
        ))}
      </View>
      <Animated.View style={[styles.abs, { top: 280, transform: [{ translateX: jeepney }] }]}>
        <Sprite art={art.jeepney} width={96} height={45} />
      </Animated.View>
      <View style={[styles.band, { top: 336, bottom: 0, backgroundColor: palette.grass400 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  band: { position: 'absolute', left: 0, right: 0 },
  hills: { left: 0, flexDirection: 'row' },
  road: {
    height: 48,
    backgroundColor: palette.road,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: palette.tan500,
  },
  laneRow: { left: 0, right: 0, flexDirection: 'row', gap: 16 },
  lane: { width: 16, height: 4, backgroundColor: palette.yellow400 },
});

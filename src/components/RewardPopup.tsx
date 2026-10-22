import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { useReducedMotion } from '../hooks/useLayout';
import { colors, palette } from '../theme/colors';
import { pixel } from '../theme/pixel';
import { type } from '../theme/tokens';
import { coinArt } from '../ui/pixelArt';
import { PixelButton } from './ui/PixelButton';
import { PixelIcon, Sprite } from './ui/PixelIcon';

interface RewardPopupProps {
  reward: { coins: number; breakdown: string } | null;
  onDone: () => void;
}

// "Price shared!" coin pop (DESIGN-002 §6.16, coins-only variant).
export const RewardPopup: React.FC<RewardPopupProps> = ({ reward, onDone }) => {
  const reduced = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!reward || reduced) return;
    scale.setValue(0.8);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.05, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 70, useNativeDriver: true }),
    ]).start();
  }, [reduced, reward, scale]);

  return (
    <Modal visible={Boolean(reward)} transparent animationType="fade" onRequestClose={onDone}>
      <View style={styles.scrim}>
        <Animated.View
          accessibilityViewIsModal
          accessibilityLabel={`Price shared! Plus ${reward?.coins ?? 0} coins`}
          style={[pixel.panel, styles.panel, { transform: [{ scale }] }]}
        >
          <View style={styles.burst}>
            <PixelIcon name="sparkle" size={24} style={styles.sparkleA} />
            <PixelIcon name="sparkle" size={16} color={palette.white} style={styles.sparkleB} />
            <Sprite art={coinArt(palette.white)} width={36} height={36} style={styles.coinA} />
            <Sprite art={coinArt(palette.white)} width={28} height={28} style={styles.coinB} />
            <View style={styles.amount}>
              <Sprite art={coinArt(palette.yellow100)} width={48} height={48} />
              <Text style={[type.priceHero, { color: colors.outline }]}>+{reward?.coins ?? 0}</Text>
            </View>
          </View>
          <View style={styles.body}>
            <Text accessibilityRole="header" style={[type.displayLg, styles.center]}>
              Price shared!
            </Text>
            <Text style={[type.bodyMd, styles.muted]}>Drivers near Kalibo can see it now.</Text>
            <Text style={[type.caption, styles.muted]}>{reward?.breakdown}</Text>
            <PixelButton label="Nice!" onPress={onDone} style={styles.button} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center', padding: 24 },
  panel: { width: '100%', maxWidth: 360 },
  burst: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.highlight,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
    boxShadow: 'inset 0px -4px 0px #C79A00',
  },
  sparkleA: { position: 'absolute', left: 36, top: 22 },
  sparkleB: { position: 'absolute', right: 44, top: 70 },
  coinA: { position: 'absolute', left: 70, top: 64 },
  coinB: { position: 'absolute', right: 64, top: 18 },
  amount: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { padding: 16, gap: 6, alignItems: 'center' },
  center: { color: colors.text, textAlign: 'center' },
  muted: { color: colors.textMuted, textAlign: 'center' },
  button: { alignSelf: 'stretch', marginTop: 8 },
});

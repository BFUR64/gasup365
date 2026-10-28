import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { buildGoogleMapsDirectionsUrl } from '../services/fuelRouting';
import { formatBreakdown, formatNetShort, formatPeso, isWorthTheTrip } from '../services/stationPresentation';
import { colors } from '../theme/colors';
import { medalColors, pixel } from '../theme/pixel';
import { fonts, type } from '../theme/tokens';
import { FuelType, StationRouteScore } from '../types';
import { PixelButton } from './ui/PixelButton';
import { PixelIcon } from './ui/PixelIcon';
import { Tag } from './ui/Tag';
import { PriceSlots } from './StationSheet';

interface StationRowProps {
  score: StationRouteScore;
  rank: number;
  fuel: FuelType;
  medals: boolean;
  open: boolean;
  onPress: () => void;
  // "expand" reveals prices + Navigate inline (Stations tab); "select" just highlights (web list panel).
  mode: 'expand' | 'select';
  onShowOnMap?: () => void;
}

// Leaderboard row (DESIGN-002 §6.10).
export const StationRow: React.FC<StationRowProps> = ({ score, rank, fuel, medals, open, onPress, mode, onShowOnMap }) => {
  const isTop = medals && rank === 1;
  const worth = isWorthTheTrip(score.pesosSaved);

  return (
    <View
      style={[
        pixel.panel,
        isTop && styles.topRow,
        mode === 'select' && open && styles.selected,
      ]}
    >
      {isTop ? <Tag label={worth ? 'Best net save' : 'Best value'} tone="highlight" style={styles.ribbon} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={mode === 'expand' ? { expanded: open } : { selected: open }}
        accessibilityLabel={`Rank ${rank}, ${score.station.name}, ${formatPeso(score.fuelPrice)}, ${formatNetShort(score.pesosSaved)}`}
        onPress={onPress}
        style={[styles.main, mode === 'select' && styles.mainCompact]}
      >
        <View style={[styles.rank, { backgroundColor: medals && rank <= 3 ? medalColors[rank - 1] : colors.surfaceSunken }]}>
          <Text style={styles.rankText}>{rank}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[type.displaySm, { color: colors.text }]}>{score.station.name}</Text>
          {mode === 'expand' ? (
            <Text numberOfLines={1} style={[type.bodyMd, { color: colors.textMuted }]}>
              {score.station.address}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <Text style={[type.caption, { color: colors.textMuted }]}>{score.distanceKm} km</Text>
            <Tag label="Sample" />
          </View>
        </View>
        <View style={styles.priceCol}>
          <Text style={[type.priceLg, { color: colors.text }]}>{formatPeso(score.fuelPrice)}</Text>
          <Text style={[type.captionStrong, { color: worth ? colors.success : colors.danger }]}>{formatNetShort(score.pesosSaved)}</Text>
          {mode === 'expand' ? (
            <PixelIcon name="chevronDown" size={16} style={open ? styles.chevronOpen : undefined} />
          ) : null}
        </View>
      </Pressable>
      {mode === 'expand' && open ? (
        <View style={styles.expanded}>
          <PriceSlots prices={score.station.prices} fuel={fuel} size="md" />
          <Text style={[type.caption, { color: colors.textMuted }]}>
            {formatBreakdown(score)} · {score.liters} L fill, 12 km/L
          </Text>
          <View style={styles.actions}>
            <PixelButton
              label="Navigate"
              icon="navigate"
              size="sm"
              accessibilityLabel={`Navigate to ${score.station.name} with Google Maps`}
              onPress={() => Linking.openURL(buildGoogleMapsDirectionsUrl(score.station))}
            />
            {onShowOnMap ? <PixelButton label="Show on map" variant="ghost" size="sm" onPress={onShowOnMap} /> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  topRow: { backgroundColor: colors.surfaceTint },
  selected: { backgroundColor: colors.surfaceTint, borderColor: colors.action, boxShadow: 'inset 0px 0px 0px 2px #F97316' },
  ribbon: { position: 'absolute', top: -10, right: 10, zIndex: 1 },
  main: { minHeight: 96, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 12 },
  mainCompact: { minHeight: 84, paddingVertical: 10 },
  rank: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.outline,
    boxShadow: 'inset -2px -2px 0px rgba(59, 26, 8, 0.25)',
  },
  rankText: { fontFamily: fonts.display700, fontSize: 18, lineHeight: 22, color: colors.outline },
  info: { flex: 1, minWidth: 0, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priceCol: { alignItems: 'flex-end', gap: 2 },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  expanded: {
    gap: 10,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 2,
    borderTopColor: colors.divider,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

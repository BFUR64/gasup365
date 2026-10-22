import React, { useState } from 'react';
import { Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buildDirectionsUrl } from '../services/fuelRouting';
import {
  SMART_ROUTE_EXPLAINER,
  formatBreakdown,
  formatNetHeadline,
  formatPeekLine,
  formatPeso,
  isWorthTheTrip,
  netVerdict,
} from '../services/stationPresentation';
import { StationView } from '../services/stationView';
import { colors, palette } from '../theme/colors';
import { FUEL_TYPES, fuelMeta, pixel } from '../theme/pixel';
import { shadow, type } from '../theme/tokens';
import { FuelType } from '../types';
import { PixelButton } from './ui/PixelButton';
import { PixelIcon } from './ui/PixelIcon';
import { Tag } from './ui/Tag';

const openDirections = (station: StationView) => Linking.openURL(buildDirectionsUrl(station.coordinates));

const SourceTag: React.FC<{ station: StationView }> = ({ station }) =>
  station.source === 'sample' ? <Tag label="Sample" /> : <Tag label="Community" tone="community" />;

export const PriceSlots: React.FC<{ prices: StationView['prices']; fuel: FuelType; size?: 'md' | 'lg' }> = ({ prices, fuel, size = 'lg' }) => (
  <View accessibilityLabel="Prices per litre" style={styles.slots}>
    {FUEL_TYPES.map((key) => {
      const meta = fuelMeta[key];
      const on = key === fuel;
      const price = prices[key];
      const textColor = on ? meta.onFill : colors.text;
      return (
        <View
          key={key}
          accessibilityLabel={`${meta.label} ${price ? formatPeso(price) : 'no price yet'}`}
          style={[styles.slot, on ? { backgroundColor: meta.fill, boxShadow: shadow.selectedFuel } : pixel.slot]}
        >
          <View style={styles.slotLabel}>
            <PixelIcon name={key} size={16} color={on ? meta.onFill : meta.dark} />
            <Text style={[type.captionStrong, { color: textColor }]}>{meta.label}</Text>
          </View>
          <Text style={[size === 'lg' ? styles.slotPrice : styles.slotPriceMd, { color: price ? textColor : colors.textMuted }]}>
            {price ? formatPeso(price) : '—'}
          </Text>
        </View>
      );
    })}
  </View>
);

const SmartRouteBox: React.FC<{ station: StationView; fuel: FuelType; alwaysExplain?: boolean }> = ({ station, fuel, alwaysExplain }) => {
  const [tipOpen, setTipOpen] = useState(false);
  const score = station.score;
  if (!score) return null;
  const positive = isWorthTheTrip(score.pesosSaved);

  return (
    <View style={styles.routeBox}>
      <View style={styles.routeHeader}>
        <Text style={[type.tag, { color: colors.outline }]}>Smart route · {fuelMeta[fuel].label}</Text>
        {alwaysExplain ? null : (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: tipOpen }}
            onPress={() => setTipOpen(!tipOpen)}
            style={styles.tipButton}
          >
            <PixelIcon name="info" size={16} color={colors.actionStrong} />
            <Text style={[type.bodyStrong, styles.link]}>How is this calculated?</Text>
          </Pressable>
        )}
      </View>
      <Text style={[type.displayMd, { color: positive ? colors.success : colors.danger }]}>{formatNetHeadline(score.pesosSaved)}</Text>
      <Text style={[type.bodyStrong, { color: colors.text }]}>{netVerdict(score)}</Text>
      <Text style={[type.caption, { color: colors.textMuted }]}>
        {formatBreakdown(score)} ({(score.distanceKm * 2).toFixed(1)} km round trip)
      </Text>
      {tipOpen || alwaysExplain ? <Text style={[type.bodyMd, styles.tip]}>{SMART_ROUTE_EXPLAINER}</Text> : null}
    </View>
  );
};

const PhotoFrame: React.FC<{ station: StationView }> = ({ station }) => {
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!station.photoUrl || failed) {
    return (
      <View style={[pixel.slot, styles.noPhoto]}>
        <PixelIcon name="photo" size={32} color={colors.border} />
        <Text style={[type.bodyStrong, { color: colors.textMuted }]}>
          {failed ? "Photo didn't load" : station.source === 'sample' ? 'No photo · sample station' : 'No photo · typed by hand'}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Pressable accessibilityRole="imagebutton" accessibilityLabel="Open price board photo full screen" onPress={() => setOpen(true)} style={[pixel.slot, styles.photo]}>
        <Image source={{ uri: station.photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" onError={() => setFailed(true)} />
        <View style={styles.photoTag}>
          <Text style={[type.tag, { color: colors.text }]}>Photo · tap to zoom</Text>
        </View>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.photoModal}>
          <Image source={{ uri: station.photoUrl }} style={styles.photoFull} resizeMode="contain" accessibilityLabel="Price board photo" />
          <Pressable accessibilityRole="button" accessibilityLabel="Close photo" onPress={() => setOpen(false)} style={[pixel.panel, styles.photoClose]}>
            <PixelIcon name="close" size={20} />
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

// Everything needed to decide "go here or not" (DESIGN-002 §6.11 Expanded).
export const StationDetails: React.FC<{ station: StationView; fuel: FuelType; alwaysExplain?: boolean }> = ({ station, fuel, alwaysExplain }) => (
  <View style={styles.details}>
    <View>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={[type.displayMd, { color: colors.text }]}>
          {station.name}
        </Text>
        <SourceTag station={station} />
      </View>
      <Text style={[type.bodyMd, { color: colors.textMuted }]}>
        {[station.address, station.score ? `${station.score.distanceKm} km` : null].filter(Boolean).join(' · ')}
      </Text>
    </View>
    {station.score?.isBestRoute ? <Tag label={`Smart route pick · ${fuelMeta[fuel].label}`} tone="highlight" /> : null}
    <PriceSlots prices={station.prices} fuel={fuel} />
    <SmartRouteBox station={station} fuel={fuel} alwaysExplain={alwaysExplain} />
    <PhotoFrame station={station} />
  </View>
);

export const NavigateButton: React.FC<{ station: StationView }> = ({ station }) => (
  <PixelButton
    label="Navigate with Google Maps"
    icon="navigate"
    iconPosition="left"
    accessibilityLabel={`Navigate to ${station.name} with Google Maps`}
    onPress={() => openDirections(station)}
  />
);

const peekLine = (station: StationView, fuel: FuelType) => {
  if (station.score) return formatPeekLine(station.score);
  return station.prices[fuel] ? 'Shared by the community' : `No ${fuelMeta[fuel].label.toLowerCase()} price yet`;
};

interface SheetProps {
  station: StationView;
  fuel: FuelType;
  expanded: boolean;
  onExpand: () => void;
  onClose: () => void;
  onPeekHeight?: (height: number) => void;
}

// Tap-to-expand station sheet: Peek above the hotbar, or Expanded (§7.4).
export const StationSheet: React.FC<SheetProps> = ({ station, fuel, expanded, onExpand, onClose, onPeekHeight }) => {
  const insets = useSafeAreaInsets();
  const price = station.prices[fuel];
  const netColor = station.score
    ? isWorthTheTrip(station.score.pesosSaved)
      ? colors.success
      : colors.danger
    : colors.textMuted;

  const closeButton = (
    <Pressable accessibilityRole="button" accessibilityLabel="Close station details" onPress={onClose} style={styles.close}>
      <PixelIcon name="close" size={20} />
    </Pressable>
  );

  if (expanded) {
    return (
      <View accessibilityLabel={`Station details: ${station.name}`} style={[styles.expanded, { top: insets.top + 80 }]}>
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>
        {closeButton}
        <ScrollView contentContainerStyle={styles.expandedContent}>
          <StationDetails station={station} fuel={fuel} />
        </ScrollView>
        <View style={styles.footer}>
          <NavigateButton station={station} />
        </View>
      </View>
    );
  }

  return (
    <View
      accessibilityLabel="Station details"
      onLayout={(event) => onPeekHeight?.(event.nativeEvent.layout.height)}
      style={[pixel.panel, styles.peek]}
    >
      <View style={styles.handleRow}>
        <View style={styles.handle} />
      </View>
      {closeButton}
      <View style={styles.peekRow}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Expand details for ${station.name}`} onPress={onExpand} style={styles.peekText}>
          <View style={styles.peekTitle}>
            <Text numberOfLines={1} style={[type.displaySm, styles.shrink, { color: colors.text }]}>
              {station.name}
            </Text>
            <SourceTag station={station} />
          </View>
          <Text style={[type.priceLg, { color: price ? colors.text : colors.textMuted }]}>
            {price ? formatPeso(price) : '—'}
            <Text style={[type.caption, { color: colors.textMuted }]}> / L {fuelMeta[fuel].label}</Text>
          </Text>
          <Text style={[type.bodyStrong, { color: netColor }]}>{peekLine(station, fuel)}</Text>
        </Pressable>
        <PixelButton
          label="Go"
          icon="navigate"
          size="sm"
          accessibilityLabel={`Navigate to ${station.name} with Google Maps`}
          onPress={() => openDirections(station)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slots: { flexDirection: 'row', gap: 8 },
  slot: { flex: 1, padding: 8, gap: 2, borderWidth: 2, borderColor: colors.outline },
  slotLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slotPrice: { ...type.displayMd, fontFamily: type.priceLg.fontFamily, fontSize: 24 },
  slotPriceMd: { ...type.displaySm, fontFamily: type.priceLg.fontFamily },
  routeBox: { borderWidth: 2, borderColor: colors.outline, paddingHorizontal: 12, paddingVertical: 10, gap: 4 },
  routeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' },
  tipButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, marginVertical: -8 },
  link: { color: colors.actionStrong, textDecorationLine: 'underline' },
  tip: {
    marginTop: 6,
    padding: 10,
    backgroundColor: palette.night900,
    color: palette.white,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  noPhoto: { height: 120, alignItems: 'center', justifyContent: 'center', gap: 6, borderStyle: 'dashed', borderColor: colors.border },
  photo: { height: 168, overflow: 'hidden', backgroundColor: palette.viewfinder },
  photoTag: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: colors.outline,
  },
  photoModal: { flex: 1, backgroundColor: 'rgba(27, 31, 59, 0.92)', alignItems: 'center', justifyContent: 'center' },
  photoFull: { width: '100%', height: '80%' },
  photoClose: { position: 'absolute', top: 48, right: 16, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  details: { gap: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingRight: 40 },
  expanded: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.outline,
    boxShadow: shadow.up,
  },
  expandedContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  footer: { padding: 12, paddingHorizontal: 16, borderTopWidth: 2, borderTopColor: colors.outline, backgroundColor: colors.bg },
  peek: { position: 'absolute', left: 8, right: 8, bottom: 8, zIndex: 3, boxShadow: `${shadow.up}, inset -2px -2px 0px #EADBCB` },
  handleRow: { alignItems: 'center', paddingTop: 6 },
  handle: { width: 40, height: 6, backgroundColor: colors.border },
  close: { position: 'absolute', top: 0, right: 0, width: 48, height: 48, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  peekRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 14 },
  peekText: { flex: 1, minWidth: 0, gap: 2 },
  peekTitle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingRight: 32 },
  shrink: { flexShrink: 1 },
});

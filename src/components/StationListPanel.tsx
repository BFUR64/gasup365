import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { stations } from '../data/mockStations';
import { scoreStationsForRoute } from '../services/fuelRouting';
import { StationSort, rankStations } from '../services/stationPresentation';
import { colors } from '../theme/colors';
import { pixel } from '../theme/pixel';
import { type } from '../theme/tokens';
import { FuelType } from '../types';
import { PixelButton } from './ui/PixelButton';
import { PixelIcon } from './ui/PixelIcon';
import { FuelHotbar, SortToggle } from './ui/FuelHotbar';
import { SearchField } from './ui/PixelInput';
import { StationRow } from './StationRow';

interface StationListPanelProps {
  fuel: FuelType;
  onFuelChange: (fuel: FuelType) => void;
  sort: StationSort;
  onSortChange: (sort: StationSort) => void;
  openId: number | null;
  onRowPress: (stationId: number) => void;
  mode: 'expand' | 'select';
  onShowOnMap?: (stationId: number) => void;
}

// Search, fuel, sort and the leaderboard: the Stations tab body and the
// left pane of the web two-pane layout.
export const StationListPanel: React.FC<StationListPanelProps> = ({
  fuel,
  onFuelChange,
  sort,
  onSortChange,
  openId,
  onRowPress,
  mode,
  onShowOnMap,
}) => {
  const [query, setQuery] = useState('');
  const scores = useMemo(() => scoreStationsForRoute(stations, fuel), [fuel]);
  const rows = rankStations(scores, sort, query);
  const medals = sort === 'smart' && !query.trim();

  return (
    <View style={styles.panel}>
      <SearchField value={query} onChangeText={setQuery} />
      <FuelHotbar value={fuel} onChange={onFuelChange} framed={mode === 'expand'} />
      <SortToggle value={sort} onChange={onSortChange} />

      {rows.length === 0 ? (
        <View style={[pixel.panel, styles.empty]}>
          <PixelIcon name="search" size={48} color={colors.border} />
          <Text style={[type.displaySm, { color: colors.text, textAlign: 'center' }]}>No stations match “{query.trim()}”</Text>
          <Text style={[type.bodyMd, { color: colors.textMuted, textAlign: 'center' }]}>Try another name, or scan the board yourself.</Text>
          <PixelButton label="Clear search" variant="secondary" onPress={() => setQuery('')} />
        </View>
      ) : (
        <View accessibilityLabel="Stations" style={styles.rows}>
          {rows.map((score, index) => (
            <StationRow
              key={score.station.id}
              score={score}
              rank={index + 1}
              fuel={fuel}
              medals={medals}
              open={openId === score.station.id}
              onPress={() => onRowPress(score.station.id)}
              mode={mode}
              onShowOnMap={onShowOnMap ? () => onShowOnMap(score.station.id) : undefined}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: { gap: 12 },
  rows: { gap: 12, paddingTop: 4 },
  empty: { alignItems: 'center', gap: 10, padding: 20 },
});

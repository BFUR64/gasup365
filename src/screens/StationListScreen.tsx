import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { StationListPanel } from '../components/StationListPanel';
import { TitleBar } from '../components/ui/TitleBar';
import { StationSort, sortSubtitle } from '../services/stationPresentation';
import { sampleStationId } from '../services/stationView';
import { colors } from '../theme/colors';
import { FuelType } from '../types';

// Stations tab: leaderboard of sample stations (DESIGN-002 §7.5).
export const StationListScreen: React.FC = () => {
    const router = useRouter();
    const [fuel, setFuel] = useState<FuelType>('diesel');
    const [sort, setSort] = useState<StationSort>('smart');
    const [openId, setOpenId] = useState<number | null>(null);

    return (
        <View style={styles.container}>
            <TitleBar title="Stations" subtitle={sortSubtitle[sort]} />
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <StationListPanel
                    fuel={fuel}
                    onFuelChange={setFuel}
                    sort={sort}
                    onSortChange={setSort}
                    openId={openId}
                    onRowPress={(id) => setOpenId(openId === id ? null : id)}
                    mode="expand"
                    onShowOnMap={(id) => router.navigate({ pathname: '/', params: { station: sampleStationId(id), fuel } })}
                />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: 16, paddingBottom: 32 },
});

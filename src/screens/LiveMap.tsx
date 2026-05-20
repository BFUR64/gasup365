import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LeafletMap } from 'expo-leaflet-navigation-map';
import { kaliboCenter } from '../data/mockStations';

export default function MapScreen() {
  const lat = kaliboCenter.latitude;
  const lng = kaliboCenter.longitude;

  return (
    <View style={styles.container}>
      <LeafletMap
        coordinates={[lat, lng]}
        zoom={15}
        markers={[
          {
            id: 1,
            lat: lat,
            lng: lng,
            title: "Kalibo, Aklan, Philippines",
          },
        ]}
        ShowZoomControls
        theme="light"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

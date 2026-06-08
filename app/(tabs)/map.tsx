import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker } from 'react-native-maps';
import { getIssues } from '../../constants/api';

const CATEGORY_ICONS: Record<string, string> = {
  'Pothole': '🕳️',
  'Garbage': '🗑️',
  'Street Light': '💡',
  'Water Leak': '💧',
  'Other': '⚠️',
};

const STATUS_COLORS: Record<string, string> = {
  'Reported': '#e74c3c',
  'In Progress': '#f39c12',
  'Resolved': '#1a8a4a',
};

export default function MapScreen() {
  const [issues, setIssues] = useState<any[]>([]);

  useEffect(() => {
    getIssues().then(setIssues).catch(console.log);
  }, []);

  const validIssues = issues.filter(i => i.latitude && i.longitude);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SmartShehar</Text>
        <Text style={styles.headerSub}>Spot It. Report It. Fix It.</Text>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 28.1711,
          longitude: 76.6235,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {validIssues.map(issue => (
          <Marker
            key={issue.id}
            coordinate={{ latitude: issue.latitude, longitude: issue.longitude }}
          >
            <View style={[styles.markerContainer, { borderColor: STATUS_COLORS[issue.status] }]}>
              <Text style={styles.markerIcon}>{CATEGORY_ICONS[issue.category] || '⚠️'}</Text>
            </View>
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{CATEGORY_ICONS[issue.category]} {issue.category}</Text>
                <Text style={styles.calloutDesc}>{issue.description}</Text>
                <View style={[styles.calloutBadge, { backgroundColor: STATUS_COLORS[issue.status] }]}>
                  <Text style={styles.calloutBadgeText}>{issue.status}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Status</Text>
        <View style={styles.legendRow}>
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <View key={status} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={styles.legendText}>{status}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  header: { backgroundColor: '#0a1931', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#b7e4c7', marginTop: 2 },
  map: { flex: 1 },
  markerContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 6, elevation: 4, borderWidth: 2 },
  markerIcon: { fontSize: 22 },
  callout: { width: 200, padding: 10 },
  calloutTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  calloutDesc: { fontSize: 13, color: '#555', marginBottom: 8 },
  calloutBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  calloutBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  legend: { backgroundColor: '#fff', padding: 12, elevation: 4 },
  legendTitle: { fontSize: 12, fontWeight: '700', color: '#888', marginBottom: 6, textTransform: 'uppercase' },
  legendRow: { flexDirection: 'row', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: '#444' },
});
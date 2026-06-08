import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { getIssues } from '../../constants/api';

const STATUS_COLORS: Record<string, string> = {
  'pending': '#e74c3c',
  'in-progress': '#f39c12',
  'resolved': '#1a8a4a',
  'rejected': '#888',
};

const CATEGORY_ICONS: Record<string, string> = {
  'Pothole': '🕳️',
  'Garbage': '🗑️',
  'Street Light': '💡',
  'Water Leak': '💧',
  'Road': '🛣️',
  'Water': '💧',
  'Electricity': '⚡',
  'Sanitation': '🧹',
  'Other': '⚠️',
};

export default function FeedScreen() {
  const [issues, setIssues] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIssues = async () => {
    try {
      const data = await getIssues();
      setIssues(data);
    } catch (e) { console.log(e); }
  };

  useEffect(() => { fetchIssues(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIssues();
    setRefreshing(false);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{CATEGORY_ICONS[item.category] || '⚠️'}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.category}>{item.category}</Text>
          <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] }]}>
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.description}>{item.description}</Text>
      {item.latitude && (
        <View style={styles.locationRow}>
          <Text style={styles.locationText}>📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SmartShehar</Text>
        <Text style={styles.headerSub}>Spot It. Report It. Fix It.</Text>
      </View>
      <FlatList
        data={issues}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a1931" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No issues reported yet</Text>
            <Text style={styles.emptyHint}>Be the first to report an issue!</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  header: { backgroundColor: '#0a1931', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#b7e4c7', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f4f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 22 },
  cardInfo: { flex: 1 },
  category: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  description: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 12, color: '#999' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  emptyHint: { fontSize: 14, color: '#aaa', marginTop: 6 },
});
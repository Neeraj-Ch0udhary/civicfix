import { useEffect, useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getIssues } from '../../constants/api';

const STATUS_COLORS: Record<string, string> = {
  pending: '#e74c3c',
  'in-progress': '#f39c12',
  resolved: '#1a8a4a',
  rejected: '#888',
};

const STATUS_BG: Record<string, string> = {
  pending: '#fdecea',
  'in-progress': '#fef6e7',
  resolved: '#e8f5ee',
  rejected: '#f0f0f0',
};

const CATEGORY_ICONS: Record<string, string> = {
  Pothole: '🕳️', Garbage: '🗑️', 'Street Light': '💡',
  'Water Leak': '💧', Road: '🛣️', Water: '💧',
  Electricity: '⚡', Sanitation: '🧹', Other: '⚠️',
};

const FILTERS = ['All', 'pending', 'in-progress', 'resolved', 'rejected'];
const FILTER_LABELS: Record<string, string> = {
  All: 'All', pending: 'Pending', 'in-progress': 'In Progress',
  resolved: 'Resolved', rejected: 'Rejected',
};

export default function FeedScreen() {
  const [issues, setIssues] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

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

  const filtered = issues
    .filter(i => filter === 'All' || i.status === filter)
    .filter(i => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (i.category || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        (i.address || '').toLowerCase().includes(q) ||
        (i.status || '').toLowerCase().includes(q)
      );
    });

  if (selected) {
    return <DetailScreen issue={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        {searchActive ? (
          <View style={s.searchRow}>
            <TextInput
              style={s.searchInput}
              placeholder="Search category, description, address..."
              placeholderTextColor="#7a9cc0"
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setSearchActive(false); setSearch(''); }}>
              <Text style={s.searchCancel}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View>
              <Text style={s.headerTitle}>SmartShehar</Text>
              <Text style={s.headerSub}>Spot It. Report It. Fix It.</Text>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.searchBtn} onPress={() => setSearchActive(true)}>
                <Text style={s.searchBtnText}>🔍</Text>
              </TouchableOpacity>
              <View style={s.headerBadge}>
                <Text style={s.headerBadgeText}>{issues.length}</Text>
                <Text style={s.headerBadgeLabel}>Reports</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Search result count hint */}
      {search.trim().length > 0 && (
        <View style={s.searchHint}>
          <Text style={s.searchHintText}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </Text>
        </View>
      )}

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterBar} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, filter === f && { backgroundColor: '#0a1931' }]}
            onPress={() => setFilter(f)}
          >
            {f !== 'All' && <View style={[s.filterDot, { backgroundColor: STATUS_COLORS[f] }]} />}
            <Text style={[s.filterText, filter === f && { color: '#fff' }]}>{FILTER_LABELS[f]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => setSelected(item)} activeOpacity={0.85}>
            {item.photo_url && (
              <Image source={{ uri: item.photo_url }} style={s.cardPhoto} resizeMode="cover" />
            )}
            <View style={s.cardBody}>
              <View style={s.cardTop}>
                <View style={s.iconBox}>
                  <Text style={s.icon}>{CATEGORY_ICONS[item.category] || '⚠️'}</Text>
                </View>
                <View style={s.cardInfo}>
                  <Text style={s.category}>{item.category || 'Issue'}</Text>
                  <Text style={s.date}>
                    {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </View>
                <View style={[s.badge, { backgroundColor: STATUS_BG[item.status] || '#f0f0f0' }]}>
                  <View style={[s.badgeDot, { backgroundColor: STATUS_COLORS[item.status] || '#888' }]} />
                  <Text style={[s.badgeText, { color: STATUS_COLORS[item.status] || '#888' }]}>
                    {FILTER_LABELS[item.status] || item.status}
                  </Text>
                </View>
              </View>
              {item.description ? (
                <Text style={s.description} numberOfLines={2}>{item.description}</Text>
              ) : null}
              <View style={s.cardFooter}>
                {item.address ? (
                  <Text style={s.location} numberOfLines={1}>📍 {item.address}</Text>
                ) : item.latitude ? (
                  <Text style={s.location}>📍 {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</Text>
                ) : (
                  <Text style={s.location}>📍 No location</Text>
                )}
                <Text style={s.viewMore}>View →</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0a1931" />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyIcon}>{search ? '🔍' : '📋'}</Text>
            <Text style={s.emptyText}>{search ? 'No results found' : 'No issues found'}</Text>
            <Text style={s.emptyHint}>
              {search ? `Nothing matched "${search}"` : filter === 'All' ? 'Be the first to report!' : `No ${FILTER_LABELS[filter]} issues`}
            </Text>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      />
    </View>
  );
}

function DetailScreen({ issue, onBack }: { issue: any; onBack: () => void }) {
  const statusColor = STATUS_COLORS[issue.status] || '#888';
  const statusBg = STATUS_BG[issue.status] || '#f0f0f0';

  return (
    <View style={s.container}>
      <View style={s.detailHeader}>
        <TouchableOpacity onPress={onBack} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.detailHeaderTitle}>Issue Detail</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {issue.photo_url && (
          <Image source={{ uri: issue.photo_url }} style={s.detailPhoto} resizeMode="cover" />
        )}
        <View style={s.detailBody}>
          <View style={s.detailTop}>
            <View style={s.iconBoxLarge}>
              <Text style={s.iconLarge}>{CATEGORY_ICONS[issue.category] || '⚠️'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.detailCategory}>{issue.category || 'Issue'}</Text>
              <Text style={s.detailDate}>
                {new Date(issue.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </View>
            <View style={[s.badge, { backgroundColor: statusBg }]}>
              <View style={[s.badgeDot, { backgroundColor: statusColor }]} />
              <Text style={[s.badgeText, { color: statusColor }]}>{FILTER_LABELS[issue.status] || issue.status}</Text>
            </View>
          </View>
          <View style={s.divider} />
          {issue.description ? <Field label="Description" value={issue.description} /> : null}
          {issue.address ? <Field label="Address" value={issue.address} /> : null}
          {issue.phone ? <Field label="Reported by" value={issue.phone} /> : null}
          {issue.latitude ? (
            <Field label="Coordinates" value={`${issue.latitude.toFixed(6)}, ${issue.longitude.toFixed(6)}`} />
          ) : null}
          <Text style={s.timelineTitle}>Status</Text>
          <View style={s.timeline}>
            {['pending', 'in-progress', 'resolved'].map((step, idx) => {
              const statuses = ['pending', 'in-progress', 'resolved'];
              const currentIdx = statuses.indexOf(issue.status);
              const done = idx <= currentIdx;
              return (
                <View key={step} style={s.timelineStep}>
                  <View style={[s.timelineDot, { backgroundColor: done ? STATUS_COLORS[step] : '#ddd' }]} />
                  {idx < 2 && <View style={[s.timelineLine, { backgroundColor: done && idx < currentIdx ? STATUS_COLORS[statuses[idx + 1]] : '#ddd' }]} />}
                  <Text style={[s.timelineLabel, { color: done ? STATUS_COLORS[step] : '#bbb' }]}>{FILTER_LABELS[step]}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  header: { backgroundColor: '#0a1931', padding: 20, paddingTop: 50, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#b7e4c7', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBtn: { backgroundColor: 'rgba(255,255,255,0.15)', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  searchBtnText: { fontSize: 18 },
  searchRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, color: '#fff' },
  searchCancel: { color: '#7a9cc0', fontSize: 18, fontWeight: '600' },
  searchHint: { backgroundColor: '#e8f5ee', paddingHorizontal: 16, paddingVertical: 8 },
  searchHintText: { fontSize: 13, color: '#1a8a4a', fontWeight: '600' },
  headerBadge: { backgroundColor: '#1a8a4a', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' },
  headerBadgeText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerBadgeLabel: { fontSize: 10, color: '#b7e4c7' },
  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee', maxHeight: 56 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f0f4f0' },
  filterDot: { width: 7, height: 7, borderRadius: 4 },
  filterText: { fontSize: 13, fontWeight: '600', color: '#555' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 14, elevation: 2, overflow: 'hidden' },
  cardPhoto: { width: '100%', height: 180 },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#f0f4f0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  icon: { fontSize: 22 },
  cardInfo: { flex: 1 },
  category: { fontSize: 16, fontWeight: 'bold', color: '#0a1931' },
  date: { fontSize: 12, color: '#999', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  description: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  location: { fontSize: 12, color: '#aaa', flex: 1 },
  viewMore: { fontSize: 12, color: '#1a8a4a', fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  emptyHint: { fontSize: 14, color: '#aaa', marginTop: 6 },
  detailHeader: { backgroundColor: '#0a1931', flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20, gap: 16 },
  backBtn: { padding: 4 },
  backText: { color: '#7a9cc0', fontSize: 15 },
  detailHeaderTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  detailPhoto: { width: '100%', height: 240 },
  detailBody: { padding: 20 },
  detailTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconBoxLarge: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#f0f4f0', justifyContent: 'center', alignItems: 'center' },
  iconLarge: { fontSize: 26 },
  detailCategory: { fontSize: 18, fontWeight: 'bold', color: '#0a1931' },
  detailDate: { fontSize: 13, color: '#999', marginTop: 3 },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 16 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  fieldValue: { fontSize: 15, color: '#333', backgroundColor: '#f9f9f9', padding: 12, borderRadius: 10 },
  timelineTitle: { fontSize: 11, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14, marginTop: 4 },
  timeline: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  timelineStep: { alignItems: 'center', flex: 1 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, marginBottom: 6 },
  timelineLine: { position: 'absolute', top: 6, left: '50%', right: '-50%', height: 2 },
  timelineLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
});
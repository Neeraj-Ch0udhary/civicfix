import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

export default function ProfileScreen() {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [editingName, setEditingName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['user_phone', 'user_name', 'user_photo']).then(pairs => {
      const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
      if (map.user_phone) setPhone(map.user_phone);
      if (map.user_name) setName(map.user_name);
      if (map.user_photo) setPhoto(map.user_photo);
    });
    getIssues()
      .then(data => { setIssues(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const counts = {
    total: issues.length,
    pending: issues.filter(i => i.status === 'pending').length,
    inProgress: issues.filter(i => i.status === 'in-progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  const maskedPhone = phone
    ? phone.replace(/(\+91)(\d{6})(\d{4})/, '$1 ••••••$3')
    : '';

  const startEdit = () => {
    setEditingName(name);
    setEditing(true);
  };

  const saveEdit = async () => {
    const trimmed = editingName.trim();
    setName(trimmed);
    await AsyncStorage.setItem('user_name', trimmed);
    setEditing(false);
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to set profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhoto(uri);
      await AsyncStorage.setItem('user_photo', uri);
    }
  };

  const logout = () => {
  Alert.alert('Logout', 'Are you sure you want to logout?', [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Logout', style: 'destructive', onPress: async () => {
        await (global as any).__logout();
      }
    }
  ]);
};

  const stats = [
    { label: 'Total', value: counts.total, color: '#0a1931', border: '#0a1931' },
    { label: 'Pending', value: counts.pending, color: '#e74c3c', border: '#e74c3c' },
    { label: 'In Progress', value: counts.inProgress, color: '#f39c12', border: '#f39c12' },
    { label: 'Resolved', value: counts.resolved, color: '#1a8a4a', border: '#1a8a4a' },
  ];

  return (
    <FlatList
      style={s.container}
      data={issues}
      keyExtractor={i => i.id}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={s.header}>
            {/* Edit / Save button */}
            <TouchableOpacity
              style={s.editBtn}
              onPress={editing ? saveEdit : startEdit}
            >
              <Text style={s.editBtnText}>{editing ? '✓ Save' : '✏️ Edit'}</Text>
            </TouchableOpacity>

            {/* Avatar */}
            <TouchableOpacity onPress={editing ? pickPhoto : undefined} style={s.avatarWrapper}>
              <View style={s.avatarRing}>
                {photo ? (
                  <Image source={{ uri: photo }} style={s.avatarImage} />
                ) : (
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>👤</Text>
                  </View>
                )}
              </View>
              {editing && (
                <View style={s.cameraOverlay}>
                  <Text style={s.cameraIcon}>📷</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Name */}
            {editing ? (
              <TextInput
                style={s.nameInput}
                value={editingName}
                onChangeText={setEditingName}
                placeholder="Enter your name"
                placeholderTextColor="#7a9cc0"
                autoFocus
                maxLength={30}
              />
            ) : (
              <Text style={s.nameText}>{name || 'Tap Edit to add name'}</Text>
            )}

            <Text style={s.phone}>{maskedPhone}</Text>
            <Text style={s.role}>Citizen Reporter</Text>
            <View style={s.wave} />
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            {stats.map(stat => (
              <View key={stat.label} style={[s.statCard, { borderTopColor: stat.border }]}>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Activity Header */}
          <Text style={s.sectionTitle}>My Reports</Text>
          {loading && <Text style={s.loadingText}>Loading...</Text>}
          {!loading && issues.length === 0 && (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptyText}>No reports yet</Text>
              <Text style={s.emptySub}>Go to Report Issue to submit your first one</Text>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => (
        <View style={s.issueCard}>
          <View style={s.issueLeft}>
            <Text style={s.issueTitle} numberOfLines={1}>{item.title || item.category || 'Issue'}</Text>
            <Text style={s.issueDesc} numberOfLines={1}>{item.description || 'No description'}</Text>
            <Text style={s.issueDate}>
              {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <View style={[s.badge, { backgroundColor: STATUS_BG[item.status] || '#f0f0f0' }]}>
            <View style={[s.badgeDot, { backgroundColor: STATUS_COLORS[item.status] || '#888' }]} />
            <Text style={[s.badgeText, { color: STATUS_COLORS[item.status] || '#888' }]}>{item.status}</Text>
          </View>
        </View>
      )}
      ListFooterComponent={
        <TouchableOpacity style={s.logoutBtn} onPress={logout}>
          <Text style={s.logoutText}>🚪  Logout</Text>
        </TouchableOpacity>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  header: { backgroundColor: '#0a1931', alignItems: 'center', paddingTop: 60, paddingBottom: 50 },
  editBtn: { position: 'absolute', top: 54, right: 20, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  editBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  avatarWrapper: { marginBottom: 12, position: 'relative' },
  avatarRing: { width: 92, height: 92, borderRadius: 46, borderWidth: 3, borderColor: '#1a8a4a', alignItems: 'center', justifyContent: 'center', padding: 3 },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a2e4a', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 36 },
  cameraOverlay: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1a8a4a', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0a1931' },
  cameraIcon: { fontSize: 14 },
  nameInput: { fontSize: 18, fontWeight: 'bold', color: '#fff', borderBottomWidth: 1.5, borderBottomColor: '#1a8a4a', paddingBottom: 4, minWidth: 160, textAlign: 'center', marginBottom: 6 },
  nameText: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  phone: { fontSize: 14, color: '#7a9cc0', marginTop: 2 },
  role: { fontSize: 12, color: '#5a7a9a', marginTop: 2 },
  wave: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 30, backgroundColor: '#f0f4f0', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  statsRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 10, gap: 10 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 12, alignItems: 'center', elevation: 2, borderTopWidth: 3 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 10, color: '#999', marginTop: 3, textAlign: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 10, marginHorizontal: 20 },
  loadingText: { textAlign: 'center', color: '#aaa', padding: 20 },
  emptyBox: { alignItems: 'center', padding: 30, backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, elevation: 1 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#555' },
  emptySub: { fontSize: 12, color: '#aaa', marginTop: 4, textAlign: 'center' },
  issueCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  issueLeft: { flex: 1, marginRight: 10 },
  issueTitle: { fontSize: 14, fontWeight: '700', color: '#0a1931' },
  issueDesc: { fontSize: 12, color: '#888', marginTop: 2 },
  issueDate: { fontSize: 11, color: '#bbb', marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5 },
  badgeDot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  logoutBtn: { marginHorizontal: 16, marginTop: 24, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: '#e74c3c', elevation: 1 },
  logoutText: { color: '#e74c3c', fontSize: 15, fontWeight: '700' },
});
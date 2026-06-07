import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { submitIssue } from '../../constants/api';

const CATEGORIES = [
  { label: 'Pothole', icon: '🕳️' },
  { label: 'Garbage', icon: '🗑️' },
  { label: 'Street Light', icon: '💡' },
  { label: 'Water Leak', icon: '💧' },
  { label: 'Other', icon: '⚠️' },
];

export default function ReportScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Camera permission is required'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.3 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Location permission is required'); return; }
    const loc = await Location.getCurrentPositionAsync({});
    setLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
  };

  const submit = async () => {
    if (!image || !category || !description) { Alert.alert('Missing info', 'Please add photo, category and description'); return; }
    try {
      setLoading(true);
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });
      const coords = location ? location.split(', ') : [null, null];
      await submitIssue({
        category, description,
        latitude: coords[0] ? parseFloat(coords[0]) : null,
        longitude: coords[1] ? parseFloat(coords[1]) : null,
        photo: base64,
      });
      Alert.alert('Success! 🎉', 'Your issue has been reported. City officials will review it soon.');
      setImage(null); setCategory(''); setDescription(''); setLocation(null);
    } catch (e) {
      Alert.alert('Error', 'Could not submit. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Report an Issue</Text>
        <Text style={styles.subtitle}>Help make your city better 🏙️</Text>
      </View>

      <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
        {image
          ? <Image source={{ uri: image }} style={styles.photo} />
          : <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoText}>Tap to take a photo</Text>
              <Text style={styles.photoHint}>Clear photos help officials respond faster</Text>
            </View>
        }
      </TouchableOpacity>

      <Text style={styles.label}>Category</Text>
      <View style={styles.categories}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.label}
            style={[styles.cat, category === cat.label && styles.catSelected]}
            onPress={() => setCategory(cat.label)}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catText, category === cat.label && styles.catTextSelected]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Describe the issue in detail..."
        placeholderTextColor="#aaa"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      <TouchableOpacity style={styles.locBtn} onPress={getLocation}>
        <Text style={styles.locIcon}>📍</Text>
        <Text style={styles.locText}>{location ? location : 'Get My Location'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.submitBtn, loading && styles.submitDisabled]} onPress={submit} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>Submit Report</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  header: { backgroundColor: '#2d6a4f', padding: 24, paddingTop: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#b7e4c7', marginTop: 4 },
  photoBox: { margin: 16, borderRadius: 16, overflow: 'hidden', height: 200, backgroundColor: '#fff', elevation: 2 },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoIcon: { fontSize: 40, marginBottom: 8 },
  photoText: { fontSize: 16, color: '#555', fontWeight: '600' },
  photoHint: { fontSize: 12, color: '#aaa', marginTop: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#444', marginHorizontal: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 20 },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 24, backgroundColor: '#fff', elevation: 1 },
  catSelected: { backgroundColor: '#2d6a4f' },
  catIcon: { fontSize: 16 },
  catText: { color: '#555', fontWeight: '500' },
  catTextSelected: { color: '#fff', fontWeight: '700' },
  input: { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, marginHorizontal: 16, marginBottom: 16, textAlignVertical: 'top', elevation: 1, color: '#333' },
  locBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 20, elevation: 1 },
  locIcon: { fontSize: 18 },
  locText: { color: '#2d6a4f', fontWeight: '600', fontSize: 15 },
  submitBtn: { backgroundColor: '#2d6a4f', borderRadius: 14, padding: 18, alignItems: 'center', marginHorizontal: 16, marginBottom: 40, elevation: 3 },
  submitDisabled: { backgroundColor: '#95d5b2' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
});
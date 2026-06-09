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
  { label: 'Road', icon: '🛣️' },
  { label: 'Electricity', icon: '⚡' },
  { label: 'Sanitation', icon: '🧹' },
  { label: 'Other', icon: '⚠️' },
];

export default function ReportScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.4 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.4 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Location permission is required');
      return;
    }
    setLocLoading(true);
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setCoords({ lat: latitude, lng: longitude });

      // Reverse geocode to get address
      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (geo.length > 0) {
        const g = geo[0];
        const parts = [g.name, g.street, g.district, g.city, g.region].filter(Boolean);
        setAddress(parts.join(', '));
      } else {
        setAddress(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch {
      Alert.alert('Error', 'Could not get location. Try again.');
    }
    setLocLoading(false);
  };

  const submit = async () => {
    if (!image) { Alert.alert('Missing photo', 'Please take a photo of the issue'); return; }
    if (!category) { Alert.alert('Missing category', 'Please select a category'); return; }
    if (!description.trim()) { Alert.alert('Missing description', 'Please describe the issue'); return; }
    if (!coords) { Alert.alert('Missing location', 'Please get your location first'); return; }

    try {
      setLoading(true);
      const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });
      await submitIssue({
        category,
        description: description.trim(),
        latitude: coords.lat,
        longitude: coords.lng,
        photo: base64,
        address: address || undefined,
      });
      setSubmitted(true);
    } catch {
      Alert.alert('Error', 'Could not submit. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setImage(null);
    setCategory('');
    setDescription('');
    setCoords(null);
    setAddress(null);
    setSubmitted(false);
  };

  // Completion check for each step
  const step1Done = !!image;
  const step2Done = !!category;
  const step3Done = description.trim().length > 0;
  const step4Done = !!coords;

  if (submitted) {
    return (
      <View style={s.successContainer}>
        <Text style={s.successIcon}>🎉</Text>
        <Text style={s.successTitle}>Report Submitted!</Text>
        <Text style={s.successSub}>City officials will review your report soon. Thank you for making SmartShehar better!</Text>
        <TouchableOpacity style={s.successBtn} onPress={reset}>
          <Text style={s.successBtnText}>Report Another Issue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>Report an Issue</Text>
        <Text style={s.subtitle}>Help make your city better 🏙️</Text>
        {/* Progress bar */}
        <View style={s.progressRow}>
          {[step1Done, step2Done, step3Done, step4Done].map((done, i) => (
            <View key={i} style={[s.progressDot, done && s.progressDotDone]} />
          ))}
        </View>
      </View>

      {/* Step 1: Photo */}
      <View style={s.section}>
        <View style={s.stepRow}>
          <View style={[s.stepNum, step1Done && s.stepNumDone]}>
            <Text style={s.stepNumText}>{step1Done ? '✓' : '1'}</Text>
          </View>
          <Text style={s.stepLabel}>Add Photo</Text>
        </View>

        {image ? (
          <View style={s.photoPreview}>
            <Image source={{ uri: image }} style={s.photo} resizeMode="cover" />
            <View style={s.photoActions}>
              <TouchableOpacity style={s.photoActionBtn} onPress={pickImage}>
                <Text style={s.photoActionText}>📷 Retake</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.photoActionBtn} onPress={pickFromGallery}>
                <Text style={s.photoActionText}>🖼️ Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.photoActionBtn, { borderColor: '#e74c3c' }]} onPress={() => setImage(null)}>
                <Text style={[s.photoActionText, { color: '#e74c3c' }]}>✕ Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.photoButtons}>
            <TouchableOpacity style={s.photoBtn} onPress={pickImage}>
              <Text style={s.photoBtnIcon}>📷</Text>
              <Text style={s.photoBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.photoBtn, { borderColor: '#0a1931' }]} onPress={pickFromGallery}>
              <Text style={s.photoBtnIcon}>🖼️</Text>
              <Text style={s.photoBtnText}>From Gallery</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Step 2: Category */}
      <View style={s.section}>
        <View style={s.stepRow}>
          <View style={[s.stepNum, step2Done && s.stepNumDone]}>
            <Text style={s.stepNumText}>{step2Done ? '✓' : '2'}</Text>
          </View>
          <Text style={s.stepLabel}>Select Category</Text>
        </View>
        <View style={s.categories}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.label}
              style={[s.cat, category === cat.label && s.catSelected]}
              onPress={() => setCategory(cat.label)}
            >
              <Text style={s.catIcon}>{cat.icon}</Text>
              <Text style={[s.catText, category === cat.label && s.catTextSelected]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Step 3: Description */}
      <View style={s.section}>
        <View style={s.stepRow}>
          <View style={[s.stepNum, step3Done && s.stepNumDone]}>
            <Text style={s.stepNumText}>{step3Done ? '✓' : '3'}</Text>
          </View>
          <Text style={s.stepLabel}>Describe the Issue</Text>
        </View>
        <TextInput
          style={s.input}
          placeholder="What's the problem? Be specific — it helps officials respond faster."
          placeholderTextColor="#bbb"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={s.charCount}>{description.length} characters</Text>
      </View>

      {/* Step 4: Location */}
      <View style={s.section}>
        <View style={s.stepRow}>
          <View style={[s.stepNum, step4Done && s.stepNumDone]}>
            <Text style={s.stepNumText}>{step4Done ? '✓' : '4'}</Text>
          </View>
          <Text style={s.stepLabel}>Add Location</Text>
        </View>

        {coords ? (
          <View style={s.locationCard}>
            <Text style={s.locationIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              {address && <Text style={s.locationAddress}>{address}</Text>}
              <Text style={s.locationCoords}>{coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</Text>
            </View>
            <TouchableOpacity onPress={getLocation}>
              <Text style={s.locationRefresh}>↻</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={s.locBtn} onPress={getLocation} disabled={locLoading}>
            {locLoading
              ? <ActivityIndicator color="#0a1931" size="small" />
              : <Text style={s.locBtnIcon}>📍</Text>
            }
            <Text style={s.locBtnText}>{locLoading ? 'Getting location...' : 'Get My Location'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[s.submitBtn, (!step1Done || !step2Done || !step3Done || !step4Done || loading) && s.submitDisabled]}
        onPress={submit}
        disabled={!step1Done || !step2Done || !step3Done || !step4Done || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.submitText}>Submit Report 🚀</Text>
        }
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },

  // Header
  header: { backgroundColor: '#0a1931', padding: 20, paddingTop: 50, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#b7e4c7', marginTop: 4 },
  progressRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  progressDot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressDotDone: { backgroundColor: '#1a8a4a' },

  // Sections
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16, elevation: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#f0f4f0', alignItems: 'center', justifyContent: 'center' },
  stepNumDone: { backgroundColor: '#1a8a4a' },
  stepNumText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  stepLabel: { fontSize: 15, fontWeight: '700', color: '#0a1931' },

  // Photo
  photoPreview: { borderRadius: 12, overflow: 'hidden' },
  photo: { width: '100%', height: 200, borderRadius: 12 },
  photoActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  photoActionBtn: { flex: 1, borderWidth: 1.5, borderColor: '#ddd', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  photoActionText: { fontSize: 13, fontWeight: '600', color: '#555' },
  photoButtons: { flexDirection: 'row', gap: 12 },
  photoBtn: { flex: 1, borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', borderRadius: 12, paddingVertical: 20, alignItems: 'center', gap: 6 },
  photoBtnIcon: { fontSize: 28 },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: '#555' },

  // Category
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cat: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f4f0' },
  catSelected: { backgroundColor: '#0a1931' },
  catIcon: { fontSize: 15 },
  catText: { color: '#555', fontWeight: '500', fontSize: 13 },
  catTextSelected: { color: '#fff', fontWeight: '700' },

  // Description
  input: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', minHeight: 100, borderWidth: 1, borderColor: '#eee' },
  charCount: { fontSize: 11, color: '#bbb', textAlign: 'right', marginTop: 6 },

  // Location
  locBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#f0f4f0', borderRadius: 12, padding: 14 },
  locBtnIcon: { fontSize: 20 },
  locBtnText: { fontSize: 15, fontWeight: '600', color: '#0a1931' },
  locationCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#e8f5ee', borderRadius: 12, padding: 14 },
  locationIcon: { fontSize: 20 },
  locationAddress: { fontSize: 14, fontWeight: '600', color: '#0a1931', marginBottom: 2 },
  locationCoords: { fontSize: 12, color: '#888' },
  locationRefresh: { fontSize: 20, color: '#1a8a4a', fontWeight: 'bold' },

  // Submit
  submitBtn: { backgroundColor: '#1a8a4a', borderRadius: 14, padding: 18, alignItems: 'center', marginHorizontal: 16, marginTop: 20, elevation: 3 },
  submitDisabled: { backgroundColor: '#b7dfc7' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },

  // Success
  successContainer: { flex: 1, backgroundColor: '#f0f4f0', alignItems: 'center', justifyContent: 'center', padding: 40 },
  successIcon: { fontSize: 72, marginBottom: 20 },
  successTitle: { fontSize: 26, fontWeight: 'bold', color: '#0a1931', marginBottom: 12 },
  successSub: { fontSize: 15, color: '#777', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  successBtn: { backgroundColor: '#0a1931', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 16 },
  successBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
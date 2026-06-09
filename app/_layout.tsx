import AsyncStorage from '@react-native-async-storage/async-storage';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RootLayout() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(['user_phone', 'user_name']).then(pairs => {
      const map = Object.fromEntries(pairs.map(([k, v]) => [k, v]));
      if (map.user_phone && map.user_name) setAuthed(true);
      setChecked(true);
    });
  }, []);

  // Expose logout globally so profile screen can call it
  useEffect(() => {
    (global as any).__logout = async () => {
  await AsyncStorage.multiRemove(['user_phone', 'user_name']);
  setAuthed(false);
};
  }, []);

  const handleContinue = async () => {
    if (name.trim().length < 2) {
      Alert.alert('Invalid name', 'Please enter your full name');
      return;
    }
    if (phone.length !== 10) {
      Alert.alert('Invalid number', 'Enter a valid 10-digit mobile number');
      return;
    }
    setSaving(true);
    await AsyncStorage.multiSet([
      ['user_name', name.trim()],
      ['user_phone', `+91${phone}`],
    ]);
    setSaving(false);
    setAuthed(true);
  };

  if (!checked) return (
  <View style={{ flex: 1, backgroundColor: '#0a1931', alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: 72, marginBottom: 16 }}>📍</Text>
    <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 1 }}>SmartShehar</Text>
    <Text style={{ fontSize: 14, color: '#7a9cc0', marginTop: 8 }}>Spot It. Report It. Fix It.</Text>
  </View>
);
  if (authed) return <Slot />;

  return (
    <KeyboardAvoidingView style={s.container} behavior="height">
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {/* Branding */}
        <View style={s.top}>
          <Text style={s.logo}>📍</Text>
          <Text style={s.appName}>SmartShehar</Text>
          <Text style={s.tagline}>Spot It. Report It. Fix It.</Text>
        </View>

        {/* Form card */}
        <View style={s.card}>
          <Text style={s.heading}>Create your profile</Text>
          <Text style={s.sub}>Just your name and number — no OTP, no hassle.</Text>

          {/* Name */}
          <Text style={s.label}>Full Name</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Rahul Sharma"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            maxLength={30}
          />

          {/* Phone */}
          <Text style={s.label}>Mobile Number</Text>
          <View style={s.phoneRow}>
            <View style={s.cc}>
              <Text style={s.ccText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={s.phoneInput}
              placeholder="10-digit number"
              placeholderTextColor="#bbb"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, (saving || name.trim().length < 2 || phone.length !== 10) && s.btnDisabled]}
            onPress={handleContinue}
            disabled={saving || name.trim().length < 2 || phone.length !== 10}
          >
            <Text style={s.btnText}>{saving ? 'Saving...' : 'Get Started →'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.privacy}>🔒 Your info is stored only on this device</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1931' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  top: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 60, marginBottom: 10 },
  appName: { fontSize: 34, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 14, color: '#7a9cc0', marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#0a1931', marginBottom: 6 },
  sub: { fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 12, fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: '#f0f4f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#333', marginBottom: 20 },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  cc: { backgroundColor: '#f0f4f0', borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center' },
  ccText: { fontSize: 15, fontWeight: '600', color: '#333' },
  phoneInput: { flex: 1, backgroundColor: '#f0f4f0', borderRadius: 12, padding: 14, fontSize: 16, color: '#333' },
  btn: { backgroundColor: '#0a1931', borderRadius: 14, padding: 16, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#b0bec5' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  privacy: { textAlign: 'center', color: '#3a5a7a', fontSize: 12, marginTop: 20 },
});
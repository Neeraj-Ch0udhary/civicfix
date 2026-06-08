import AsyncStorage from '@react-native-async-storage/async-storage';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RootLayout() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [screen, setScreen] = useState<'login' | 'otp'>('login');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirm, setConfirm] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user_phone').then(val => {
      if (val) setAuthed(true);
      setChecked(true);
    });
  }, []);

  const sendOtp = async () => {
    if (phone.length !== 10) { Alert.alert('Invalid', 'Enter 10-digit number'); return; }
    setLoading(true);
    try {
      const confirmation = await auth().signInWithPhoneNumber(`+91${phone}`);
      setConfirm(confirmation);
      setScreen('otp');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    setLoading(false);
  };

  const verify = async () => {
    if (!confirm) return;
    setLoading(true);
    try {
      await confirm.confirm(otp);
      await AsyncStorage.setItem('user_phone', `+91${phone}`);
      setAuthed(true);
    } catch (e) {
      Alert.alert('Wrong OTP', 'The OTP you entered is incorrect.');
    }
    setLoading(false);
  };

  if (!checked) return null;

  if (!authed) {
    if (screen === 'login') return (
      <KeyboardAvoidingView style={s.container} behavior="height">
        <View style={s.top}>
          <Text style={s.logo}>📍</Text>
          <Text style={s.appName}>SmartShehar</Text>
          <Text style={s.tagline}>Spot It. Report It. Fix It.</Text>
        </View>
        <View style={s.card}>
          <Text style={s.heading}>Welcome</Text>
          <Text style={s.sub}>Enter your mobile number to continue</Text>
          <View style={s.phoneRow}>
            <View style={s.cc}><Text style={s.ccText}>🇮🇳 +91</Text></View>
            <TextInput style={s.input} placeholder="10-digit mobile number" placeholderTextColor="#aaa"
              keyboardType="phone-pad" maxLength={10} value={phone} onChangeText={setPhone} />
          </View>
          <TouchableOpacity style={s.btn} onPress={sendOtp} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Sending...' : 'Send OTP →'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );

    return (
      <KeyboardAvoidingView style={s.container} behavior="height">
        <TouchableOpacity style={s.back} onPress={() => setScreen('login')}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={s.top}>
          <Text style={s.logo}>🔐</Text>
          <Text style={s.appName}>Verify OTP</Text>
          <Text style={s.tagline}>Sent to +91 {phone}</Text>
        </View>
        <View style={s.card}>
          <TextInput style={s.input} placeholder="Enter 6-digit OTP" placeholderTextColor="#aaa"
            keyboardType="number-pad" maxLength={6} value={otp} onChangeText={setOtp} />
          <TouchableOpacity style={s.btn} onPress={verify} disabled={loading}>
            <Text style={s.btnText}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return <Slot />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1931', justifyContent: 'center', padding: 24 },
  top: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 56, marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 14, color: '#7a9cc0', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#0a1931', marginBottom: 6 },
  sub: { fontSize: 14, color: '#888', marginBottom: 24 },
  phoneRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  cc: { backgroundColor: '#f0f4f0', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center' },
  ccText: { fontSize: 15, fontWeight: '600', color: '#333' },
  input: { flex: 1, backgroundColor: '#f0f4f0', borderRadius: 10, padding: 14, fontSize: 16, color: '#333', marginBottom: 16 },
  btn: { backgroundColor: '#0a1931', borderRadius: 12, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  back: { position: 'absolute', top: 54, left: 24 },
  backText: { color: '#7a9cc0', fontSize: 16 },
});
import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getSignals } from '../../constants/api';

const ROAD_COLORS: Record<string, string> = {
  North: '#3498db',
  South: '#e74c3c',
  East: '#f39c12',
  West: '#9b59b6',
};

const POLL_INTERVAL = 5000;
const MIN_GREEN = 5;
const MAX_GREEN = 30;

type Signal = { id: string; road: string; vehicle_count: number };

function computeGreenTimes(signals: Signal[]): Record<string, number> {
  const total = signals.reduce((s, r) => s + r.vehicle_count, 0) || 1;
  const times: Record<string, number> = {};
  signals.forEach(r => {
    const ratio = r.vehicle_count / total;
    times[r.road] = Math.round(MIN_GREEN + ratio * (MAX_GREEN - MIN_GREEN));
  });
  return times;
}

export default function SignalsScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [greenTimes, setGreenTimes] = useState<Record<string, number>>({});
  const [activeIdx, setActiveIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const greenTimesRef = useRef<Record<string, number>>({});

  // Keep ref in sync with state
  useEffect(() => {
    greenTimesRef.current = greenTimes;
  }, [greenTimes]);

  // Fetch signals from Supabase
  const fetchSignals = async () => {
    try {
      const data = await getSignals();
      setSignals(data);
      const times = computeGreenTimes(data);
      setGreenTimes(times);
    } catch (e) { console.log(e); }
    setLoading(false);
  };

  useEffect(() => {
    fetchSignals();
    const poll = setInterval(fetchSignals, POLL_INTERVAL);
    return () => clearInterval(poll);
  }, []);

  // Signal cycle logic
  useEffect(() => {
    if (signals.length === 0) return;

    const current = signals[activeIdx];
    if (!current) return;

    const duration = greenTimesRef.current[current.road] || 10;
    setCountdown(duration);

    let remaining = duration;
    const tick = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(tick);
        setActiveIdx(i => (i + 1) % signals.length);
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [activeIdx, signals]);

  // Pulse animation for active signal
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const activeRoad = signals[activeIdx]?.road;
  const totalVehicles = signals.reduce((s, r) => s + r.vehicle_count, 0);

  if (loading) {
    return (
      <View style={s.loadingContainer}>
        <Text style={s.loadingText}>Loading signal data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>🚦 Smart Signals</Text>
        <Text style={s.headerSub}>AI-adaptive traffic light control</Text>
      </View>

      {/* Intersection visual */}
      <View style={s.intersectionCard}>
        <Text style={s.intersectionTitle}>Live Intersection</Text>
        <View style={s.intersection}>

          {/* North */}
          <View style={s.roadTop}>
            <SignalLight road="North" active={activeRoad === 'North'} pulseAnim={pulseAnim} />
            <Text style={s.roadLabel}>N</Text>
          </View>

          {/* Middle row */}
          <View style={s.middleRow}>
            <View style={s.roadLeft}>
              <SignalLight road="West" active={activeRoad === 'West'} pulseAnim={pulseAnim} />
              <Text style={s.roadLabel}>W</Text>
            </View>
            <View style={s.centerBox}>
              <Text style={s.centerIcon}>✕</Text>
            </View>
            <View style={s.roadRight}>
              <SignalLight road="East" active={activeRoad === 'East'} pulseAnim={pulseAnim} />
              <Text style={s.roadLabel}>E</Text>
            </View>
          </View>

          {/* South */}
          <View style={s.roadBottom}>
            <SignalLight road="South" active={activeRoad === 'South'} pulseAnim={pulseAnim} />
            <Text style={s.roadLabel}>S</Text>
          </View>
        </View>

        {/* Active signal info */}
        <View style={[s.activeInfo, { borderColor: ROAD_COLORS[activeRoad] || '#1a8a4a' }]}>
          <View style={s.activeInfoLeft}>
            <Text style={s.activeLabel}>Currently GREEN</Text>
            <Text style={[s.activeRoad, { color: ROAD_COLORS[activeRoad] || '#1a8a4a' }]}>
              {activeRoad} Road
            </Text>
          </View>
          <View style={s.countdownBox}>
            <Text style={[s.countdown, { color: ROAD_COLORS[activeRoad] || '#1a8a4a' }]}>{countdown}</Text>
            <Text style={s.countdownLabel}>sec left</Text>
          </View>
        </View>
      </View>

      {/* Road stats */}
      <Text style={s.sectionTitle}>Vehicle Congestion</Text>
      {signals.map((sig) => {
        const isActive = sig.road === activeRoad;
        const pct = totalVehicles > 0 ? sig.vehicle_count / totalVehicles : 0;
        const greenTime = greenTimes[sig.road] || 0;
        const color = ROAD_COLORS[sig.road] || '#888';
        return (
          <View key={sig.id} style={[s.roadCard, isActive && { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <View style={s.roadCardTop}>
              <View style={s.roadCardLeft}>
                <View style={[s.roadDot, { backgroundColor: color }]} />
                <Text style={s.roadName}>{sig.road} Road</Text>
                {isActive && (
                  <View style={s.liveBadge}>
                    <Text style={s.liveBadgeText}>GREEN</Text>
                  </View>
                )}
              </View>
              <Text style={s.vehicleCount}>{sig.vehicle_count} vehicles</Text>
            </View>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
            </View>
            <View style={s.roadCardBottom}>
              <Text style={s.roadCardSub}>{Math.round(pct * 100)}% of total traffic</Text>
              <Text style={[s.greenTimeText, { color }]}>🟢 {greenTime}s green time</Text>
            </View>
          </View>
        );
      })}

      {/* How it works */}
      <View style={s.infoCard}>
        <Text style={s.infoTitle}>🧠 How It Works</Text>
        <Text style={s.infoText}>
          Cameras detect vehicle count on each road every few seconds. The signal
          allocates green time proportionally — a road with 60% of total traffic
          gets 60% of the available green time. Roads with zero vehicles are
          skipped automatically.
        </Text>
        <View style={s.infoStats}>
          <View style={s.infoStat}>
            <Text style={s.infoStatValue}>{totalVehicles}</Text>
            <Text style={s.infoStatLabel}>Total Vehicles</Text>
          </View>
          <View style={s.infoStat}>
            <Text style={s.infoStatValue}>{signals.length}</Text>
            <Text style={s.infoStatLabel}>Roads Monitored</Text>
          </View>
          <View style={s.infoStat}>
            <Text style={s.infoStatValue}>{POLL_INTERVAL / 1000}s</Text>
            <Text style={s.infoStatLabel}>Update Interval</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SignalLight({ road, active, pulseAnim }: { road: string; active: boolean; pulseAnim: Animated.Value }) {
  const color = ROAD_COLORS[road] || '#888';
  return (
    <Animated.View style={[
      s.signalLight,
      { backgroundColor: active ? color : '#2a2a2a' },
      active && { transform: [{ scale: pulseAnim }] },
    ]}>
      <Text style={s.signalIcon}>{active ? '🟢' : '🔴'}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f0' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f0' },
  loadingText: { fontSize: 16, color: '#888' },
  header: { backgroundColor: '#0a1931', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  headerSub: { fontSize: 13, color: '#b7e4c7', marginTop: 2 },
  intersectionCard: { backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16, elevation: 3 },
  intersectionTitle: { fontSize: 14, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
  intersection: { alignItems: 'center', marginBottom: 16 },
  roadTop: { alignItems: 'center', marginBottom: 8 },
  middleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  roadLeft: { alignItems: 'center' },
  roadRight: { alignItems: 'center' },
  roadBottom: { alignItems: 'center', marginTop: 8 },
  roadLabel: { fontSize: 12, fontWeight: '700', color: '#aaa', marginTop: 4 },
  centerBox: { width: 60, height: 60, backgroundColor: '#e8e8e8', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  centerIcon: { fontSize: 24, color: '#bbb' },
  signalLight: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  signalIcon: { fontSize: 22 },
  activeInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderRadius: 12, padding: 14 },
  activeInfoLeft: {},
  activeLabel: { fontSize: 11, color: '#aaa', fontWeight: '600', textTransform: 'uppercase' },
  activeRoad: { fontSize: 18, fontWeight: 'bold', marginTop: 2 },
  countdownBox: { alignItems: 'center' },
  countdown: { fontSize: 36, fontWeight: 'bold' },
  countdownLabel: { fontSize: 11, color: '#aaa' },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: 20, marginBottom: 10 },
  roadCard: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10, borderRadius: 14, padding: 14, elevation: 2, borderLeftWidth: 0, borderLeftColor: 'transparent' },
  roadCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  roadCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roadDot: { width: 10, height: 10, borderRadius: 5 },
  roadName: { fontSize: 15, fontWeight: '700', color: '#0a1931' },
  liveBadge: { backgroundColor: '#e8f5ee', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  liveBadgeText: { fontSize: 10, fontWeight: '800', color: '#1a8a4a' },
  vehicleCount: { fontSize: 14, fontWeight: '600', color: '#555' },
  barBg: { height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, marginBottom: 8 },
  barFill: { height: 8, borderRadius: 4 },
  roadCardBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  roadCardSub: { fontSize: 12, color: '#aaa' },
  greenTimeText: { fontSize: 12, fontWeight: '600' },
  infoCard: { backgroundColor: '#0a1931', marginHorizontal: 16, marginTop: 6, borderRadius: 16, padding: 20 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#7a9cc0', lineHeight: 22 },
  infoStats: { flexDirection: 'row', marginTop: 16, gap: 8 },
  infoStat: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, alignItems: 'center' },
  infoStatValue: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  infoStatLabel: { fontSize: 10, color: '#7a9cc0', marginTop: 4, textAlign: 'center' },
});
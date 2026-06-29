import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://faresay.com'

type RowProps = { label: string; sub?: string; onPress: () => void; destructive?: boolean }

function Row({ label, sub, onPress, destructive }: RowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={sub ? `${label}, ${sub}` : label}
    >
      <View style={styles.rowMeta}>
        <Text style={[styles.rowLabel, destructive && styles.rowDestructive]}>{label}</Text>
        {sub && <Text style={styles.rowSub}>{sub}</Text>}
      </View>
      {!destructive && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  )
}

export default function MoreScreen() {
  const { signOut } = useAuth()
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Practice</Text>
        <View style={styles.card}>
          <Row
            label="Earnings"
            sub="Payouts and session history"
            onPress={() => router.push('/(tabs)/more/earnings')}
          />
          <View style={styles.divider} />
          <Row
            label="Profile"
            sub="Your listing and credentials"
            onPress={() => router.push('/(tabs)/more/profile')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <Row
            label="Manage plan"
            sub="Subscription billing"
            onPress={() => Linking.openURL(`${API_URL}/teacher/billing`)}
          />
          <View style={styles.divider} />
          <Row
            label="Settings"
            sub="Biometric lock, notifications"
            onPress={() => router.push('/(tabs)/more/settings')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.card}>
          <Row label="Sign out" onPress={() => signOut()} destructive />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A3A2A' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowMeta: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: '#111827' },
  rowDestructive: { color: '#DC2626' },
  rowSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  chevron: { fontSize: 20, color: '#D1D5DB' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 16 },
})

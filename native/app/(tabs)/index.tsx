import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-expo'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useApiFetch } from '@/lib/api'
import { DashboardSchema } from '@/dtos/dashboard'
import type { SessionSummary, Alert } from '@/dtos/dashboard'

function pence(p: number) {
  return `£${(p / 100).toFixed(0)}`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function AlertBanner({ alert }: { alert: Alert }) {
  const critical = alert.severity === 'critical'
  return (
    <View style={[styles.alertBanner, critical ? styles.alertCritical : styles.alertWarning]}>
      <Text style={[styles.alertText, critical ? styles.alertTextCritical : styles.alertTextWarning]}>
        {alert.message}
      </Text>
    </View>
  )
}

function SessionCard({ session }: { session: SessionSummary }) {
  const router = useRouter()
  const name = `${session.clientFirstName} ${session.clientLastName}`
  const time = formatTime(session.scheduledAt)

  return (
    <TouchableOpacity
      style={styles.sessionCard}
      onPress={() => router.push(`/session/${session.id}` as never)}
      activeOpacity={session.isJoinable ? 0.8 : 1}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${time}${session.isJoinable ? ', joinable now' : ''}`}
    >
      <View style={styles.sessionMeta}>
        <Text style={styles.sessionName}>{name}</Text>
        <Text style={styles.sessionTime}>{time} · {session.durationMins} min</Text>
      </View>
      {session.isJoinable && (
        <View style={styles.joinBadge}>
          <Text style={styles.joinBadgeText}>Join →</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export default function DashboardScreen() {
  const { signOut } = useAuth()
  const router = useRouter()
  const apiFetch = useApiFetch()

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch('/api/mobile/v1/dashboard', DashboardSchema),
  })

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#1A3A2A" />
      </SafeAreaView>
    )
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>Could not load dashboard.</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Retry loading dashboard"
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const { teacher, todaySessions, upcomingSessions, earnings, activeClientCount, unreadMessageCount, alerts } = data

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A3A2A" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {teacher.firstName} {teacher.lastName}
            </Text>
            <Text style={styles.subGreeting}>
              {teacher.registrationBody} · {pence(teacher.sessionRatePence)}/session
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => signOut()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>

        {/* Alerts */}
        {alerts.map((a, i) => (
          <AlertBanner key={i} alert={a} />
        ))}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todaySessions.length}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeClientCount}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pence(earnings.monthTotalPence)}</Text>
            <Text style={styles.statLabel}>This month</Text>
          </View>
          {unreadMessageCount > 0 && (
            <TouchableOpacity
              style={[styles.statCard, styles.statCardUnread]}
              onPress={() => router.push('/(tabs)/messages/')}
              accessibilityRole="button"
              accessibilityLabel={`${unreadMessageCount} unread messages`}
            >
              <Text style={[styles.statValue, styles.statValueUnread]}>{unreadMessageCount}</Text>
              <Text style={styles.statLabel}>Unread</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Today's sessions */}
        <Text style={styles.sectionTitle}>Today</Text>
        {todaySessions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No sessions today</Text>
          </View>
        ) : (
          <View style={styles.card}>
            {todaySessions.map((s, i) => (
              <View key={s.id} style={i > 0 ? styles.divider : undefined}>
                <SessionCard session={s} />
              </View>
            ))}
          </View>
        )}

        {/* Upcoming */}
        {upcomingSessions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <View style={styles.card}>
              {upcomingSessions.map((s, i) => (
                <View key={s.id} style={i > 0 ? styles.divider : undefined}>
                  <View>
                    <Text style={styles.upcomingDate}>{formatDate(s.scheduledAt)}</Text>
                    <SessionCard session={s} />
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0E8' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#1A3A2A' },
  subGreeting: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  signOutText: { fontSize: 13, color: '#6B7280' },

  alertBanner: { borderRadius: 10, padding: 12, marginBottom: 10 },
  alertWarning: { backgroundColor: '#FEF3C7' },
  alertCritical: { backgroundColor: '#FEE2E2' },
  alertText: { fontSize: 13 },
  alertTextWarning: { color: '#92400E' },
  alertTextCritical: { color: '#991B1B' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statCardUnread: { borderColor: '#1A3A2A' },
  statValue: { fontSize: 20, fontWeight: '700', color: '#111827' },
  statValueUnread: { color: '#1A3A2A' },
  statLabel: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },

  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', marginBottom: 20 },
  divider: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },

  sessionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  sessionMeta: { flex: 1 },
  sessionName: { fontSize: 15, fontWeight: '500', color: '#111827' },
  sessionTime: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  joinBadge: { backgroundColor: '#1A3A2A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  joinBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  upcomingDate: { fontSize: 11, color: '#9CA3AF', paddingHorizontal: 14, paddingTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  emptyCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 24, alignItems: 'center', marginBottom: 20 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  errorText: { color: '#374151', fontSize: 15, marginBottom: 16 },
  retryButton: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '500' },
})

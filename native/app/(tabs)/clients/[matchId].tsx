import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { useApiFetch } from '@/lib/api'
import { ClientDetailSchema } from '@/dtos/client-detail'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://faresay.com'

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
  IN_PROGRESS: 'In progress',
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: '#1A3A2A',
  COMPLETED: '#6B7280',
  CANCELLED: '#DC2626',
  NO_SHOW: '#D97706',
  IN_PROGRESS: '#059669',
}

function pence(p: number, sym = '£') {
  return `${sym}${(p / 100).toFixed(0)}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function ClientDetailScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>()
  const router = useRouter()
  const apiFetch = useApiFetch()
  const { getToken } = useAuth()
  const qc = useQueryClient()

  const [showBooking, setShowBooking] = useState(false)
  const [bookDate, setBookDate] = useState(() => {
    const d = new Date()
    d.setHours(10, 0, 0, 0)
    d.setDate(d.getDate() + 1)
    return d
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['client', matchId],
    queryFn: () => apiFetch(`/api/mobile/v1/clients/${matchId}`, ClientDetailSchema),
    enabled: !!matchId,
  })

  const bookMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/practice/booking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ matchId, scheduledAt: bookDate.toISOString(), durationMins: 50 }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error ?? 'Booking failed')
      }
      return res.json()
    },
    onSuccess: () => {
      setShowBooking(false)
      qc.invalidateQueries({ queryKey: ['client', matchId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      Alert.alert('Booked', 'Session scheduled. Your client will receive an email confirmation.')
    },
    onError: (e: Error) => {
      Alert.alert('Could not book', e.message)
    },
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
        <Text style={styles.errorText}>Could not load client.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const { client, upcomingSessions, pastSessions, documents, outcomeScores, forms, notes } = data

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookButton} onPress={() => setShowBooking(true)}>
          <Text style={styles.bookButtonText}>+ Book session</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Identity */}
        <View style={styles.identityRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {client.firstName[0]}{client.lastName[0]}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{client.firstName} {client.lastName}</Text>
            {client.contactEmail && <Text style={styles.email}>{client.contactEmail}</Text>}
            {client.phone && <Text style={styles.email}>{client.phone}</Text>}
          </View>
        </View>

        {/* Working notes */}
        {notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.card}>
              <Text style={styles.noteBody}>{notes}</Text>
            </View>
          </View>
        )}

        {/* Upcoming sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming sessions</Text>
          {upcomingSessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming sessions</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {upcomingSessions.map((s, i) => (
                <View key={s.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{fmtDateTime(s.scheduledAt)}</Text>
                    <Text style={styles.rowSub}>{s.durationMins} min</Text>
                  </View>
                  <Text style={[styles.badge, { color: STATUS_COLOR[s.status] ?? '#6B7280' }]}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Forms */}
        {forms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Forms</Text>
            <View style={styles.card}>
              {forms.map((f, i) => (
                <View key={f.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{f.title}</Text>
                    <Text style={styles.rowSub}>{f.type} · {fmtDate(f.sentAt)}</Text>
                  </View>
                  <Text
                    style={[
                      styles.badge,
                      { color: f.status === 'completed' ? '#059669' : '#D97706' },
                    ]}
                  >
                    {f.status === 'completed' ? 'Complete' : 'Pending'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Outcome scores */}
        {outcomeScores.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Outcome scores</Text>
            <View style={styles.card}>
              {outcomeScores.map((o, i) => (
                <View key={o.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{o.measureName ?? o.measure}</Text>
                    <Text style={styles.rowSub}>{fmtDate(o.takenOn)}</Text>
                  </View>
                  <Text style={styles.scoreValue}>{o.score}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <View style={styles.card}>
              {documents.map((d, i) => (
                <View key={d.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{d.label}</Text>
                    <Text style={styles.rowSub}>{d.category} · {fmtDate(d.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Session history */}
        {pastSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Session history</Text>
            <View style={styles.card}>
              {pastSessions.slice(0, 10).map((s, i) => (
                <View key={s.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{fmtDateTime(s.scheduledAt)}</Text>
                    {s.payment && (
                      <Text style={styles.rowSub}>
                        {pence(s.payment.therapistPayoutPence)} earned
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.badge, { color: STATUS_COLOR[s.status] ?? '#6B7280' }]}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book session modal */}
      <Modal visible={showBooking} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBooking(false)} hitSlop={12}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Book session</Text>
            <View style={{ width: 60 }} />
          </View>

          <View style={styles.modalBody}>
            <Text style={styles.modalLabel}>Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setShowDatePicker(true)
                setShowTimePicker(false)
              }}
            >
              <Text style={styles.dateButtonText}>
                {bookDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.modalLabel, { marginTop: 16 }]}>Time</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => {
                setShowTimePicker(true)
                setShowDatePicker(false)
              }}
            >
              <Text style={styles.dateButtonText}>
                {bookDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            {(showDatePicker || showTimePicker) && (
              <DateTimePicker
                value={bookDate}
                mode={showDatePicker ? 'date' : 'time'}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(_e, d) => {
                  if (d) setBookDate(d)
                  if (Platform.OS === 'android') {
                    setShowDatePicker(false)
                    setShowTimePicker(false)
                  }
                }}
              />
            )}

            <Text style={styles.durationNote}>Duration: 50 minutes (default)</Text>

            <TouchableOpacity
              style={[styles.confirmButton, bookMutation.isPending && styles.buttonDisabled]}
              onPress={() => bookMutation.mutate()}
              disabled={bookMutation.isPending}
            >
              {bookMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm booking</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0E8' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 8 },
  back: { fontSize: 17, color: '#1A3A2A' },
  bookButton: { backgroundColor: '#1A3A2A', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  bookButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 24 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#065F46' },
  name: { fontSize: 20, fontWeight: '700', color: '#111827' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  rowLabel: { fontSize: 14, fontWeight: '500', color: '#111827' },
  rowSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  badge: { fontSize: 12, fontWeight: '500' },
  scoreValue: { fontSize: 18, fontWeight: '700', color: '#1A3A2A' },

  noteBody: { fontSize: 14, color: '#374151', lineHeight: 20, padding: 16 },

  emptyCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 24, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  errorText: { color: '#374151', fontSize: 15, marginBottom: 16 },
  retryButton: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '500' },

  // Booking modal
  modal: { flex: 1, backgroundColor: '#F5F0E8' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalCancel: { fontSize: 16, color: '#6B7280', width: 60 },
  modalTitle: { fontSize: 17, fontWeight: '600', color: '#111827' },
  modalBody: { padding: 24 },
  modalLabel: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  dateButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  dateButtonText: { fontSize: 16, color: '#111827' },
  durationNote: { fontSize: 13, color: '#9CA3AF', marginTop: 20, marginBottom: 8 },
  confirmButton: { marginTop: 8, backgroundColor: '#1A3A2A', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  confirmButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})

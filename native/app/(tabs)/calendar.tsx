import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useApiFetch } from '@/lib/api'
import { CalendarResponseSchema } from '@/dtos/calendar'
import { AvailabilityResponseSchema, DAY_NAMES } from '@/dtos/availability'
import type { CalendarSession } from '@/dtos/calendar'

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED: '#1A3A2A',
  IN_PROGRESS: '#059669',
  COMPLETED: '#6B7280',
  NO_SHOW: '#D97706',
}

function groupByDay(sessions: CalendarSession[]): { title: string; data: CalendarSession[] }[] {
  const map = new Map<string, CalendarSession[]>()
  for (const s of sessions) {
    const key = s.scheduledAt.slice(0, 10)
    const list = map.get(key) ?? []
    list.push(s)
    map.set(key, list)
  }
  return Array.from(map.entries()).map(([key, data]) => ({
    title: new Date(key + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }),
    data,
  }))
}

function SessionRow({ session }: { session: CalendarSession }) {
  const time = new Date(session.scheduledAt).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const color = STATUS_COLOR[session.status] ?? '#6B7280'
  return (
    <View style={styles.sessionRow}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <View style={styles.sessionMeta}>
        <Text style={styles.sessionName}>
          {session.clientFirstName} {session.clientLastName}
        </Text>
        <Text style={styles.sessionTime}>
          {time} · {session.durationMins} min
        </Text>
      </View>
      {session.isJoinable && (
        <View style={styles.joinBadge}>
          <Text style={styles.joinBadgeText}>Join now</Text>
        </View>
      )}
    </View>
  )
}

export default function CalendarScreen() {
  const apiFetch = useApiFetch()
  const [tab, setTab] = useState<'agenda' | 'availability'>('agenda')

  const now = new Date()
  const fromStr = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const toStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString()

  const calendarQuery = useQuery({
    queryKey: ['calendar', fromStr, toStr],
    queryFn: () =>
      apiFetch(`/api/mobile/v1/calendar?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`, CalendarResponseSchema),
    enabled: tab === 'agenda',
  })

  const availQuery = useQuery({
    queryKey: ['availability'],
    queryFn: () => apiFetch('/api/mobile/v1/availability', AvailabilityResponseSchema),
    enabled: tab === 'availability',
  })

  const sections = calendarQuery.data ? groupByDay(calendarQuery.data.sessions) : []

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>
        <View style={styles.tabToggle}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'agenda' && styles.tabBtnActive]}
            onPress={() => setTab('agenda')}
          >
            <Text style={[styles.tabBtnText, tab === 'agenda' && styles.tabBtnTextActive]}>
              Agenda
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'availability' && styles.tabBtnActive]}
            onPress={() => setTab('availability')}
          >
            <Text style={[styles.tabBtnText, tab === 'availability' && styles.tabBtnTextActive]}>
              Availability
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'agenda' && (
        <>
          {calendarQuery.isLoading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#1A3A2A" />
            </View>
          )}
          {calendarQuery.isError && (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Could not load calendar.</Text>
              <TouchableOpacity onPress={() => calendarQuery.refetch()} style={styles.retryButton}>
                <Text style={styles.retryText}>Try again</Text>
              </TouchableOpacity>
            </View>
          )}
          {calendarQuery.data && sections.length === 0 && (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No sessions in the next 30 days</Text>
            </View>
          )}
          {calendarQuery.data && sections.length > 0 && (
            <SectionList
              sections={sections}
              keyExtractor={s => s.id}
              renderItem={({ item }) => <SessionRow session={item} />}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.dayHeader}>
                  <Text style={styles.dayHeaderText}>{title}</Text>
                </View>
              )}
              refreshControl={
                <RefreshControl
                  refreshing={calendarQuery.isRefetching}
                  onRefresh={() => calendarQuery.refetch()}
                  tintColor="#1A3A2A"
                />
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      )}

      {tab === 'availability' && (
        <>
          {availQuery.isLoading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#1A3A2A" />
            </View>
          )}
          {availQuery.isError && (
            <View style={styles.centered}>
              <Text style={styles.errorText}>Could not load availability.</Text>
            </View>
          )}
          {availQuery.data && (
            <SectionList
              sections={[{ title: `Timezone: ${availQuery.data.timezone}`, data: availQuery.data.availability }]}
              keyExtractor={w => w.id}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.dayHeader}>
                  <Text style={styles.dayHeaderText}>{title}</Text>
                </View>
              )}
              renderItem={({ item: w }) => (
                <View style={styles.availRow}>
                  <Text style={styles.availDay}>{DAY_NAMES[w.dayOfWeek]}</Text>
                  <Text style={styles.availTime}>{w.startTime} – {w.endTime}</Text>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={styles.emptyText}>No availability set</Text>
                  <Text style={styles.emptyHint}>Edit your availability at faresay.com</Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A3A2A', marginBottom: 12 },

  tabToggle: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 20, padding: 3, alignSelf: 'flex-start' },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 18 },
  tabBtnActive: { backgroundColor: '#fff' },
  tabBtnText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  tabBtnTextActive: { color: '#1A3A2A', fontWeight: '600' },

  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  dayHeader: { paddingVertical: 8, paddingHorizontal: 4, marginTop: 12 },
  dayHeaderText: { fontSize: 13, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },

  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  sessionMeta: { flex: 1 },
  sessionName: { fontSize: 15, fontWeight: '500', color: '#111827' },
  sessionTime: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  joinBadge: { backgroundColor: '#1A3A2A', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  joinBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  availDay: { fontSize: 15, fontWeight: '600', color: '#1A3A2A', width: 44 },
  availTime: { fontSize: 15, color: '#374151' },

  errorText: { color: '#374151', fontSize: 15, marginBottom: 16 },
  retryButton: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  emptyText: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
  emptyHint: { color: '#D1D5DB', fontSize: 12 },
})

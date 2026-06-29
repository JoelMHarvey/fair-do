import { useQuery } from '@tanstack/react-query'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useApiFetch } from '@/lib/api'
import { ClientsResponseSchema } from '@/dtos/clients'
import type { ClientSummary } from '@/dtos/clients'

function ClientRow({ client }: { client: ClientSummary }) {
  const router = useRouter()
  const initials = `${client.firstName[0]}${client.lastName[0]}`.toUpperCase()
  const hasNextSession = client.nextSession != null
  const nextDate = hasNextSession
    ? new Date(client.nextSession!.scheduledAt).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    : null

  const a11yLabel = [
    `${client.firstName} ${client.lastName}`,
    hasNextSession ? `Next session ${nextDate}` : 'No upcoming sessions',
    client.unreadMessages > 0 ? `${client.unreadMessages} unread messages` : '',
    client.pendingForms > 0 ? `${client.pendingForms} forms pending` : '',
  ].filter(Boolean).join(', ')

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/(tabs)/clients/${client.matchId}`)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.rowMeta}>
        <View style={styles.rowTop}>
          <Text style={styles.clientName}>
            {client.firstName} {client.lastName}
          </Text>
          {client.unreadMessages > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{client.unreadMessages}</Text>
            </View>
          )}
        </View>
        <Text style={styles.clientSub}>
          {hasNextSession ? `Next: ${nextDate}` : 'No upcoming sessions'}
          {client.pendingForms > 0 ? ` · ${client.pendingForms} form${client.pendingForms > 1 ? 's' : ''} pending` : ''}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  )
}

export default function ClientsScreen() {
  const apiFetch = useApiFetch()

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiFetch('/api/mobile/v1/clients', ClientsResponseSchema),
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
        <Text style={styles.errorText}>Could not load clients.</Text>
        <TouchableOpacity
          onPress={() => refetch()}
          style={styles.retryButton}
          accessibilityRole="button"
          accessibilityLabel="Retry loading clients"
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Clients</Text>
        <Text style={styles.count}>{data.clients.length} active</Text>
      </View>
      <FlatList
        data={data.clients}
        keyExtractor={c => c.matchId}
        renderItem={({ item }) => <ClientRow client={item} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A3A2A" />}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No active clients yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0E8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', padding: 20, paddingBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A3A2A' },
  count: { fontSize: 13, color: '#9CA3AF' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: '#F3F4F6' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 15, fontWeight: '600', color: '#065F46' },
  rowMeta: { flex: 1 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clientName: { fontSize: 15, fontWeight: '500', color: '#111827' },
  clientSub: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  chevron: { fontSize: 20, color: '#D1D5DB', marginLeft: 8 },

  unreadBadge: { backgroundColor: '#1A3A2A', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  emptyCard: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 32, alignItems: 'center', marginTop: 8 },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  errorText: { color: '#374151', fontSize: 15, marginBottom: 16 },
  retryButton: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '500' },
})

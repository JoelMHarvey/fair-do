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
import { EarningsResponseSchema } from '@/dtos/earnings'
import type { EarningsResponse } from '@/dtos/earnings'

function fmt(pence: number, sym: string) {
  return `${sym}${(pence / 100).toFixed(2)}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

type Payment = EarningsResponse['payments'][number]

function PaymentRow({ payment, sym }: { payment: Payment; sym: string }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.clientName}>
          {payment.clientFirstName} {payment.clientLastName}
        </Text>
        <Text style={styles.rowSub}>
          {payment.sessionScheduledAt ? fmtDate(payment.sessionScheduledAt) : fmtDate(payment.createdAt)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.amount}>{fmt(payment.therapistPayoutPence, sym)}</Text>
        <Text style={styles.fee}>fee {fmt(payment.platformFeePence, sym)}</Text>
      </View>
    </View>
  )
}

export default function EarningsScreen() {
  const router = useRouter()
  const apiFetch = useApiFetch()

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['earnings'],
    queryFn: () => apiFetch('/api/mobile/v1/earnings', EarningsResponseSchema),
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
        <Text style={styles.errorText}>Could not load earnings.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const { currencySymbol: sym, monthTotalPence, allTimeTotalPence, payments } = data

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Earnings</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={payments}
        keyExtractor={p => p.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A3A2A" />}
        ListHeaderComponent={
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>This month</Text>
              <Text style={styles.statValue}>{fmt(monthTotalPence, sym)}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>All time</Text>
              <Text style={styles.statValue}>{fmt(allTimeTotalPence, sym)}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No paid sessions yet</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.card, index === 0 && styles.cardFirst]}>
            <PaymentRow payment={item} sym={sym} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0E8' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
  back: { fontSize: 17, color: '#1A3A2A', width: 60 },
  title: { fontSize: 20, fontWeight: '700', color: '#1A3A2A' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', padding: 16 },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#111827' },

  listContent: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 0 },
  cardFirst: { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
  separator: { height: 1, backgroundColor: '#F3F4F6' },

  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  clientName: { fontSize: 15, fontWeight: '500', color: '#111827' },
  rowSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '600', color: '#111827' },
  fee: { fontSize: 11, color: '#D1D5DB', marginTop: 2 },

  empty: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  errorText: { color: '#374151', fontSize: 15, marginBottom: 16 },
  retryButton: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '500' },
})

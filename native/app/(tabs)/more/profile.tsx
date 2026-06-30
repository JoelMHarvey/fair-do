import { useQuery } from '@tanstack/react-query'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useApiFetch } from '@/lib/api'
import { ProfileResponseSchema } from '@/dtos/profile'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://fair-do.com'

function pence(p: number) {
  return `£${(p / 100).toFixed(0)}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

const STATUS_COLOR = { PENDING: '#D97706', ACTIVE: '#059669', SUSPENDED: '#DC2626' } as const
const STATUS_LABEL = { PENDING: 'Under review', ACTIVE: 'Active', SUSPENDED: 'Suspended' } as const

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const router = useRouter()
  const apiFetch = useApiFetch()

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['profile'],
    queryFn: () => apiFetch('/api/mobile/v1/profile', ProfileResponseSchema),
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
        <Text style={styles.errorText}>Could not load profile.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const statusColor = STATUS_COLOR[data.status] ?? '#6B7280'
  const statusLabel = STATUS_LABEL[data.status] ?? data.status

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL(`${API_URL}/teacher/profile`)}
        >
          <Text style={styles.editLink}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A3A2A" />}
      >
        {/* Identity */}
        <View style={styles.identityCard}>
          <View style={styles.avatarBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{data.firstName[0]}{data.lastName[0]}</Text>
            </View>
          </View>
          <Text style={styles.fullName}>{data.firstName} {data.lastName}</Text>
          {data.professionalTitle && <Text style={styles.title2}>{data.professionalTitle}</Text>}
          {data.tagline && <Text style={styles.tagline}>{data.tagline}</Text>}
          <View style={[styles.statusBadge, { borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {/* Rates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rates</Text>
          <View style={styles.card}>
            <InfoRow label="Standard" value={pence(data.sessionRatePence) + '/session'} />
            {data.introRatePence != null && (
              <>
                <View style={styles.divider} />
                <InfoRow label="Intro rate" value={pence(data.introRatePence) + '/session'} />
              </>
            )}
          </View>
        </View>

        {/* Credentials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credentials</Text>
          <View style={styles.card}>
            <InfoRow label="Registration" value={`${data.registrationBody} · ${data.registrationNumber}`} />
            <View style={styles.divider} />
            <InfoRow label="Expires" value={fmtDate(data.registrationExpiry)} />
            {data.insuranceProvider && (
              <>
                <View style={styles.divider} />
                <InfoRow label="Insurance" value={data.insuranceProvider} />
              </>
            )}
            {data.insuranceExpiry && (
              <>
                <View style={styles.divider} />
                <InfoRow label="Insurance expires" value={fmtDate(data.insuranceExpiry)} />
              </>
            )}
            <View style={styles.divider} />
            <InfoRow label="Verified" value={data.credentialVerified ? 'Yes' : 'Pending'} />
          </View>
        </View>

        {/* Practice */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice</Text>
          <View style={styles.card}>
            <InfoRow label="Name" value={data.practiceName ?? `${data.firstName} ${data.lastName}`} />
            {data.practiceSlug && (
              <>
                <View style={styles.divider} />
                <InfoRow label="URL" value={`fair-do.com/p/${data.practiceSlug}`} />
              </>
            )}
            <View style={styles.divider} />
            <InfoRow label="Accepting clients" value={data.availableForNew ? 'Yes' : 'No'} />
            <View style={styles.divider} />
            <InfoRow label="Languages" value={data.languages.join(', ')} />
          </View>
        </View>

        {data.specialisms.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Specialisms</Text>
            <View style={styles.tagRow}>
              {data.specialisms.map(s => (
                <View key={s} style={styles.tag}>
                  <Text style={styles.tagText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {data.approachTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Approaches</Text>
            <View style={styles.tagRow}>
              {data.approachTags.map(t => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => Linking.openURL(`${API_URL}/teacher/profile`)}
        >
          <Text style={styles.editButtonText}>Edit profile on fair-do →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F0E8' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0E8' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 8 },
  back: { fontSize: 17, color: '#1A3A2A', width: 60 },
  title: { fontSize: 20, fontWeight: '700', color: '#1A3A2A' },
  editLink: { fontSize: 15, color: '#1A3A2A', fontWeight: '500', width: 60, textAlign: 'right' },

  identityCard: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', padding: 20, alignItems: 'center', marginBottom: 20 },
  avatarBlock: { marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '700', color: '#065F46' },
  fullName: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  title2: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  tagline: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 10 },
  statusBadge: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, paddingLeft: 4 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  infoLabel: { fontSize: 14, color: '#9CA3AF' },
  infoValue: { fontSize: 14, color: '#111827', fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: 12 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 16 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 13, color: '#374151' },

  editButton: { marginTop: 8, padding: 16, alignItems: 'center' },
  editButtonText: { fontSize: 14, color: '#1A3A2A', fontWeight: '500' },

  errorText: { color: '#374151', fontSize: 15, marginBottom: 16 },
  retryButton: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '500' },
})

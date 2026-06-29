import { useQuery } from '@tanstack/react-query'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import { useApiFetch } from '@/lib/api'
import { SessionRoomSchema } from '@/dtos/session-room'

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SessionJoinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const apiFetch = useApiFetch()

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['session-room', id],
    queryFn: () => apiFetch(`/api/mobile/v1/sessions/${id}/room`, SessionRoomSchema),
    // Don't cache — token has a short window
    staleTime: 0,
    gcTime: 0,
    enabled: !!id,
    retry: false,
  })

  async function joinCall() {
    if (!data) return
    const url = data.meetingToken
      ? `${data.roomUrl}?t=${data.meetingToken}`
      : data.roomUrl

    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    })
  }

  const errMsg =
    isError && error instanceof Error ? error.message : 'Could not load session room.'

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {isLoading && (
          <>
            <ActivityIndicator size="large" color="#1A3A2A" />
            <Text style={styles.loadingText}>Preparing session room…</Text>
          </>
        )}

        {isError && (
          <>
            <Text style={styles.errorTitle}>Can't join yet</Text>
            <Text style={styles.errorBody}>{errMsg}</Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </>
        )}

        {data && (
          <>
            <View style={styles.clientCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {data.clientFirstName[0]}{data.clientLastName[0]}
                </Text>
              </View>
              <Text style={styles.clientName}>
                {data.clientFirstName} {data.clientLastName}
              </Text>
              <Text style={styles.scheduledAt}>{fmtDateTime(data.scheduledAt)}</Text>
            </View>

            <TouchableOpacity
              style={styles.joinButton}
              onPress={joinCall}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Join session with ${data.clientFirstName} ${data.clientLastName}`}
            >
              <Text style={styles.joinButtonText}>Join session</Text>
            </TouchableOpacity>

            <Text style={styles.joinNote}>
              Opens in your browser. Return to Faresay when done.
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F2419' },
  header: { padding: 20 },
  back: { fontSize: 17, color: '#86EFAC' },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  loadingText: { color: '#86EFAC', fontSize: 15, marginTop: 16 },

  clientCard: { alignItems: 'center', marginBottom: 48 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#166534', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#86EFAC' },
  clientName: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 8 },
  scheduledAt: { fontSize: 14, color: '#86EFAC', textAlign: 'center' },

  joinButton: { width: '100%', backgroundColor: '#16A34A', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  joinButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  joinNote: { fontSize: 13, color: '#4ADE80', textAlign: 'center', opacity: 0.7 },

  errorTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 12, textAlign: 'center' },
  errorBody: { fontSize: 14, color: '#86EFAC', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  retryButton: { backgroundColor: '#166534', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  retryText: { color: '#fff', fontSize: 15, fontWeight: '600' },
})

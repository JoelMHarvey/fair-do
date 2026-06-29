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
import { useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { useApiFetch } from '@/lib/api'
import { ThreadsResponseSchema } from '@/dtos/messages'
import type { ThreadSummary } from '@/dtos/messages'

function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

function ThreadRow({ thread }: { thread: ThreadSummary }) {
  const router = useRouter()
  const initials = `${thread.clientFirstName[0]}${thread.clientLastName[0]}`.toUpperCase()

  const a11yLabel = [
    `${thread.clientFirstName} ${thread.clientLastName}`,
    thread.unreadCount > 0 ? `${thread.unreadCount} unread` : '',
    thread.lastMessage ? (thread.lastMessage.isFromTherapist ? `You: ${thread.lastMessage.body}` : thread.lastMessage.body) : '',
  ].filter(Boolean).join(', ')

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/(tabs)/messages/${thread.id}` as never)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        {thread.unreadCount > 0 && (
          <View style={styles.unreadDot}>
            <Text style={styles.unreadDotText}>{thread.unreadCount}</Text>
          </View>
        )}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.clientName, thread.unreadCount > 0 && styles.clientNameBold]}>
            {thread.clientFirstName} {thread.clientLastName}
          </Text>
          <Text style={styles.time}>{relativeTime(thread.updatedAt)}</Text>
        </View>
        {thread.lastMessage && (
          <Text
            style={[styles.preview, thread.unreadCount > 0 && styles.previewBold]}
            numberOfLines={1}
          >
            {thread.lastMessage.isFromTherapist ? 'You: ' : ''}
            {thread.lastMessage.body}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

export default function MessagesScreen() {
  const apiFetch = useApiFetch()

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['message-threads'],
    queryFn: () => apiFetch('/api/mobile/v1/messages/threads', ThreadsResponseSchema),
  })

  // Refresh on tab focus so unread counts update when returning from a thread
  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch]),
  )

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
        <Text style={styles.errorText}>Could not load messages.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>
      <FlatList
        data={data.threads}
        keyExtractor={t => t.id}
        renderItem={({ item }) => <ThreadRow thread={item} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#1A3A2A" />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No message threads yet</Text>
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
  header: { padding: 20, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1A3A2A' },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 74 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, backgroundColor: '#F5F0E8' },
  avatarWrap: { position: 'relative', marginRight: 14 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#065F46' },
  unreadDot: { position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#1A3A2A', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#F5F0E8' },
  unreadDotText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  clientName: { fontSize: 15, color: '#374151' },
  clientNameBold: { fontWeight: '600', color: '#111827' },
  time: { fontSize: 12, color: '#9CA3AF' },
  preview: { fontSize: 14, color: '#9CA3AF' },
  previewBold: { color: '#374151', fontWeight: '500' },

  empty: { padding: 48, alignItems: 'center' },
  emptyText: { color: '#9CA3AF', fontSize: 14 },

  errorText: { color: '#374151', fontSize: 15, marginBottom: 16 },
  retryButton: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '500' },
})

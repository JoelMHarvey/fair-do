import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { useApiFetch } from '@/lib/api'
import { ThreadDetailSchema } from '@/dtos/messages'
import type { Message } from '@/dtos/messages'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://fair-do.com'

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function MessageBubble({ msg }: { msg: Message }) {
  const mine = msg.isFromTeacher
  return (
    <View style={[styles.bubbleWrap, mine ? styles.bubbleWrapRight : styles.bubbleWrapLeft]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
          {msg.body}
        </Text>
      </View>
      <Text style={[styles.bubbleTime, mine ? styles.bubbleTimeRight : styles.bubbleTimeLeft]}>
        {fmtTime(msg.createdAt)}
      </Text>
    </View>
  )
}

// Group messages by day and return flat list with day header items interspersed
type ListItem = { type: 'day'; label: string; key: string } | { type: 'msg'; msg: Message }

function buildList(messages: Message[]): ListItem[] {
  const items: ListItem[] = []
  let lastDay = ''
  for (const msg of messages) {
    const day = msg.createdAt.slice(0, 10)
    if (day !== lastDay) {
      items.push({ type: 'day', label: fmtDay(msg.createdAt), key: day })
      lastDay = day
    }
    items.push({ type: 'msg', msg })
  }
  return items
}

export default function ThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>()
  const router = useRouter()
  const apiFetch = useApiFetch()
  const { getToken } = useAuth()
  const qc = useQueryClient()
  const flatListRef = useRef<FlatList>(null)
  const [draft, setDraft] = useState('')

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['thread', threadId],
    queryFn: () => apiFetch(`/api/mobile/v1/messages/threads/${threadId}`, ThreadDetailSchema),
    enabled: !!threadId,
  })

  // Refetch on focus (updates read state + new messages)
  useFocusEffect(
    useCallback(() => {
      refetch()
    }, [refetch]),
  )

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      const token = await getToken()
      const res = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ threadId, body }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error((j as { error?: string }).error ?? 'Send failed')
      }
      return res.json()
    },
    onSuccess: () => {
      setDraft('')
      refetch()
      qc.invalidateQueries({ queryKey: ['message-threads'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150)
    },
    onError: (e: Error) => Alert.alert('Could not send', e.message),
  })

  function send() {
    const text = draft.trim()
    if (!text || sendMutation.isPending) return
    sendMutation.mutate(text)
  }

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.errorText}>Could not load thread.</Text>
        <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const items = buildList(data.messages)

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>
            {data.student.firstName} {data.student.lastName}
          </Text>
        </View>
        <View style={{ width: 32 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={items}
          keyExtractor={(item, i) =>
            item.type === 'day' ? item.key : item.msg.id + i
          }
          renderItem={({ item }) =>
            item.type === 'day' ? (
              <Text style={styles.dayLabel}>{item.label}</Text>
            ) : (
              <MessageBubble msg={item.msg} />
            )
          }
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
          }
        />

        <View style={styles.compose}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={4000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!draft.trim() || sendMutation.isPending) && styles.sendBtnDisabled]}
            onPress={send}
            disabled={!draft.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendBtnText}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F0E8' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', backgroundColor: '#fff' },
  back: { fontSize: 24, color: '#1A3A2A', width: 32 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  backRow: { alignSelf: 'flex-start', padding: 20 },

  listContent: { paddingHorizontal: 16, paddingVertical: 12, flexGrow: 1 },
  dayLabel: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginVertical: 16, fontWeight: '500' },

  bubbleWrap: { marginBottom: 6 },
  bubbleWrapLeft: { alignItems: 'flex-start' },
  bubbleWrapRight: { alignItems: 'flex-end' },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: '#1A3A2A', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#F3F4F6', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMine: { color: '#fff' },
  bubbleTextTheirs: { color: '#111827' },
  bubbleTime: { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  bubbleTimeLeft: { marginLeft: 4 },
  bubbleTimeRight: { marginRight: 4 },

  compose: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#111827', maxHeight: 120, marginRight: 8 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1A3A2A', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },

  emptyText: { textAlign: 'center', color: '#9CA3AF', fontSize: 14, marginTop: 60 },
  errorText: { color: '#374151', fontSize: 15, marginBottom: 16 },
  retryButton: { backgroundColor: '#1A3A2A', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '500' },
})

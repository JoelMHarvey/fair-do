import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import NetInfo from '@react-native-community/netinfo'

export function OfflineBanner() {
  const [offline, setOffline] = useState(false)
  const opacity = useState(new Animated.Value(0))[0]

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => {
      const isOffline = state.isConnected === false
      setOffline(isOffline)
      Animated.timing(opacity, {
        toValue: isOffline ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    })
    return () => unsub()
  }, [opacity])

  if (!offline) return null

  return (
    <Animated.View
      style={[styles.banner, { opacity }]}
      accessibilityRole="alert"
      accessibilityLabel="No internet connection"
    >
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1F2937',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: { color: '#F9FAFB', fontSize: 13, fontWeight: '500' },
})

import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'

type TabIconProps = { focused: boolean; label: string; icon: string }

function TabIcon({ focused, label, icon }: TabIconProps) {
  return (
    <View style={styles.icon}>
      <Text style={[styles.emoji, focused && styles.emojiActive]}>{icon}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  )
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Home" icon="🏠" />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Students" icon="👥" />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Calendar" icon="📅" />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="Messages" icon="💬" />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} label="More" icon="⋯" />
          ),
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#fff',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    height: 80,
    paddingBottom: 8,
  },
  icon: { alignItems: 'center', justifyContent: 'center', paddingTop: 4 },
  emoji: { fontSize: 22, opacity: 0.4 },
  emojiActive: { opacity: 1 },
  label: { fontSize: 10, color: '#9CA3AF', marginTop: 3 },
  labelActive: { color: '#1A3A2A', fontWeight: '600' },
})

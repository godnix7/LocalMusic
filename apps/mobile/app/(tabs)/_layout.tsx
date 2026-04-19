import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { usePlayerStore } from '../../src/store/playerStore'
import MiniPlayer from '../../src/components/MiniPlayer'
import { colors, radii } from '../../src/theme/tokens'

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.icon, { opacity: focused ? 1 : 0.45, transform: [{ scale: focused ? 1.1 : 1 }] }]}>{icon}</Text>
      <Text style={[styles.label, { color: focused ? colors.primary : colors.textMuted }]}>{label}</Text>
    </View>
  )
}

export default function TabsLayout() {
  const { isMiniPlayerVisible } = usePlayerStore()

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ),
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⊞" label="Home"    focused={focused} /> }}
        />
        <Tabs.Screen
          name="search"
          options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⌕" label="Search"  focused={focused} /> }}
        />
        <Tabs.Screen
          name="library"
          options={{ tabBarIcon: ({ focused }) => <TabIcon icon="⊟" label="Library" focused={focused} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ tabBarIcon: ({ focused }) => <TabIcon icon="◉" label="Profile" focused={focused} /> }}
        />
      </Tabs>
      {isMiniPlayerVisible && <MiniPlayer />}
    </View>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: 'transparent',
    height: 64,
    elevation: 0,
  },
  tabIcon: { alignItems: 'center', gap: 3 },
  icon:    { fontSize: 22 },
  label:   { fontSize: 10, fontWeight: '600' },
})

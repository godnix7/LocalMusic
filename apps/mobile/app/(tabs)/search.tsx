import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Dimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { usePlayerStore, DEMO_TRACKS } from '../../src/store/playerStore'
import { colors, spacing, radii, typography, layout } from '../../src/theme/tokens'

const { width } = Dimensions.get('window')

const GENRES = [
  { label: 'Hip-Hop', color: '#A855F7' }, { label: 'Pop', color: '#EC4899' },
  { label: 'R&B',     color: '#3B82F6' }, { label: 'Indie', color: '#10B981' },
  { label: 'EDM',     color: '#F59E0B' }, { label: 'Jazz', color: '#6366F1' },
  { label: 'Rock',    color: '#EF4444' }, { label: 'Classical', color: '#8B5CF6' },
]

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const { play } = usePlayerStore()

  const results = query.trim()
    ? DEMO_TRACKS.filter(t =>
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.artist.toLowerCase().includes(query.toLowerCase()) ||
        t.album.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.heading}>Search</Text>

        {/* Search bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Artists, songs, or podcasts"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {query ? (
          <>
            <Text style={styles.resultLabel}>{results.length} result{results.length !== 1 ? 's' : ''} for "{query}"</Text>
            <FlatList
              data={results}
              keyExtractor={t => t.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: layout.tabBarHeight + layout.miniPlayerHeight + 16 }}
              renderItem={({ item: t }) => (
                <TouchableOpacity style={styles.resultRow} onPress={() => play(t, results)} activeOpacity={0.8}>
                  <Image source={{ uri: t.cover }} style={styles.resultThumb} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle} numberOfLines={1}>{t.title}</Text>
                    <Text style={styles.resultSub} numberOfLines={1}>{t.artist} · {t.album}</Text>
                  </View>
                  {t.hifi && <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>HiFi</Text>}
                </TouchableOpacity>
              )}
            />
          </>
        ) : (
          <>
            <Text style={styles.browseLabel}>Browse all</Text>
            <View style={styles.genreGrid}>
              {GENRES.map(g => (
                <TouchableOpacity key={g.label} style={[styles.genreCard, { backgroundColor: g.color }]} activeOpacity={0.8}>
                  <Text style={styles.genreText}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.bg },
  container: { flex: 1, paddingHorizontal: spacing[6] },
  heading:   { ...typography.h1, marginBottom: spacing[5], marginTop: spacing[4] },

  searchBar:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], backgroundColor: colors.surfaceHigh, borderRadius: radii.full, paddingHorizontal: spacing[4], paddingVertical: 12, marginBottom: spacing[5] },
  searchIcon:  { fontSize: 20, color: colors.textMuted },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },

  resultLabel: { ...typography.caption, marginBottom: spacing[3] },
  resultRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing[3], paddingVertical: spacing[3] },
  resultThumb: { width: 52, height: 52, borderRadius: radii.md },
  resultTitle: { ...typography.bodyMd, color: colors.text },
  resultSub:   { ...typography.caption, marginTop: 2 },

  browseLabel: { ...typography.h3, marginBottom: spacing[4] },
  genreGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[3] },
  genreCard:   { width: (width - spacing[6]*2 - spacing[3]) / 2, height: 80, borderRadius: radii.xl, justifyContent: 'center', paddingLeft: spacing[4] },
  genreText:   { fontSize: 16, fontWeight: '800', color: '#fff' },
})

import { Alert, FlatList, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import RNFS from 'react-native-fs'
import { useNavigation } from '@react-navigation/native'
import { usePlayer } from '../context/PlayerContext'
import type { Track } from 'react-native-track-player'
import { Appbar, Card, List, Text, useTheme, Searchbar, IconButton, Chip } from 'react-native-paper'
import { surahNames } from '../utils/fonction'
import surahData from '../data/surah.json'
import { StorageService } from '../utils/storage'

export default function MusicListScreen() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [playCounts, setPlayCounts] = useState<Map<string, number>>(new Map())
  const navigation = useNavigation<any>()
  const { setQueue, play } = usePlayer()
  const theme = useTheme()

  const requestPerms = useCallback(async () => {
    if (Platform.OS !== 'android') return true
    const perms = []
    if (Platform.Version >= 33) perms.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO)
    else perms.push(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE)
    const result = await PermissionsAndroid.requestMultiple(perms as any)
    return Object.values(result).every(v => v === PermissionsAndroid.RESULTS.GRANTED)
  }, [])

  const scanForMp3s = useCallback(async (): Promise<Track[]> => {
    const appDir = `${RNFS.DownloadDirectoryPath}/ListenQuran/ar.alafasy`
    const exists = await RNFS.exists(appDir)
    if (!exists) return []
    const entries = await RNFS.readDir(appDir).catch(() => [])
    const found: Track[] = []
    for (const e of entries) {
      if (e.isFile() && /\.mp3$/i.test(e.name)) {
        const match = /surah(\d+)\.mp3/i.exec(e.name)
        if (match) {
          const surahNum = parseInt(match[1])
          const surahInfo = surahData.find(s => s.number === surahNum)
          const title = surahInfo ? `${surahNum}. ${surahInfo.englishName}` : `Surah ${surahNum}`
          const artist = surahInfo ? `${surahInfo.englishNameTranslation} • ${surahInfo.revelationType}` : 'ar.alafasy'

          // Try to get file duration (this is a placeholder - actual duration detection would need additional library)
          const duration = 0 // Will be updated when track is loaded

          found.push({
            id: e.path,
            url: 'file://' + e.path,
            title,
            artist,
            artwork: undefined,
            duration
          })
        }
      }
    }
    return found.sort((a, b) => {
      const aNum = parseInt(a.title?.match(/^(\d+)\./)?.[1] || '0')
      const bNum = parseInt(b.title?.match(/^(\d+)\./)?.[1] || '0')
      return aNum - bNum
    })
  }, [])

  // Filter and search tracks
  useEffect(() => {
    let filtered = tracks

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(track =>
        track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(track => favorites.has(track.id as string))
    }

    setFilteredTracks(filtered)
  }, [tracks, searchQuery, showFavoritesOnly, favorites])

  // Load favorites and play counts from storage
  useEffect(() => {
    const loadStorageData = async () => {
      const [favoritesData, playCountsData] = await Promise.all([
        StorageService.getFavorites(),
        StorageService.getPlayCounts()
      ])
      setFavorites(favoritesData)
      setPlayCounts(playCountsData)
    }
    loadStorageData()
  }, [])

  useEffect(() => {
    requestPerms().then((ok) => {
      if (!ok) return
      scanForMp3s().then(setTracks)
    })
  }, [requestPerms, scanForMp3s])

  // Refresh play counts when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const playCountsData = await StorageService.getPlayCounts()
      setPlayCounts(playCountsData)
    })
    return unsubscribe
  }, [navigation])

  const toggleFavorite = useCallback(async (trackId: string) => {
    const newFavorites = await StorageService.toggleFavorite(trackId)
    setFavorites(newFavorites)
  }, [])

  const formatDuration = useCallback((seconds: number) => {
    if (seconds === 0) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  // Update track durations when they're loaded (only once)
  useEffect(() => {
    if (tracks.length > 0 && tracks[0].duration === 0) {
      // This is a simplified approach - in a real app you'd want to load duration from metadata
      // For now, we'll use estimated durations based on surah numbers
      const updatedTracks = tracks.map(track => {
        const surahNum = parseInt(track.title?.match(/^(\d+)\./)?.[1] || '0')
        // Estimated duration based on surah (this is approximate)
        const estimatedDuration = Math.max(60, surahNum * 15) // Minimum 1 minute, roughly 15 seconds per surah number
        return { ...track, duration: estimatedDuration }
      })
      setTracks(updatedTracks)
    }
  }, [tracks.length])

  const onPressTrack = useCallback(async (item: Track) => {
    // Set all tracks as queue in numerical order and start from selected track
    Alert.alert('testid_ ' + item.id)
    const sortedTracks = [...tracks].sort((a, b) => {
      const aNum = parseInt(a.title?.match(/^(\d+)\./)?.[1] || '0')
      const bNum = parseInt(b.title?.match(/^(\d+)\./)?.[1] || '0')
      return aNum - bNum
    })
    const trackIndex = sortedTracks.findIndex(t => t.id === item.id)
    const reorderedTracks = [...sortedTracks.slice(trackIndex), ...sortedTracks.slice(0, trackIndex)]
    Alert.alert('testreorderedTracks.length' + reorderedTracks.length)
    await setQueue(reorderedTracks)
    await play()
    navigation.navigate('MusicDetailScreen', { track: item })
  }, [navigation, setQueue, play, tracks])

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Kuran-ı Kerim" />
        <Appbar.Action icon="cog" onPress={() => navigation.navigate('SettingsScreen')} />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Sûre ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterRow}>
          <Chip
            selected={showFavoritesOnly}
            onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
            icon="heart"
            style={styles.filterChip}
          >
            Favoriler
          </Chip>
          <Text variant="bodySmall" style={styles.countText}>
            {filteredTracks.length} sûre
          </Text>
        </View>
      </View>

      {tracks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={styles.emptyText}>
            MP3 dosyası bulunamadı
          </Text>
          <Text variant="bodyMedium" style={styles.emptySubtext}>
            Ayarlar'dan sûreleri indirin
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTracks}
          keyExtractor={(i) => i.id as string}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const isFavorite = favorites.has(item.id as string)
            return (
              <Card style={styles.card} onPress={() => onPressTrack(item)}>
                <List.Item
                  title={item.title}
                  description={`${item.artist}`}
                  left={(props) => <List.Icon {...props} icon="music" />}
                  right={(props) => (
                    <View style={styles.rightActions}>

                      <IconButton
                        icon={isFavorite ? "heart" : "heart-outline"}
                        size={20}
                        iconColor={isFavorite ? theme.colors.primary : undefined}
                        onPress={() => toggleFavorite(item.id as string)}
                      />
                    </View>
                  )}
                />
              </Card>
            )
          }}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { padding: 16, paddingBottom: 8 },
  searchbar: { marginBottom: 12 },
  filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  filterChip: { marginRight: 8 },
  countText: { opacity: 0.7 },
  listContainer: { padding: 16, paddingTop: 8 },
  card: { marginBottom: 8 },
  rightActions: { flexDirection: 'row', alignItems: 'center' },
  duration: { marginRight: 8, opacity: 0.7 },
  playCountContainer: { marginRight: 8 },
  playCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    textAlign: 'center'
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { textAlign: 'center', marginBottom: 8 },
  emptySubtext: { textAlign: 'center', opacity: 0.7 },
})
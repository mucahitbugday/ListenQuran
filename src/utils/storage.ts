import AsyncStorage from '@react-native-async-storage/async-storage'

const FAVORITES_KEY = 'quran_favorites'
const PLAY_COUNTS_KEY = 'quran_play_counts'

export const StorageService = {
  // Favorites management
  async getFavorites(): Promise<Set<string>> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY)
      return favorites ? new Set(JSON.parse(favorites)) : new Set()
    } catch (error) {
      console.error('Error getting favorites:', error)
      return new Set()
    }
  },

  async saveFavorites(favorites: Set<string>): Promise<void> {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]))
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  },

  async toggleFavorite(trackId: string): Promise<Set<string>> {
    try {
      const favorites = await this.getFavorites()
      if (favorites.has(trackId)) {
        favorites.delete(trackId)
      } else {
        favorites.add(trackId)
      }
      await this.saveFavorites(favorites)
      return favorites
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return new Set()
    }
  },

  // Play counts management
  async getPlayCounts(): Promise<Map<string, number>> {
    try {
      const playCounts = await AsyncStorage.getItem(PLAY_COUNTS_KEY)
      return playCounts ? new Map(JSON.parse(playCounts)) : new Map()
    } catch (error) {
      console.error('Error getting play counts:', error)
      return new Map()
    }
  },

  async savePlayCounts(playCounts: Map<string, number>): Promise<void> {
    try {
      await AsyncStorage.setItem(PLAY_COUNTS_KEY, JSON.stringify([...playCounts]))
    } catch (error) {
      console.error('Error saving play counts:', error)
    }
  },

  async incrementPlayCount(trackId: string): Promise<number> {
    try {
      const playCounts = await this.getPlayCounts()
      const currentCount = playCounts.get(trackId) || 0
      const newCount = currentCount + 1
      playCounts.set(trackId, newCount)
      await this.savePlayCounts(playCounts)
      return newCount
    } catch (error) {
      console.error('Error incrementing play count:', error)
      return 0
    }
  },

  async getPlayCount(trackId: string): Promise<number> {
    try {
      const playCounts = await this.getPlayCounts()
      return playCounts.get(trackId) || 0
    } catch (error) {
      console.error('Error getting play count:', error)
      return 0
    }
  }
}

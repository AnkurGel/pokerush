import { ref, computed } from 'vue'
import { useApi } from './useApi'
import { API_ENDPOINTS } from '../config/api'

// Shared auth state (singleton)
const user = ref(null)
const isInitialized = ref(false)
const migrationStatus = ref('idle') // 'idle' | 'migrating' | 'completed' | 'error'

export function useAuth() {
  const { get, post, setToken, getToken, isLoading, error } = useApi()

  const isLoggedIn = computed(() => !!user.value)
  const isGuest = computed(() => !user.value)

  // Initialize auth state from stored token
  async function initialize() {
    if (isInitialized.value) return

    const token = getToken()
    if (token) {
      try {
        const userData = await get(API_ENDPOINTS.me)
        user.value = userData
      } catch (err) {
        // Token is invalid, clear it
        setToken(null)
        user.value = null
      }
    }
    isInitialized.value = true
  }

  // Register a new user
  async function register(email, password, displayName) {
    try {
      const result = await post(API_ENDPOINTS.register, {
        email,
        password,
        displayName,
      })
      setToken(result.token)
      user.value = result.user
      return result
    } catch (err) {
      throw err
    }
  }

  // Login with email/password
  async function login(email, password) {
    try {
      const result = await post(API_ENDPOINTS.login, { email, password })
      setToken(result.token)
      user.value = result.user
      return result
    } catch (err) {
      throw err
    }
  }

  // Logout
  async function logout() {
    try {
      await post(API_ENDPOINTS.logout)
    } catch (err) {
      // Ignore errors on logout
    }
    setToken(null)
    user.value = null

    // Clear local race data on sign-out for privacy
    // (data is safe in cloud, will be restored on next sign-in)
    localStorage.removeItem('typeracer-personal-bests')
  }

  // Update display name
  async function updateDisplayName(displayName) {
    try {
      const updated = await post(`${API_ENDPOINTS.users}/me`, { displayName })
      user.value = { ...user.value, displayName: updated.displayName }
      return updated
    } catch (err) {
      throw err
    }
  }

  // Get current user
  async function getCurrentUser() {
    if (!getToken()) return null
    try {
      const userData = await get(API_ENDPOINTS.me)
      user.value = userData
      return userData
    } catch (err) {
      return null
    }
  }

  // Get local race history for migration
  function getLocalRaceHistory() {
    try {
      const stored = localStorage.getItem('typeracer-personal-bests')
      if (!stored) return []
      const data = JSON.parse(stored)
      return data.raceHistory || []
    } catch (err) {
      return []
    }
  }

  // Check if there's local data to migrate
  function hasLocalDataToMigrate() {
    const history = getLocalRaceHistory()
    return history.length > 0
  }

  // Migrate local race history to cloud
  async function migrateLocalData() {
    const localRaces = getLocalRaceHistory()
    if (localRaces.length === 0) {
      migrationStatus.value = 'completed'
      return { migrated: 0 }
    }

    migrationStatus.value = 'migrating'

    try {
      // Transform local race format to API format
      const racesToImport = localRaces.map(race => ({
        quoteId: race.quoteId,
        quoteSource: race.quoteSource || '',
        wpm: race.wpm,
        accuracy: race.accuracy,
        timeSeconds: race.time,
        errors: race.errors || 0,
        pokemonName: race.pokemonName || '',
        date: race.date,
      }))

      const result = await post(API_ENDPOINTS.importRaces, { races: racesToImport })

      // Keep local data intact - it serves as the display source
      // Cloud is a backup/sync, not a replacement for local storage
      // This ensures the UI continues to work after migration

      migrationStatus.value = 'completed'
      return result
    } catch (err) {
      migrationStatus.value = 'error'
      throw err
    }
  }

  // Get count of local races for display
  function getLocalRaceCount() {
    return getLocalRaceHistory().length
  }

  // Fetch cloud races and merge into local storage
  async function fetchAndMergeCloudData() {
    if (!getToken()) return { merged: 0 }

    try {
      // Fetch all races from cloud
      const response = await get(API_ENDPOINTS.races, { limit: 1000 })
      const cloudRaces = response.data || []

      if (cloudRaces.length === 0) return { merged: 0 }

      // Get current local storage
      const stored = localStorage.getItem('typeracer-personal-bests')
      const localData = stored ? JSON.parse(stored) : {
        overallBestWpm: 0,
        overallBestAccuracy: 0,
        quoteRecords: {},
        raceHistory: [],
        stats: {
          totalRaces: 0,
          totalTimeSpent: 0,
          averageWpm: 0,
          averageAccuracy: 0,
          pokemonCaught: []
        }
      }

      // Get existing local race IDs to avoid duplicates
      const localRaceIds = new Set(localData.raceHistory.map(r => r.id))

      // Transform cloud races to local format and merge
      let newRacesCount = 0
      cloudRaces.forEach(cloudRace => {
        // Skip if already in local (by matching date and wpm as a heuristic)
        const isDuplicate = localData.raceHistory.some(
          local => local.date === cloudRace.createdAt && local.wpm === cloudRace.wpm && local.quoteId === cloudRace.quoteId
        )

        if (!isDuplicate) {
          localData.raceHistory.push({
            id: cloudRace.id,
            quoteId: cloudRace.quoteId,
            quoteSource: cloudRace.quoteSource || '',
            wpm: cloudRace.wpm,
            accuracy: cloudRace.accuracy,
            time: cloudRace.timeSeconds,
            errors: cloudRace.errors || 0,
            pokemonName: cloudRace.pokemonName || '',
            date: cloudRace.createdAt
          })
          newRacesCount++
        }
      })

      // Sort by date (newest first)
      localData.raceHistory.sort((a, b) => new Date(b.date) - new Date(a.date))

      // Recalculate stats
      const history = localData.raceHistory
      if (history.length > 0) {
        const totalWpm = history.reduce((sum, r) => sum + r.wpm, 0)
        const totalAccuracy = history.reduce((sum, r) => sum + r.accuracy, 0)
        const totalTime = history.reduce((sum, r) => sum + (r.time || 0), 0)
        const pokemonSet = new Set(history.map(r => r.pokemonName).filter(Boolean))

        localData.stats = {
          totalRaces: history.length,
          totalTimeSpent: totalTime,
          averageWpm: Math.round(totalWpm / history.length),
          averageAccuracy: Math.round((totalAccuracy / history.length) * 10) / 10,
          pokemonCaught: Array.from(pokemonSet)
        }

        // Update overall bests
        localData.overallBestWpm = Math.max(...history.map(r => r.wpm))
        localData.overallBestAccuracy = Math.max(...history.map(r => r.accuracy))

        // Update quote records
        history.forEach(race => {
          const existing = localData.quoteRecords[race.quoteId]
          if (!existing || race.wpm > existing.wpm) {
            localData.quoteRecords[race.quoteId] = {
              wpm: race.wpm,
              accuracy: race.accuracy,
              time: race.time,
              date: race.date
            }
          }
        })
      }

      // Save merged data to localStorage
      localStorage.setItem('typeracer-personal-bests', JSON.stringify(localData))

      return { merged: newRacesCount, total: history.length }
    } catch (err) {
      console.error('Failed to fetch cloud data:', err)
      return { merged: 0, error: err.message }
    }
  }

  return {
    user,
    isLoggedIn,
    isGuest,
    isInitialized,
    isLoading,
    error,
    migrationStatus,
    initialize,
    register,
    login,
    logout,
    updateDisplayName,
    getCurrentUser,
    hasLocalDataToMigrate,
    migrateLocalData,
    getLocalRaceCount,
    fetchAndMergeCloudData,
  }
}

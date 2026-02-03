import { ref, watch, computed } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const storedValue = localStorage.getItem(key)
  const data = ref(storedValue ? JSON.parse(storedValue) : defaultValue)

  watch(data, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return data
}

// Generate a unique ID for race entries
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

// Default stats structure
const defaultStats = {
  totalRaces: 0,
  totalTimeSpent: 0,
  averageWpm: 0,
  averageAccuracy: 0,
  pokemonCaught: []
}

// Default data structure
const defaultData = {
  overallBestWpm: 0,
  overallBestAccuracy: 0,
  quoteRecords: {},
  raceHistory: [],
  stats: { ...defaultStats }
}

// Migrate old data format to new format
function migrateData(oldData) {
  if (!oldData) return { ...defaultData }

  return {
    overallBestWpm: oldData.overallBestWpm || 0,
    overallBestAccuracy: oldData.overallBestAccuracy || 0,
    quoteRecords: oldData.quoteRecords || {},
    raceHistory: oldData.raceHistory || [],
    stats: oldData.stats || { ...defaultStats }
  }
}

export function usePersonalBests() {
  // Load and migrate data
  const storedValue = localStorage.getItem('typeracer-personal-bests')
  const parsedData = storedValue ? JSON.parse(storedValue) : null
  const migratedData = migrateData(parsedData)

  const bests = ref(migratedData)

  // Persist changes to localStorage
  watch(bests, (newValue) => {
    localStorage.setItem('typeracer-personal-bests', JSON.stringify(newValue))
  }, { deep: true })

  function saveResult(quoteId, wpm, accuracy, time, quoteSource = '', pokemonName = '', errors = 0) {
    const now = new Date().toISOString()

    const record = {
      wpm,
      accuracy,
      time,
      date: now
    }

    // Update quote-specific record (only if better WPM)
    const currentQuoteRecord = bests.value.quoteRecords[quoteId]
    const isNewQuoteRecord = !currentQuoteRecord || wpm > currentQuoteRecord.wpm
    if (isNewQuoteRecord) {
      bests.value.quoteRecords[quoteId] = record
    }

    // Update overall bests
    const isNewOverall = wpm > bests.value.overallBestWpm
    if (isNewOverall) {
      bests.value.overallBestWpm = wpm
    }
    if (accuracy > bests.value.overallBestAccuracy) {
      bests.value.overallBestAccuracy = accuracy
    }

    // Add to race history
    const raceEntry = {
      id: generateId(),
      quoteId,
      quoteSource,
      wpm,
      accuracy,
      time,
      errors,
      pokemonName,
      date: now
    }
    bests.value.raceHistory.unshift(raceEntry) // Most recent first

    // Update aggregated stats
    updateStats(wpm, accuracy, time, pokemonName)

    // Trigger reactivity
    bests.value = { ...bests.value }

    return { isNewQuoteRecord, isNewOverall, raceEntry }
  }

  function updateStats(wpm, accuracy, time, pokemonName) {
    const stats = bests.value.stats
    const history = bests.value.raceHistory

    stats.totalRaces = history.length
    stats.totalTimeSpent += time

    // Calculate running averages
    if (history.length > 0) {
      const totalWpm = history.reduce((sum, r) => sum + r.wpm, 0)
      const totalAccuracy = history.reduce((sum, r) => sum + r.accuracy, 0)
      stats.averageWpm = Math.round(totalWpm / history.length)
      stats.averageAccuracy = Math.round((totalAccuracy / history.length) * 10) / 10
    }

    // Track unique Pokemon caught
    if (pokemonName && !stats.pokemonCaught.includes(pokemonName)) {
      stats.pokemonCaught.push(pokemonName)
    }
  }

  function getQuoteRecord(quoteId) {
    return bests.value.quoteRecords[quoteId] || null
  }

  function isNewRecord(quoteId, wpm) {
    const currentRecord = bests.value.quoteRecords[quoteId]
    return !currentRecord || wpm > currentRecord.wpm
  }

  function isNewOverallRecord(wpm) {
    return wpm > bests.value.overallBestWpm
  }

  // Race history methods
  function getRaceHistory(limit = 50, offset = 0) {
    return bests.value.raceHistory.slice(offset, offset + limit)
  }

  function getRaceHistoryByQuote(quoteId) {
    return bests.value.raceHistory.filter(r => r.quoteId === quoteId)
  }

  function getRaceHistoryByPokemon(pokemonName) {
    return bests.value.raceHistory.filter(r => r.pokemonName === pokemonName)
  }

  function getRaceHistoryByDateRange(startDate, endDate) {
    return bests.value.raceHistory.filter(r => {
      const raceDate = new Date(r.date)
      return raceDate >= startDate && raceDate <= endDate
    })
  }

  // Stats getters
  function getStats() {
    return bests.value.stats
  }

  function getPokemonCaught() {
    return bests.value.stats.pokemonCaught
  }

  // Clear all data (for testing/reset)
  function clearAllData() {
    bests.value = { ...defaultData, stats: { ...defaultStats } }
  }

  return {
    bests,
    saveResult,
    getQuoteRecord,
    isNewRecord,
    isNewOverallRecord,
    getRaceHistory,
    getRaceHistoryByQuote,
    getRaceHistoryByPokemon,
    getRaceHistoryByDateRange,
    getStats,
    getPokemonCaught,
    clearAllData
  }
}

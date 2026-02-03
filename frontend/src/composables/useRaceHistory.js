import { computed } from 'vue'
import { usePersonalBests } from './useLocalStorage'

export function useRaceHistory() {
  const { bests, getRaceHistory, getRaceHistoryByQuote, getRaceHistoryByPokemon, getRaceHistoryByDateRange } = usePersonalBests()

  // Computed property for total race count
  const totalRaces = computed(() => bests.value.raceHistory.length)

  // Get sorted race history
  function getSortedHistory(sortBy = 'date', order = 'desc', limit = 50, offset = 0) {
    const history = [...bests.value.raceHistory]

    // Sort by specified field
    history.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'wpm':
          comparison = a.wpm - b.wpm
          break
        case 'accuracy':
          comparison = a.accuracy - b.accuracy
          break
        case 'time':
          comparison = a.time - b.time
          break
        case 'date':
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
      }

      return order === 'desc' ? -comparison : comparison
    })

    return history.slice(offset, offset + limit)
  }

  // Get filtered and sorted history
  function getFilteredHistory({
    sortBy = 'date',
    order = 'desc',
    quoteId = null,
    pokemonName = null,
    startDate = null,
    endDate = null,
    limit = 50,
    offset = 0
  } = {}) {
    let history = [...bests.value.raceHistory]

    // Apply filters
    if (quoteId !== null) {
      history = history.filter(r => r.quoteId === quoteId)
    }

    if (pokemonName !== null) {
      history = history.filter(r => r.pokemonName === pokemonName)
    }

    if (startDate !== null) {
      history = history.filter(r => new Date(r.date) >= startDate)
    }

    if (endDate !== null) {
      history = history.filter(r => new Date(r.date) <= endDate)
    }

    // Sort
    history.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'wpm':
          comparison = a.wpm - b.wpm
          break
        case 'accuracy':
          comparison = a.accuracy - b.accuracy
          break
        case 'time':
          comparison = a.time - b.time
          break
        case 'errors':
          comparison = a.errors - b.errors
          break
        case 'date':
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
      }

      return order === 'desc' ? -comparison : comparison
    })

    return {
      data: history.slice(offset, offset + limit),
      total: history.length,
      hasMore: offset + limit < history.length
    }
  }

  // Get best races per quote
  function getBestPerQuote() {
    const quoteRecords = bests.value.quoteRecords
    return Object.entries(quoteRecords).map(([quoteId, record]) => ({
      quoteId: parseInt(quoteId),
      ...record
    })).sort((a, b) => b.wpm - a.wpm)
  }

  // Get recent races
  function getRecentRaces(limit = 10) {
    return getRaceHistory(limit)
  }

  // Get unique quotes played
  function getUniqueQuotesPlayed() {
    const quoteIds = new Set(bests.value.raceHistory.map(r => r.quoteId))
    return Array.from(quoteIds)
  }

  // Get race count by quote
  function getRaceCountByQuote() {
    const counts = {}
    bests.value.raceHistory.forEach(race => {
      const key = race.quoteId
      if (!counts[key]) {
        counts[key] = { quoteId: race.quoteId, quoteSource: race.quoteSource, count: 0 }
      }
      counts[key].count++
    })
    return Object.values(counts).sort((a, b) => b.count - a.count)
  }

  // Get race count by Pokemon
  function getRaceCountByPokemon() {
    const counts = {}
    bests.value.raceHistory.forEach(race => {
      if (race.pokemonName) {
        if (!counts[race.pokemonName]) {
          counts[race.pokemonName] = 0
        }
        counts[race.pokemonName]++
      }
    })
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }

  // Get races grouped by date (for charts/trends)
  function getRacesByDate(days = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const racesByDate = {}
    bests.value.raceHistory
      .filter(r => new Date(r.date) >= cutoffDate)
      .forEach(race => {
        const dateKey = new Date(race.date).toISOString().split('T')[0]
        if (!racesByDate[dateKey]) {
          racesByDate[dateKey] = []
        }
        racesByDate[dateKey].push(race)
      })

    return racesByDate
  }

  // Get WPM improvement trend (average WPM per day)
  function getWpmTrend(days = 30) {
    const racesByDate = getRacesByDate(days)
    return Object.entries(racesByDate)
      .map(([date, races]) => ({
        date,
        averageWpm: Math.round(races.reduce((sum, r) => sum + r.wpm, 0) / races.length),
        raceCount: races.length,
        bestWpm: Math.max(...races.map(r => r.wpm))
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  return {
    totalRaces,
    getSortedHistory,
    getFilteredHistory,
    getBestPerQuote,
    getRecentRaces,
    getUniqueQuotesPlayed,
    getRaceCountByQuote,
    getRaceCountByPokemon,
    getRacesByDate,
    getWpmTrend,
    // Re-export from useLocalStorage for convenience
    getRaceHistory,
    getRaceHistoryByQuote,
    getRaceHistoryByPokemon,
    getRaceHistoryByDateRange
  }
}

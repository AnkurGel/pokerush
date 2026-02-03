import { computed } from 'vue'
import { usePersonalBests } from './useLocalStorage'
import { useRaceHistory } from './useRaceHistory'

export function useStats() {
  const { bests, getStats, getPokemonCaught } = usePersonalBests()
  const { getWpmTrend, getRaceCountByQuote, getRaceCountByPokemon } = useRaceHistory()

  // Basic stats as computed properties
  const totalRaces = computed(() => bests.value.stats.totalRaces)
  const totalTimeSpent = computed(() => bests.value.stats.totalTimeSpent)
  const averageWpm = computed(() => bests.value.stats.averageWpm)
  const averageAccuracy = computed(() => bests.value.stats.averageAccuracy)
  const pokemonCaught = computed(() => bests.value.stats.pokemonCaught)
  const overallBestWpm = computed(() => bests.value.overallBestWpm)
  const overallBestAccuracy = computed(() => bests.value.overallBestAccuracy)

  // Format time in hours, minutes, seconds
  function formatTotalTime(seconds) {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const secs = Math.round(seconds % 60)
      return `${minutes}m ${secs}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  // Formatted total time spent
  const formattedTotalTime = computed(() => formatTotalTime(totalTimeSpent.value))

  // Pokemon collection stats
  const pokemonCollectionSize = computed(() => pokemonCaught.value.length)

  // Total available Pokemon (hardcoded based on pokemonPool in useTypingGame)
  const totalPokemonAvailable = 15

  const pokemonCollectionProgress = computed(() => ({
    caught: pokemonCollectionSize.value,
    total: totalPokemonAvailable,
    percentage: Math.round((pokemonCollectionSize.value / totalPokemonAvailable) * 100)
  }))

  // Most played quotes
  const mostPlayedQuotes = computed(() => {
    const counts = getRaceCountByQuote()
    return counts.slice(0, 5) // Top 5
  })

  // Favorite Pokemon (most caught)
  const favoritePokemon = computed(() => {
    const counts = getRaceCountByPokemon()
    return counts.length > 0 ? counts[0] : null
  })

  // WPM improvement (compare first 5 races vs last 5 races)
  const wpmImprovement = computed(() => {
    const history = bests.value.raceHistory
    if (history.length < 10) return null

    const oldest = history.slice(-5) // First 5 races (oldest)
    const newest = history.slice(0, 5) // Last 5 races (newest)

    const oldAvg = oldest.reduce((sum, r) => sum + r.wpm, 0) / oldest.length
    const newAvg = newest.reduce((sum, r) => sum + r.wpm, 0) / newest.length

    return {
      oldAverage: Math.round(oldAvg),
      newAverage: Math.round(newAvg),
      improvement: Math.round(newAvg - oldAvg),
      percentChange: Math.round(((newAvg - oldAvg) / oldAvg) * 100)
    }
  })

  // Accuracy distribution (buckets)
  const accuracyDistribution = computed(() => {
    const history = bests.value.raceHistory
    const buckets = {
      '100%': 0,
      '95-99%': 0,
      '90-94%': 0,
      '80-89%': 0,
      '<80%': 0
    }

    history.forEach(race => {
      const acc = race.accuracy
      if (acc === 100) buckets['100%']++
      else if (acc >= 95) buckets['95-99%']++
      else if (acc >= 90) buckets['90-94%']++
      else if (acc >= 80) buckets['80-89%']++
      else buckets['<80%']++
    })

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
      percentage: history.length > 0 ? Math.round((count / history.length) * 100) : 0
    }))
  })

  // WPM distribution (buckets)
  const wpmDistribution = computed(() => {
    const history = bests.value.raceHistory
    const buckets = {
      '100+': 0,
      '80-99': 0,
      '60-79': 0,
      '40-59': 0,
      '<40': 0
    }

    history.forEach(race => {
      const wpm = race.wpm
      if (wpm >= 100) buckets['100+']++
      else if (wpm >= 80) buckets['80-99']++
      else if (wpm >= 60) buckets['60-79']++
      else if (wpm >= 40) buckets['40-59']++
      else buckets['<40']++
    })

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
      percentage: history.length > 0 ? Math.round((count / history.length) * 100) : 0
    }))
  })

  // Total errors made
  const totalErrors = computed(() => {
    return bests.value.raceHistory.reduce((sum, r) => sum + (r.errors || 0), 0)
  })

  // Streak stats (consecutive days played)
  const streakStats = computed(() => {
    const history = bests.value.raceHistory
    if (history.length === 0) return { currentStreak: 0, longestStreak: 0 }

    // Get unique dates (sorted newest first)
    const dates = [...new Set(
      history.map(r => new Date(r.date).toISOString().split('T')[0])
    )].sort((a, b) => new Date(b) - new Date(a))

    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 }

    // Calculate current streak
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    let currentStreak = 0
    if (dates[0] === today || dates[0] === yesterday) {
      currentStreak = 1
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1])
        const currDate = new Date(dates[i])
        const diffDays = (prevDate - currDate) / 86400000

        if (diffDays === 1) {
          currentStreak++
        } else {
          break
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 1
    let tempStreak = 1
    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1])
      const currDate = new Date(dates[i])
      const diffDays = (prevDate - currDate) / 86400000

      if (diffDays === 1) {
        tempStreak++
        longestStreak = Math.max(longestStreak, tempStreak)
      } else {
        tempStreak = 1
      }
    }

    return { currentStreak, longestStreak }
  })

  // Summary stats object for dashboard
  const dashboardStats = computed(() => ({
    totalRaces: totalRaces.value,
    totalTimeSpent: formattedTotalTime.value,
    averageWpm: averageWpm.value,
    averageAccuracy: averageAccuracy.value,
    bestWpm: overallBestWpm.value,
    bestAccuracy: overallBestAccuracy.value,
    pokemonCaught: pokemonCollectionProgress.value,
    wpmImprovement: wpmImprovement.value,
    totalErrors: totalErrors.value,
    streakStats: streakStats.value
  }))

  return {
    // Basic stats
    totalRaces,
    totalTimeSpent,
    formattedTotalTime,
    averageWpm,
    averageAccuracy,
    overallBestWpm,
    overallBestAccuracy,
    totalErrors,

    // Pokemon stats
    pokemonCaught,
    pokemonCollectionSize,
    pokemonCollectionProgress,
    favoritePokemon,

    // Distributions
    accuracyDistribution,
    wpmDistribution,

    // Improvement tracking
    wpmImprovement,
    streakStats,

    // Aggregated
    mostPlayedQuotes,
    dashboardStats,

    // Utility
    formatTotalTime,
    getWpmTrend
  }
}

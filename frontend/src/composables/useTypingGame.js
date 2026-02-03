import { ref, computed, watch } from 'vue'
import { getRandomQuote } from '../data/quotes.js'
import { useWpmCalculator } from './useWpmCalculator.js'
import { usePersonalBests } from './useLocalStorage.js'
import { useApi } from './useApi.js'
import { API_ENDPOINTS } from '../config/api.js'

// Pokemon pool with sprite URLs from PokeAPI
// Using animated showdown sprites for better visuals
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const pokemonPool = [
  { id: 25, name: 'Pikachu', sprite: `${SPRITE_BASE}/other/showdown/25.gif`, static: `${SPRITE_BASE}/25.png` },
  { id: 4, name: 'Charmander', sprite: `${SPRITE_BASE}/other/showdown/4.gif`, static: `${SPRITE_BASE}/4.png` },
  { id: 7, name: 'Squirtle', sprite: `${SPRITE_BASE}/other/showdown/7.gif`, static: `${SPRITE_BASE}/7.png` },
  { id: 1, name: 'Bulbasaur', sprite: `${SPRITE_BASE}/other/showdown/1.gif`, static: `${SPRITE_BASE}/1.png` },
  { id: 133, name: 'Eevee', sprite: `${SPRITE_BASE}/other/showdown/133.gif`, static: `${SPRITE_BASE}/133.png` },
  { id: 39, name: 'Jigglypuff', sprite: `${SPRITE_BASE}/other/showdown/39.gif`, static: `${SPRITE_BASE}/39.png` },
  { id: 52, name: 'Meowth', sprite: `${SPRITE_BASE}/other/showdown/52.gif`, static: `${SPRITE_BASE}/52.png` },
  { id: 54, name: 'Psyduck', sprite: `${SPRITE_BASE}/other/showdown/54.gif`, static: `${SPRITE_BASE}/54.png` },
  { id: 94, name: 'Gengar', sprite: `${SPRITE_BASE}/other/showdown/94.gif`, static: `${SPRITE_BASE}/94.png` },
  { id: 143, name: 'Snorlax', sprite: `${SPRITE_BASE}/other/showdown/143.gif`, static: `${SPRITE_BASE}/143.png` },
  { id: 6, name: 'Charizard', sprite: `${SPRITE_BASE}/other/showdown/6.gif`, static: `${SPRITE_BASE}/6.png` },
  { id: 9, name: 'Blastoise', sprite: `${SPRITE_BASE}/other/showdown/9.gif`, static: `${SPRITE_BASE}/9.png` },
  { id: 3, name: 'Venusaur', sprite: `${SPRITE_BASE}/other/showdown/3.gif`, static: `${SPRITE_BASE}/3.png` },
  { id: 150, name: 'Mewtwo', sprite: `${SPRITE_BASE}/other/showdown/150.gif`, static: `${SPRITE_BASE}/150.png` },
  { id: 151, name: 'Mew', sprite: `${SPRITE_BASE}/other/showdown/151.gif`, static: `${SPRITE_BASE}/151.png` }
]

export function useTypingGame() {
  // Game state
  const gameState = ref('idle') // 'idle' | 'racing' | 'finished'
  const currentQuote = ref(null)
  const currentIndex = ref(0)
  const errors = ref(0)
  const currentPokemon = ref(null)
  const lastKeyCorrect = ref(true)
  const isCapturing = ref(false)

  // WPM calculator
  const wpmCalc = useWpmCalculator()

  // Personal bests
  const { bests, saveResult, isNewRecord, isNewOverallRecord, getQuoteRecord } = usePersonalBests()

  // API for cloud sync
  const { post, getToken, isOnline } = useApi()
  const syncStatus = ref('idle') // 'idle' | 'syncing' | 'synced' | 'error'

  // Computed values
  const progress = computed(() => {
    if (!currentQuote.value) return 0
    return currentIndex.value / currentQuote.value.text.length
  })

  const quoteText = computed(() => {
    return currentQuote.value?.text || ''
  })

  const completedText = computed(() => {
    return quoteText.value.slice(0, currentIndex.value)
  })

  const currentChar = computed(() => {
    return quoteText.value[currentIndex.value] || ''
  })

  const remainingText = computed(() => {
    return quoteText.value.slice(currentIndex.value + 1)
  })

  const wordCount = computed(() => {
    if (!quoteText.value) return { current: 0, total: 0 }
    const words = quoteText.value.split(' ')
    const typedWords = completedText.value.trim().split(' ').filter(w => w.length > 0)
    return {
      current: typedWords.length,
      total: words.length
    }
  })

  // Timer update interval
  let timerInterval = null

  function selectRandomPokemon() {
    const randomIndex = Math.floor(Math.random() * pokemonPool.length)
    currentPokemon.value = pokemonPool[randomIndex]
  }

  function startRace() {
    // Reset state
    currentQuote.value = getRandomQuote()
    currentIndex.value = 0
    errors.value = 0
    lastKeyCorrect.value = true
    isCapturing.value = false
    gameState.value = 'racing'

    // Select random Pokemon
    selectRandomPokemon()

    // Start WPM tracking
    wpmCalc.reset()
    wpmCalc.start()

    // Start timer update interval for live display
    if (timerInterval) clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      // This just triggers reactivity updates for the timer display
    }, 100)
  }

  function handleKeyPress(key) {
    if (gameState.value !== 'racing') return

    // Handle the typed character
    const expectedChar = quoteText.value[currentIndex.value]

    if (key === expectedChar) {
      // Correct keystroke
      wpmCalc.recordKeystroke(true)
      currentIndex.value++
      lastKeyCorrect.value = true

      // Check if race is complete
      if (currentIndex.value >= quoteText.value.length) {
        finishRace()
      }
    } else {
      // Incorrect keystroke
      wpmCalc.recordKeystroke(false)
      errors.value++
      lastKeyCorrect.value = false
    }
  }

  function finishRace() {
    gameState.value = 'finished'
    wpmCalc.stop()
    isCapturing.value = true

    // Clear timer interval
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    // Save result with full context (Pokemon name, quote source, errors)
    if (currentQuote.value) {
      saveResult(
        currentQuote.value.id,
        wpmCalc.wpm.value,
        wpmCalc.accuracy.value,
        wpmCalc.elapsedSeconds.value,
        currentQuote.value.source || '',
        currentPokemon.value?.name || '',
        errors.value
      )

      // Sync to cloud if logged in
      syncToCloud()
    }
  }

  // Sync race result to cloud API
  async function syncToCloud() {
    // Only sync if user is logged in and online
    if (!getToken() || !isOnline()) {
      syncStatus.value = 'idle'
      return
    }

    syncStatus.value = 'syncing'

    try {
      await post(API_ENDPOINTS.races, {
        quoteId: currentQuote.value.id,
        quoteSource: currentQuote.value.source || '',
        wpm: wpmCalc.wpm.value,
        accuracy: wpmCalc.accuracy.value,
        timeSeconds: wpmCalc.elapsedSeconds.value,
        errors: errors.value,
        pokemonName: currentPokemon.value?.name || '',
      })
      syncStatus.value = 'synced'
    } catch (err) {
      console.error('Failed to sync race to cloud:', err)
      syncStatus.value = 'error'
    }
  }

  function resetGame() {
    gameState.value = 'idle'
    currentQuote.value = null
    currentIndex.value = 0
    errors.value = 0
    lastKeyCorrect.value = true
    isCapturing.value = false
    wpmCalc.reset()

    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  // Final results
  const finalResults = computed(() => {
    if (gameState.value !== 'finished' || !currentQuote.value) return null

    return {
      wpm: wpmCalc.wpm.value,
      accuracy: wpmCalc.accuracy.value,
      time: wpmCalc.formattedTime.value,
      timeSeconds: wpmCalc.elapsedSeconds.value,
      errors: errors.value,
      quote: currentQuote.value,
      pokemon: currentPokemon.value,
      isNewQuoteRecord: isNewRecord(currentQuote.value.id, wpmCalc.wpm.value),
      isNewOverallRecord: isNewOverallRecord(wpmCalc.wpm.value),
      previousRecord: getQuoteRecord(currentQuote.value.id)
    }
  })

  return {
    // State
    gameState,
    currentQuote,
    currentIndex,
    errors,
    currentPokemon,
    lastKeyCorrect,
    isCapturing,

    // Computed
    progress,
    quoteText,
    completedText,
    currentChar,
    remainingText,
    wordCount,
    finalResults,

    // WPM calculator values
    wpm: wpmCalc.wpm,
    accuracy: wpmCalc.accuracy,
    formattedTime: wpmCalc.formattedTime,
    elapsedSeconds: wpmCalc.elapsedSeconds,

    // Personal bests
    bests,

    // Cloud sync
    syncStatus,

    // Methods
    startRace,
    handleKeyPress,
    resetGame
  }
}

import { ref, computed } from 'vue'

export function useWpmCalculator() {
  const correctChars = ref(0)
  const totalTypedChars = ref(0)
  const startTime = ref(null)
  const endTime = ref(null)

  const elapsedMs = computed(() => {
    if (!startTime.value) return 0
    const end = endTime.value || Date.now()
    return end - startTime.value
  })

  const elapsedMinutes = computed(() => {
    return elapsedMs.value / 60000
  })

  const elapsedSeconds = computed(() => {
    return Math.floor(elapsedMs.value / 1000)
  })

  const formattedTime = computed(() => {
    const totalSeconds = elapsedSeconds.value
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  })

  // WPM = (characters / 5) / minutes
  // Standard typing test uses 5 characters = 1 word
  const wpm = computed(() => {
    if (elapsedMinutes.value === 0) return 0
    const words = correctChars.value / 5
    return Math.round(words / elapsedMinutes.value)
  })

  const accuracy = computed(() => {
    if (totalTypedChars.value === 0) return 100
    return Math.round((correctChars.value / totalTypedChars.value) * 100)
  })

  function start() {
    startTime.value = Date.now()
    endTime.value = null
    correctChars.value = 0
    totalTypedChars.value = 0
  }

  function stop() {
    endTime.value = Date.now()
  }

  function recordKeystroke(isCorrect) {
    totalTypedChars.value++
    if (isCorrect) {
      correctChars.value++
    }
  }

  function reset() {
    correctChars.value = 0
    totalTypedChars.value = 0
    startTime.value = null
    endTime.value = null
  }

  return {
    correctChars,
    totalTypedChars,
    elapsedMs,
    elapsedMinutes,
    elapsedSeconds,
    formattedTime,
    wpm,
    accuracy,
    start,
    stop,
    recordKeystroke,
    reset
  }
}

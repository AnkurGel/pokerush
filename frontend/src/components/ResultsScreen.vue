<template>
  <div class="bg-white rounded-xl shadow-xl p-8 max-w-2xl mx-auto">
    <!-- Header with Pokemon -->
    <div class="text-center mb-6">
      <img
        :src="results.pokemon?.sprite || results.pokemon?.static"
        :alt="results.pokemon?.name"
        class="w-24 h-24 mx-auto object-contain pokemon-sprite drop-shadow-lg"
      />
      <h2 class="text-2xl font-bold text-gray-800">
        {{ results.pokemon?.name }} was caught!
      </h2>

      <!-- New Record Banner -->
      <div
        v-if="results.isNewQuoteRecord || results.isNewOverallRecord"
        class="mt-3 inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-lg animate-bounce-soft"
      >
        🎉 {{ results.isNewOverallRecord ? 'NEW OVERALL RECORD!' : 'NEW PERSONAL BEST!' }} 🎉
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-6 mb-8">
      <!-- WPM -->
      <div class="text-center p-4 bg-blue-50 rounded-lg">
        <div class="text-4xl font-bold text-blue-600">{{ results.wpm }}</div>
        <div class="text-sm text-gray-500 uppercase">WPM</div>
        <div v-if="results.previousRecord" class="text-xs text-gray-400 mt-1">
          Previous: {{ results.previousRecord.wpm }}
        </div>
      </div>

      <!-- Accuracy -->
      <div class="text-center p-4 bg-green-50 rounded-lg">
        <div class="text-4xl font-bold text-green-600">{{ results.accuracy }}%</div>
        <div class="text-sm text-gray-500 uppercase">Accuracy</div>
        <div class="text-xs text-gray-400 mt-1">
          {{ results.errors }} errors
        </div>
      </div>

      <!-- Time -->
      <div class="text-center p-4 bg-purple-50 rounded-lg">
        <div class="text-4xl font-bold text-purple-600">{{ results.time }}</div>
        <div class="text-sm text-gray-500 uppercase">Time</div>
        <div v-if="results.previousRecord" class="text-xs text-gray-400 mt-1">
          Previous: {{ formatTime(results.previousRecord.time) }}
        </div>
      </div>
    </div>

    <!-- Quote Attribution -->
    <div class="bg-gray-50 rounded-lg p-4 mb-8 border-l-4 border-gray-400">
      <p class="text-gray-700 italic">"{{ results.quote?.text }}"</p>
      <p class="text-sm text-gray-500 mt-2 text-right">— {{ results.quote?.source }}</p>
    </div>

    <!-- Personal Best Display -->
    <div v-if="overallBest > 0" class="text-center mb-6 text-gray-600">
      <span class="text-sm">Your all-time best: </span>
      <span class="font-bold text-blue-600">{{ overallBest }} WPM</span>
    </div>

    <!-- Sign Up Prompt for Guest Users -->
    <div v-if="isGuest && !promptDismissed" class="mb-6">
      <SignUpPrompt
        :race-count="localRaceCount"
        @signup="$emit('showAuth', 'register')"
        @signin="$emit('showAuth', 'login')"
        @dismiss="promptDismissed = true"
      />
    </div>

    <!-- Action Buttons -->
    <div class="text-center flex justify-center gap-4">
      <button
        @click="$emit('raceAgain')"
        class="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-bold text-lg shadow-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95"
      >
        🏁 Race Again!
      </button>
      <button
        @click="$emit('viewStats')"
        class="px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-bold text-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all transform hover:scale-105 active:scale-95"
      >
        📊 View Stats
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import SignUpPrompt from './SignUpPrompt.vue'

defineProps({
  results: {
    type: Object,
    required: true
  },
  overallBest: {
    type: Number,
    default: 0
  }
})

defineEmits(['raceAgain', 'viewStats', 'showAuth'])

const { isGuest, getLocalRaceCount } = useAuth()
const localRaceCount = getLocalRaceCount()
const promptDismissed = ref(false)

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

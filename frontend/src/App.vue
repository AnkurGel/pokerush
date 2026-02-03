<template>
  <!-- Migration Success Toast -->
  <Transition name="fade">
    <div
      v-if="migrationMessage"
      class="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2"
    >
      <span>☁️</span>
      <span>{{ migrationMessage }}</span>
    </div>
  </Transition>

  <!-- Auth Modal -->
  <AuthModal
    :is-open="showAuthModal"
    :initial-mode="authMode"
    @close="showAuthModal = false"
    @success="handleAuthSuccess"
  />

  <!-- Leaderboard Screen -->
  <LeaderboardScreen
    v-if="showLeaderboard"
    @back="showLeaderboard = false"
    @show-auth="openAuthModal('register')"
  />

  <!-- Main Game Screen -->
  <div v-else class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <header class="text-center mb-8">
        <h1 class="text-5xl font-bold text-white mb-2">
          <span class="text-yellow-400">⚡</span>
          PokéRush
          <span class="text-yellow-400">⚡</span>
        </h1>
        <p class="text-purple-200">Catch 'em all with your typing speed!</p>

        <!-- Navigation -->
        <div v-if="gameState === 'idle'" class="mt-4 flex justify-center gap-4">
          <button
            @click="showLeaderboard = true"
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📊</span>
            <span>Your Stats</span>
          </button>
          <button
            v-if="isGuest"
            @click="openAuthModal('login')"
            class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>👤</span>
            <span>Sign In</span>
          </button>
          <div v-else class="flex items-center gap-3">
            <span class="text-purple-200 text-sm">{{ user?.displayName }}</span>
            <button
              @click="handleLogout"
              class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <!-- Idle State - Start Screen -->
      <div v-if="gameState === 'idle'" class="text-center">
        <div class="bg-white/10 backdrop-blur rounded-xl p-8 mb-6">
          <div class="text-8xl mb-4">🎮</div>
          <h2 class="text-2xl font-bold text-white mb-4">Ready to Race?</h2>
          <p class="text-purple-200 mb-6">
            Type the quote as fast and accurately as you can to help your Pokemon reach the Pokeball!
          </p>

          <!-- Personal Best Display -->
          <div v-if="bests.overallBestWpm > 0" class="mb-6 text-purple-200">
            <p>Your best WPM: <span class="text-yellow-400 font-bold text-xl">{{ bests.overallBestWpm }}</span></p>
          </div>

          <button
            @click="startRace"
            class="px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold text-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95"
          >
            🏁 Start Race!
          </button>
        </div>

        <!-- Instructions -->
        <div class="bg-white/5 backdrop-blur rounded-lg p-6 text-left text-purple-200">
          <h3 class="font-bold text-white mb-3">How to Play:</h3>
          <ul class="space-y-2">
            <li>📝 A random quote will appear on screen</li>
            <li>⌨️ Type each character exactly as shown</li>
            <li>🏃 Watch your Pokemon race toward the Pokeball</li>
            <li>🎯 Accuracy matters - mistakes slow you down!</li>
            <li>🏆 Beat your personal best WPM!</li>
          </ul>
        </div>
      </div>

      <!-- Racing State -->
      <div v-else-if="gameState === 'racing'" class="space-y-6">
        <!-- Race Track -->
        <RaceTrack
          :progress="progress"
          :pokemon="currentPokemon"
          :is-capturing="false"
        />

        <!-- Stats Display -->
        <StatsDisplay
          :wpm="wpm"
          :accuracy="accuracy"
          :time="formattedTime"
          :current-words="wordCount.current"
          :total-words="wordCount.total"
        />

        <!-- Quote Display -->
        <QuoteDisplay
          :completed-text="completedText"
          :current-char="currentChar"
          :remaining-text="remainingText"
          :source="currentQuote?.source"
          :has-error="!lastKeyCorrect"
          :is-active="true"
        />

        <!-- Typing Area -->
        <TypingArea
          ref="typingAreaRef"
          @keypress="handleKeyPress"
        />
      </div>

      <!-- Finished State - Results -->
      <div v-else-if="gameState === 'finished'">
        <!-- Race Track (showing captured state) -->
        <RaceTrack
          :progress="1"
          :pokemon="currentPokemon"
          :is-capturing="isCapturing"
          class="mb-8"
        />

        <!-- Results Screen -->
        <ResultsScreen
          :results="finalResults"
          :overall-best="bests.overallBestWpm"
          @race-again="handleRaceAgain"
          @view-stats="handleViewStats"
          @show-auth="openAuthModal"
        />
      </div>

      <!-- Footer -->
      <footer class="text-center mt-8 text-purple-300 text-sm">
        <p>Press <kbd class="bg-white/20 px-2 py-1 rounded">any key</kbd> to start typing</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTypingGame } from './composables/useTypingGame.js'
import { useAuth } from './composables/useAuth.js'
import RaceTrack from './components/RaceTrack.vue'
import QuoteDisplay from './components/QuoteDisplay.vue'
import TypingArea from './components/TypingArea.vue'
import StatsDisplay from './components/StatsDisplay.vue'
import ResultsScreen from './components/ResultsScreen.vue'
import LeaderboardScreen from './components/LeaderboardScreen.vue'
import AuthModal from './components/AuthModal.vue'

const typingAreaRef = ref(null)
const showLeaderboard = ref(false)
const showAuthModal = ref(false)
const authMode = ref('login')
const migrationMessage = ref('')

// Auth state
const { user, isGuest, initialize, logout, hasLocalDataToMigrate, migrateLocalData, migrationStatus, fetchAndMergeCloudData } = useAuth()

// Initialize auth on mount
onMounted(() => {
  initialize()
})

const {
  // State
  gameState,
  currentQuote,
  currentPokemon,
  lastKeyCorrect,
  isCapturing,

  // Computed
  progress,
  completedText,
  currentChar,
  remainingText,
  wordCount,
  finalResults,

  // Stats
  wpm,
  accuracy,
  formattedTime,

  // Personal bests
  bests,

  // Methods
  startRace,
  handleKeyPress,
  resetGame
} = useTypingGame()

function handleRaceAgain() {
  resetGame()
  startRace()
}

function handleViewStats() {
  resetGame()
  showLeaderboard.value = true
}

function openAuthModal(mode) {
  authMode.value = mode
  showAuthModal.value = true
}

async function handleAuthSuccess() {
  // Auth successful, modal will close automatically

  try {
    // Step 1: Upload local races to cloud (if any)
    let uploadedCount = 0
    if (hasLocalDataToMigrate()) {
      const uploadResult = await migrateLocalData()
      uploadedCount = uploadResult.imported || 0
    }

    // Step 2: Fetch cloud races and merge into local storage
    const mergeResult = await fetchAndMergeCloudData()
    const downloadedCount = mergeResult.merged || 0

    // Show appropriate message
    if (uploadedCount > 0 && downloadedCount > 0) {
      migrationMessage.value = `✓ Synced! ${uploadedCount} uploaded, ${downloadedCount} downloaded`
    } else if (uploadedCount > 0) {
      migrationMessage.value = `✓ ${uploadedCount} race${uploadedCount !== 1 ? 's' : ''} synced to cloud!`
    } else if (downloadedCount > 0) {
      migrationMessage.value = `✓ ${downloadedCount} race${downloadedCount !== 1 ? 's' : ''} loaded from cloud!`
    } else if (mergeResult.total > 0) {
      migrationMessage.value = `✓ ${mergeResult.total} races synced!`
    }

    // Reload page to refresh all components with merged data
    // This ensures stats/history components get the updated localStorage
    if (uploadedCount > 0 || downloadedCount > 0 || mergeResult.total > 0) {
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  } catch (err) {
    console.error('Failed to sync data:', err)
    migrationMessage.value = 'Failed to sync data'
    setTimeout(() => {
      migrationMessage.value = ''
    }, 4000)
  }
}

async function handleLogout() {
  await logout()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

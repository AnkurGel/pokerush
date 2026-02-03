<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-yellow-400 to-orange-500">
      <h3 class="font-bold text-white flex items-center gap-2">
        <span>🌍</span>
        Global Leaderboard
      </h3>
      <div class="flex items-center gap-2">
        <select
          v-model="period"
          class="text-sm border-0 rounded-lg px-2 py-1 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          <option value="alltime" class="text-gray-800">All Time</option>
          <option value="monthly" class="text-gray-800">This Month</option>
          <option value="weekly" class="text-gray-800">This Week</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-yellow-400 border-t-transparent"></div>
      <p class="mt-2 text-gray-500">Loading leaderboard...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-8 text-center">
      <div class="text-4xl mb-2">😕</div>
      <p class="text-gray-600">{{ error }}</p>
      <button
        @click="fetchLeaderboard"
        class="mt-4 px-4 py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Offline State -->
    <div v-else-if="!isOnline" class="p-8 text-center">
      <div class="text-4xl mb-2">📡</div>
      <p class="text-gray-600">You're offline. Connect to see global rankings.</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="leaderboard.length === 0" class="p-8 text-center">
      <div class="text-4xl mb-2">🏆</div>
      <p class="text-gray-600">No races yet. Be the first!</p>
    </div>

    <!-- Leaderboard Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">WPM</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accuracy</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="entry in leaderboard"
            :key="`${entry.userId}-${entry.date}`"
            :class="[
              'transition-colors',
              isCurrentUser(entry.userId) ? 'bg-yellow-50' : 'hover:bg-gray-50'
            ]"
          >
            <td class="px-4 py-3">
              <span :class="rankClass(entry.rank)">
                {{ entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}` }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span :class="['font-medium', isCurrentUser(entry.userId) ? 'text-yellow-600' : 'text-gray-800']">
                {{ entry.displayName }}
                <span v-if="isCurrentUser(entry.userId)" class="text-xs text-yellow-500 ml-1">(You)</span>
              </span>
            </td>
            <td class="px-4 py-3">
              <span class="font-bold text-blue-600">{{ entry.wpm }}</span>
            </td>
            <td class="px-4 py-3">
              <span :class="accuracyClass(entry.accuracy)">{{ entry.accuracy }}%</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-sm">
              {{ formatDate(entry.date) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Your Rank -->
    <div v-if="userRank && !isLoading" class="px-4 py-3 border-t border-gray-100 bg-yellow-50">
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Your global rank:</span>
        <span class="font-bold text-yellow-600">#{{ userRank }}</span>
      </div>
    </div>

    <!-- Sign Up Prompt (for guests) -->
    <div v-if="isGuest && !isLoading" class="px-4 py-3 border-t border-gray-100 bg-gray-50 text-center">
      <p class="text-sm text-gray-600 mb-2">Sign up to appear on the leaderboard!</p>
      <button
        @click="$emit('showAuth')"
        class="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all"
      >
        Create Account
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import { useAuth } from '../composables/useAuth'
import { API_ENDPOINTS } from '../config/api'

const emit = defineEmits(['showAuth'])

const { get, isOnline } = useApi()
const { user, isGuest } = useAuth()

const leaderboard = ref([])
const userRank = ref(null)
const isLoading = ref(false)
const error = ref(null)
const period = ref('alltime')

const currentUserId = computed(() => user.value?.id)

// Fetch leaderboard when period changes
watch(period, () => {
  fetchLeaderboard()
})

onMounted(() => {
  fetchLeaderboard()
})

async function fetchLeaderboard() {
  if (!isOnline()) {
    error.value = 'You are offline'
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const data = await get(API_ENDPOINTS.leaderboard, {
      limit: 50,
      period: period.value,
    })
    leaderboard.value = data

    // Fetch user's rank if logged in
    if (user.value) {
      try {
        const rankData = await get(API_ENDPOINTS.myRank)
        userRank.value = rankData.rank
      } catch (err) {
        // Ignore rank fetch errors
      }
    }
  } catch (err) {
    error.value = err.message || 'Failed to load leaderboard'
  } finally {
    isLoading.value = false
  }
}

function isCurrentUser(userId) {
  return currentUserId.value && userId === currentUserId.value
}

function rankClass(rank) {
  if (rank <= 3) return 'text-2xl'
  return 'text-gray-600 font-medium'
}

function accuracyClass(accuracy) {
  if (accuracy >= 98) return 'text-green-600 font-medium'
  if (accuracy >= 95) return 'text-green-500'
  if (accuracy >= 90) return 'text-yellow-600'
  return 'text-orange-500'
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
          Your Stats
        </h1>
        <p class="text-gray-600">Track your progress and Pokemon collection</p>
      </div>

      <!-- Back Button -->
      <button
        @click="$emit('back')"
        class="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <span>←</span>
        <span>Back to Home</span>
      </button>

      <!-- Stats Dashboard -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Races"
          :value="stats.totalRaces"
          icon="🏁"
          color="blue"
        />
        <StatsCard
          label="Average WPM"
          :value="stats.averageWpm"
          suffix="wpm"
          icon="⚡"
          color="yellow"
          :trend="wpmImprovement?.improvement"
          trend-suffix=" wpm"
        />
        <StatsCard
          label="Best WPM"
          :value="stats.bestWpm"
          suffix="wpm"
          icon="🏆"
          color="orange"
        />
        <StatsCard
          label="Average Accuracy"
          :value="stats.averageAccuracy"
          format="percent"
          icon="🎯"
          color="green"
        />
      </div>

      <!-- Secondary Stats Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Time Racing"
          :value="stats.totalTimeSpent"
          format="time"
          icon="⏱️"
          color="purple"
        />
        <StatsCard
          label="Total Errors"
          :value="totalErrors"
          icon="❌"
          color="red"
        />
        <StatsCard
          label="Current Streak"
          :value="streakStats.currentStreak"
          suffix="days"
          icon="🔥"
          color="orange"
          :subtext="`Best: ${streakStats.longestStreak} days`"
        />
        <StatsCard
          label="Best Accuracy"
          :value="stats.bestAccuracy"
          format="percent"
          icon="💯"
          color="green"
        />
      </div>

      <!-- Pokemon Gallery -->
      <div class="mb-8">
        <PokemonGallery />
      </div>

      <!-- WPM Improvement Card -->
      <div v-if="wpmImprovement" class="bg-white rounded-xl shadow-md p-4 mb-8">
        <h3 class="font-semibold text-gray-800 mb-3">WPM Progress</h3>
        <div class="flex items-center justify-between">
          <div class="text-center">
            <p class="text-gray-500 text-sm">First 5 races</p>
            <p class="text-2xl font-bold text-gray-400">{{ wpmImprovement.oldAverage }}</p>
          </div>
          <div class="flex-1 flex items-center justify-center">
            <div :class="[
              'px-4 py-2 rounded-full font-bold',
              wpmImprovement.improvement >= 0
                ? 'bg-green-100 text-green-600'
                : 'bg-red-100 text-red-600'
            ]">
              {{ wpmImprovement.improvement >= 0 ? '+' : '' }}{{ wpmImprovement.improvement }} WPM
              ({{ wpmImprovement.percentChange >= 0 ? '+' : '' }}{{ wpmImprovement.percentChange }}%)
            </div>
          </div>
          <div class="text-center">
            <p class="text-gray-500 text-sm">Last 5 races</p>
            <p class="text-2xl font-bold text-blue-600">{{ wpmImprovement.newAverage }}</p>
          </div>
        </div>
      </div>

      <!-- WPM Distribution -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-white rounded-xl shadow-md p-4">
          <h3 class="font-semibold text-gray-800 mb-3">WPM Distribution</h3>
          <div class="space-y-2">
            <div v-for="bucket in wpmDistribution" :key="bucket.range" class="flex items-center gap-3">
              <span class="w-16 text-sm text-gray-600">{{ bucket.range }}</span>
              <div class="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  class="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500"
                  :style="{ width: `${bucket.percentage}%` }"
                ></div>
              </div>
              <span class="w-12 text-sm text-gray-500 text-right">{{ bucket.count }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-4">
          <h3 class="font-semibold text-gray-800 mb-3">Accuracy Distribution</h3>
          <div class="space-y-2">
            <div v-for="bucket in accuracyDistribution" :key="bucket.range" class="flex items-center gap-3">
              <span class="w-16 text-sm text-gray-600">{{ bucket.range }}</span>
              <div class="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  class="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                  :style="{ width: `${bucket.percentage}%` }"
                ></div>
              </div>
              <span class="w-12 text-sm text-gray-500 text-right">{{ bucket.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Most Played Quotes -->
      <div v-if="mostPlayedQuotes.length > 0" class="bg-white rounded-xl shadow-md p-4 mb-8">
        <h3 class="font-semibold text-gray-800 mb-3">Most Played Quotes</h3>
        <div class="space-y-2">
          <div
            v-for="(quote, index) in mostPlayedQuotes"
            :key="quote.quoteId"
            class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold text-gray-300">#{{ index + 1 }}</span>
              <span class="text-gray-700">{{ quote.quoteSource || `Quote #${quote.quoteId}` }}</span>
            </div>
            <span class="text-purple-600 font-medium">{{ quote.count }} races</span>
          </div>
        </div>
      </div>

      <!-- Global Leaderboard -->
      <div class="mb-8">
        <GlobalLeaderboard @show-auth="$emit('showAuth')" />
      </div>

      <!-- Race History Table -->
      <RaceHistoryTable />

      <!-- Empty State -->
      <div
        v-if="stats.totalRaces === 0"
        class="bg-white rounded-xl shadow-md p-8 text-center"
      >
        <div class="text-6xl mb-4">🏁</div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">No races yet!</h3>
        <p class="text-gray-600 mb-4">Complete your first race to start tracking your progress.</p>
        <button
          @click="$emit('back')"
          class="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-xl hover:scale-105 transition-transform"
        >
          Start Racing
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStats } from '../composables/useStats'
import StatsCard from './StatsCard.vue'
import RaceHistoryTable from './RaceHistoryTable.vue'
import PokemonGallery from './PokemonGallery.vue'
import GlobalLeaderboard from './GlobalLeaderboard.vue'

defineEmits(['back', 'showAuth'])

const {
  dashboardStats,
  wpmImprovement,
  wpmDistribution,
  accuracyDistribution,
  mostPlayedQuotes,
  totalErrors,
  streakStats
} = useStats()

const stats = computed(() => dashboardStats.value)
</script>

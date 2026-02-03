<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <h3 class="font-semibold text-gray-800">Race History</h3>
      <div class="flex items-center gap-2">
        <select
          v-model="filterQuote"
          class="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          <option :value="null">All Quotes</option>
          <option v-for="quote in uniqueQuotes" :key="quote.quoteId" :value="quote.quoteId">
            {{ quote.quoteSource || `Quote #${quote.quoteId}` }}
          </option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="column.sortable && toggleSort(column.key)"
              :class="[
                'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
              ]"
            >
              <div class="flex items-center gap-1">
                {{ column.label }}
                <span v-if="column.sortable && sortBy === column.key" class="text-yellow-500">
                  {{ sortOrder === 'desc' ? '↓' : '↑' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="race in displayedRaces"
            :key="race.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3">
              <span class="font-semibold text-blue-600">{{ race.wpm }}</span>
            </td>
            <td class="px-4 py-3">
              <span :class="accuracyClass(race.accuracy)">{{ race.accuracy }}%</span>
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ formatTime(race.time) }}
            </td>
            <td class="px-4 py-3 text-gray-600">
              {{ race.errors }}
            </td>
            <td class="px-4 py-3">
              <span class="text-gray-800 truncate max-w-[150px] block">
                {{ race.quoteSource || `Quote #${race.quoteId}` }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span v-if="race.pokemonName" class="text-purple-600 font-medium">
                {{ race.pokemonName }}
              </span>
              <span v-else class="text-gray-400">-</span>
            </td>
            <td class="px-4 py-3 text-gray-500 text-sm">
              {{ formatDate(race.date) }}
            </td>
          </tr>
          <tr v-if="displayedRaces.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-400">
              No races found. Start racing to see your history!
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalRaces > pageSize" class="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
      <span class="text-sm text-gray-500">
        Showing {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalRaces) }} of {{ totalRaces }}
      </span>
      <div class="flex gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          :class="[
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Previous
        </button>
        <button
          @click="currentPage++"
          :disabled="currentPage * pageSize >= totalRaces"
          :class="[
            'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
            currentPage * pageSize >= totalRaces
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRaceHistory } from '../composables/useRaceHistory'

const { getFilteredHistory, getRaceCountByQuote } = useRaceHistory()

const columns = [
  { key: 'wpm', label: 'WPM', sortable: true },
  { key: 'accuracy', label: 'Accuracy', sortable: true },
  { key: 'time', label: 'Time', sortable: true },
  { key: 'errors', label: 'Errors', sortable: true },
  { key: 'quoteSource', label: 'Quote', sortable: false },
  { key: 'pokemonName', label: 'Pokemon', sortable: false },
  { key: 'date', label: 'Date', sortable: true }
]

const sortBy = ref('date')
const sortOrder = ref('desc')
const filterQuote = ref(null)
const currentPage = ref(1)
const pageSize = 10

const uniqueQuotes = computed(() => getRaceCountByQuote())

const filteredResult = computed(() => {
  return getFilteredHistory({
    sortBy: sortBy.value,
    order: sortOrder.value,
    quoteId: filterQuote.value,
    limit: pageSize,
    offset: (currentPage.value - 1) * pageSize
  })
})

const displayedRaces = computed(() => filteredResult.value.data)
const totalRaces = computed(() => filteredResult.value.total)

// Reset page when filter changes
watch(filterQuote, () => {
  currentPage.value = 1
})

function toggleSort(key) {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
  } else {
    sortBy.value = key
    sortOrder.value = 'desc'
  }
  currentPage.value = 1
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

function accuracyClass(accuracy) {
  if (accuracy >= 98) return 'text-green-600 font-medium'
  if (accuracy >= 95) return 'text-green-500'
  if (accuracy >= 90) return 'text-yellow-600'
  return 'text-orange-500'
}
</script>

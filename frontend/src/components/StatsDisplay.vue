<template>
  <div class="grid grid-cols-4 gap-4">
    <!-- WPM -->
    <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
      <div class="text-sm text-gray-500 uppercase tracking-wide">WPM</div>
      <div class="text-3xl font-bold text-blue-600">{{ wpm }}</div>
    </div>

    <!-- Accuracy -->
    <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
      <div class="text-sm text-gray-500 uppercase tracking-wide">Accuracy</div>
      <div class="text-3xl font-bold text-green-600">{{ accuracy }}%</div>
    </div>

    <!-- Time -->
    <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-purple-500">
      <div class="text-sm text-gray-500 uppercase tracking-wide">Time</div>
      <div class="text-3xl font-bold text-purple-600">{{ time }}</div>
    </div>

    <!-- Words -->
    <div class="bg-white rounded-lg p-4 shadow-md border-l-4 border-orange-500">
      <div class="text-sm text-gray-500 uppercase tracking-wide">Words</div>
      <div class="text-3xl font-bold text-orange-600">
        {{ currentWords }}<span class="text-lg text-gray-400">/{{ totalWords }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  wpm: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 100
  },
  time: {
    type: String,
    default: '0:00'
  },
  currentWords: {
    type: Number,
    default: 0
  },
  totalWords: {
    type: Number,
    default: 0
  }
})
</script>

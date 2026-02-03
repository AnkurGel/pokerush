<template>
  <div class="bg-gray-100 rounded-lg p-6 font-mono text-lg leading-relaxed border-2 border-gray-300">
    <div class="whitespace-pre-wrap">
      <!-- Completed text -->
      <span class="text-green-600">{{ completedText }}</span>

      <!-- Current character -->
      <span
        class="relative inline-block min-w-[0.5em]"
        :class="{
          'bg-yellow-200 rounded': !hasError,
          'bg-red-300 animate-shake rounded': hasError
        }"
      >
        <span :class="{ 'opacity-50': currentChar === ' ' }">{{ displayCurrentChar }}</span>
        <span
          v-if="isActive"
          class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 cursor-blink"
        ></span>
      </span>

      <!-- Remaining text -->
      <span class="text-gray-400">{{ remainingText }}</span>
    </div>

    <!-- Source attribution -->
    <div v-if="source" class="mt-4 text-sm text-gray-500 italic text-right">
      — {{ source }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completedText: {
    type: String,
    default: ''
  },
  currentChar: {
    type: String,
    default: ''
  },
  remainingText: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: ''
  },
  hasError: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

// Show a visible indicator for space character
const displayCurrentChar = computed(() => {
  if (props.currentChar === ' ') {
    return '·' // middle dot to indicate space
  }
  return props.currentChar || ''
})
</script>

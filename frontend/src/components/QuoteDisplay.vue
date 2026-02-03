<template>
  <div class="bg-gray-100 rounded-lg p-6 font-mono text-lg leading-relaxed border-2 border-gray-300">
    <div class="flex flex-wrap">
      <!-- Completed text -->
      <span class="text-green-600">{{ completedText }}</span>

      <!-- Current character -->
      <span
        class="relative"
        :class="{
          'bg-yellow-200': !hasError,
          'bg-red-300 animate-shake': hasError
        }"
      >
        {{ currentChar || '' }}
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
defineProps({
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
</script>

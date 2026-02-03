<template>
  <div class="relative">
    <!-- Hidden input for capturing keystrokes -->
    <input
      ref="inputRef"
      type="text"
      class="absolute opacity-0 w-full h-full cursor-default"
      @keydown="handleKeyDown"
      @blur="handleBlur"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
    />

    <!-- Visual prompt -->
    <div
      class="p-4 rounded-lg border-2 text-center cursor-text transition-colors"
      :class="{
        'border-blue-400 bg-blue-50': isFocused,
        'border-gray-300 bg-gray-50 hover:border-gray-400': !isFocused
      }"
      @click="focusInput"
    >
      <div v-if="isFocused" class="text-blue-600 font-medium">
        ⌨️ Type the text above...
      </div>
      <div v-else class="text-gray-500">
        Click here or press any key to start typing
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['keypress'])

const inputRef = ref(null)
const isFocused = ref(false)

function handleKeyDown(event) {
  // Ignore modifier keys and special keys
  if (event.ctrlKey || event.metaKey || event.altKey) return

  // Only process printable characters and space
  if (event.key.length === 1) {
    event.preventDefault()
    emit('keypress', event.key)
  }
}

function handleBlur() {
  isFocused.value = false
}

function focusInput() {
  if (inputRef.value) {
    inputRef.value.focus()
    isFocused.value = true
  }
}

// Global keydown listener to auto-focus
function handleGlobalKeyDown(event) {
  if (!isFocused.value && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    focusInput()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeyDown)
  // Auto-focus on mount
  setTimeout(() => focusInput(), 100)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeyDown)
})

// Expose focus method for parent
defineExpose({ focusInput })
</script>

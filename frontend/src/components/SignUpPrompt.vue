<template>
  <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
    <div class="flex items-start gap-4">
      <div class="text-3xl">☁️</div>
      <div class="flex-1">
        <h3 class="font-bold text-lg mb-1">Save Your Progress!</h3>
        <p class="text-purple-100 text-sm mb-4">
          Create an account to sync your {{ raceCount }} race{{ raceCount !== 1 ? 's' : '' }} to the cloud,
          compete on the global leaderboard, and never lose your stats.
        </p>
        <div class="flex gap-3">
          <button
            @click="$emit('signup')"
            class="px-4 py-2 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors"
          >
            Create Account
          </button>
          <button
            @click="$emit('signin')"
            class="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-400 transition-colors"
          >
            Sign In
          </button>
        </div>
        <button
          @click="$emit('dismiss')"
          class="mt-3 text-purple-200 text-xs hover:text-white transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  raceCount: {
    type: Number,
    default: 1
  }
})

defineEmits(['signup', 'signin', 'dismiss'])
</script>

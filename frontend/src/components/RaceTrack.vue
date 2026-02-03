<template>
  <div class="relative w-full h-36 rounded-lg overflow-hidden border-4 border-green-800 bg-gradient-to-b from-green-300 via-green-400 to-green-500">
    <!-- Sky/top decoration -->
    <div class="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-sky-300 to-transparent"></div>

    <!-- Track/path -->
    <div class="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-14 bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 border-y-2 border-amber-600">
      <!-- Track dashes -->
      <div class="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4">
        <div v-for="i in 10" :key="i" class="w-8 h-1 bg-amber-100 rounded"></div>
      </div>
    </div>

    <!-- Pokemon -->
    <div
      class="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-out z-10"
      :style="{ left: `calc(${Math.min(progress * 82, 82)}% + 10px)` }"
      :class="{ 'animate-capture': isCapturing }"
    >
      <img
        :src="pokemon?.sprite || pokemon?.static"
        :alt="pokemon?.name || 'Pokemon'"
        class="w-16 h-16 object-contain pokemon-sprite drop-shadow-lg"
        :class="{ 'pokemon-run': !isCapturing && progress > 0 && progress < 1 }"
      />
      <div class="text-xs text-center font-bold text-gray-700 bg-white/80 rounded px-1 -mt-1 shadow">
        {{ pokemon?.name || 'Pokemon' }}
      </div>
    </div>

    <!-- Pokeball finish line -->
    <div class="absolute top-1/2 -translate-y-1/2 right-4 z-0">
      <div
        class="pokeball"
        :class="{
          'animate-pokeball-shake': isCapturing,
          'animate-glow': progress >= 1
        }"
      ></div>
    </div>

    <!-- Progress indicator -->
    <div class="absolute bottom-1 left-2 right-2">
      <div class="h-1.5 bg-gray-300/50 rounded-full overflow-hidden">
        <div
          class="h-full bg-yellow-400 transition-all duration-100 rounded-full"
          :style="{ width: `${progress * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Finish flag -->
    <div class="absolute top-2 right-2 text-lg">🏁</div>

    <!-- Start flag -->
    <div class="absolute top-2 left-2 text-lg">🚩</div>
  </div>
</template>

<script setup>
defineProps({
  progress: {
    type: Number,
    default: 0
  },
  pokemon: {
    type: Object,
    default: () => ({ name: 'Pikachu', sprite: '' })
  },
  isCapturing: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.pokemon-run {
  animation: pokemon-bounce 0.4s ease-in-out infinite;
}

@keyframes pokemon-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
</style>

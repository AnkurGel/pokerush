<template>
  <div class="bg-white rounded-xl shadow-md p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-gray-800">Pokemon Collection</h3>
      <span class="text-sm text-gray-500">
        {{ caughtCount }}/{{ totalPokemon }} caught
      </span>
    </div>

    <!-- Progress bar -->
    <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
      <div
        class="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
        :style="{ width: `${progressPercent}%` }"
      ></div>
    </div>

    <!-- Pokemon Grid -->
    <div class="grid grid-cols-5 gap-3">
      <div
        v-for="pokemon in allPokemon"
        :key="pokemon.id"
        :class="[
          'relative rounded-lg p-2 transition-all duration-200 group',
          isCaught(pokemon.name)
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300'
            : 'bg-gray-100 border-2 border-gray-200'
        ]"
      >
        <div class="relative">
          <img
            :src="isCaught(pokemon.name) ? pokemon.sprite : pokemon.static"
            :alt="pokemon.name"
            :class="[
              'w-12 h-12 mx-auto object-contain transition-all duration-200',
              isCaught(pokemon.name) ? '' : 'grayscale opacity-30'
            ]"
            @error="handleImageError"
          />
          <!-- Caught indicator -->
          <div
            v-if="isCaught(pokemon.name)"
            class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
          >
            <span class="text-white text-xs">✓</span>
          </div>
        </div>
        <p
          :class="[
            'text-xs text-center mt-1 truncate',
            isCaught(pokemon.name) ? 'text-gray-800 font-medium' : 'text-gray-400'
          ]"
        >
          {{ isCaught(pokemon.name) ? pokemon.name : '???' }}
        </p>
        <!-- Catch count tooltip -->
        <div
          v-if="isCaught(pokemon.name) && getCatchCount(pokemon.name) > 0"
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ×{{ getCatchCount(pokemon.name) }}
        </div>
      </div>
    </div>

    <!-- Collection complete message -->
    <div
      v-if="caughtCount === totalPokemon"
      class="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-3 text-center"
    >
      <span class="font-bold">Congratulations!</span> You've caught them all!
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStats } from '../composables/useStats'
import { useRaceHistory } from '../composables/useRaceHistory'

// Full Pokemon pool (same as useTypingGame)
const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const allPokemon = [
  { id: 25, name: 'Pikachu', sprite: `${SPRITE_BASE}/other/showdown/25.gif`, static: `${SPRITE_BASE}/25.png` },
  { id: 4, name: 'Charmander', sprite: `${SPRITE_BASE}/other/showdown/4.gif`, static: `${SPRITE_BASE}/4.png` },
  { id: 7, name: 'Squirtle', sprite: `${SPRITE_BASE}/other/showdown/7.gif`, static: `${SPRITE_BASE}/7.png` },
  { id: 1, name: 'Bulbasaur', sprite: `${SPRITE_BASE}/other/showdown/1.gif`, static: `${SPRITE_BASE}/1.png` },
  { id: 133, name: 'Eevee', sprite: `${SPRITE_BASE}/other/showdown/133.gif`, static: `${SPRITE_BASE}/133.png` },
  { id: 39, name: 'Jigglypuff', sprite: `${SPRITE_BASE}/other/showdown/39.gif`, static: `${SPRITE_BASE}/39.png` },
  { id: 52, name: 'Meowth', sprite: `${SPRITE_BASE}/other/showdown/52.gif`, static: `${SPRITE_BASE}/52.png` },
  { id: 54, name: 'Psyduck', sprite: `${SPRITE_BASE}/other/showdown/54.gif`, static: `${SPRITE_BASE}/54.png` },
  { id: 94, name: 'Gengar', sprite: `${SPRITE_BASE}/other/showdown/94.gif`, static: `${SPRITE_BASE}/94.png` },
  { id: 143, name: 'Snorlax', sprite: `${SPRITE_BASE}/other/showdown/143.gif`, static: `${SPRITE_BASE}/143.png` },
  { id: 6, name: 'Charizard', sprite: `${SPRITE_BASE}/other/showdown/6.gif`, static: `${SPRITE_BASE}/6.png` },
  { id: 9, name: 'Blastoise', sprite: `${SPRITE_BASE}/other/showdown/9.gif`, static: `${SPRITE_BASE}/9.png` },
  { id: 3, name: 'Venusaur', sprite: `${SPRITE_BASE}/other/showdown/3.gif`, static: `${SPRITE_BASE}/3.png` },
  { id: 150, name: 'Mewtwo', sprite: `${SPRITE_BASE}/other/showdown/150.gif`, static: `${SPRITE_BASE}/150.png` },
  { id: 151, name: 'Mew', sprite: `${SPRITE_BASE}/other/showdown/151.gif`, static: `${SPRITE_BASE}/151.png` }
]

const { pokemonCaught } = useStats()
const { getRaceCountByPokemon } = useRaceHistory()

const totalPokemon = allPokemon.length
const caughtCount = computed(() => pokemonCaught.value.length)
const progressPercent = computed(() => Math.round((caughtCount.value / totalPokemon) * 100))

const pokemonCatchCounts = computed(() => {
  const counts = {}
  getRaceCountByPokemon().forEach(({ name, count }) => {
    counts[name] = count
  })
  return counts
})

function isCaught(name) {
  return pokemonCaught.value.includes(name)
}

function getCatchCount(name) {
  return pokemonCatchCounts.value[name] || 0
}

function handleImageError(event) {
  // Fallback to static sprite if animated fails
  const img = event.target
  const pokemon = allPokemon.find(p => img.alt === p.name)
  if (pokemon && img.src !== pokemon.static) {
    img.src = pokemon.static
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          {{ isLogin ? 'Welcome Back!' : 'Join PokéRush' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm"
      >
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Display Name (Register only) -->
        <div v-if="!isLogin">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Display Name
          </label>
          <input
            v-model="displayName"
            type="text"
            required
            minlength="2"
            maxlength="50"
            placeholder="Trainer Red"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="trainer@pokemon.com"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            :minlength="isLogin ? 1 : 6"
            placeholder="••••••••"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
          />
          <p v-if="!isLogin" class="text-xs text-gray-500 mt-1">
            At least 6 characters
          </p>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>{{ isLogin ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>

      <!-- Toggle Login/Register -->
      <div class="mt-6 text-center text-sm text-gray-600">
        <span v-if="isLogin">
          Don't have an account?
          <button
            @click="isLogin = false"
            class="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Sign up
          </button>
        </span>
        <span v-else>
          Already have an account?
          <button
            @click="isLogin = true"
            class="text-yellow-600 hover:text-yellow-700 font-medium"
          >
            Sign in
          </button>
        </span>
      </div>

      <!-- Guest Mode Info -->
      <div class="mt-4 p-3 bg-gray-100 rounded-lg text-center">
        <p class="text-sm text-gray-600">
          You can also play as a guest - your scores will be saved locally.
        </p>
        <button
          @click="$emit('close')"
          class="text-sm text-gray-500 hover:text-gray-700 mt-1 underline"
        >
          Continue as guest
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  initialMode: {
    type: String,
    default: 'login',
    validator: (v) => ['login', 'register'].includes(v)
  }
})

const emit = defineEmits(['close', 'success'])

const { register, login, isLoading } = useAuth()

const isLogin = ref(props.initialMode === 'login')
const email = ref('')
const password = ref('')
const displayName = ref('')
const errorMessage = ref('')

// Reset form when modal opens/closes
watch(() => props.isOpen, (open) => {
  if (open) {
    email.value = ''
    password.value = ''
    displayName.value = ''
    errorMessage.value = ''
    isLogin.value = props.initialMode === 'login'
  }
})

// Clear error when switching modes
watch(isLogin, () => {
  errorMessage.value = ''
})

async function handleSubmit() {
  errorMessage.value = ''

  try {
    if (isLogin.value) {
      await login(email.value, password.value)
    } else {
      await register(email.value, password.value, displayName.value)
    }
    emit('success')
    emit('close')
  } catch (err) {
    errorMessage.value = err.message || 'An error occurred'
  }
}
</script>

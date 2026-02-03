<template>
  <div class="bg-white rounded-xl shadow-md p-4 border border-gray-100">
    <div class="flex items-center justify-between mb-2">
      <span class="text-gray-500 text-sm font-medium">{{ label }}</span>
      <span v-if="icon" class="text-xl">{{ icon }}</span>
    </div>
    <div class="flex items-end gap-2">
      <span :class="['text-2xl font-bold', colorClass]">{{ formattedValue }}</span>
      <span v-if="suffix" class="text-gray-400 text-sm mb-1">{{ suffix }}</span>
    </div>
    <div v-if="subtext" class="text-gray-400 text-xs mt-1">{{ subtext }}</div>
    <div v-if="trend !== null" class="mt-2 flex items-center gap-1">
      <span :class="trendClass">
        {{ trend >= 0 ? '+' : '' }}{{ trend }}{{ trendSuffix }}
      </span>
      <span class="text-gray-400 text-xs">vs previous</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  suffix: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: 'blue',
    validator: (v) => ['blue', 'green', 'purple', 'orange', 'red', 'yellow'].includes(v)
  },
  subtext: {
    type: String,
    default: ''
  },
  trend: {
    type: Number,
    default: null
  },
  trendSuffix: {
    type: String,
    default: ''
  },
  format: {
    type: String,
    default: 'number',
    validator: (v) => ['number', 'percent', 'time', 'text'].includes(v)
  }
})

const colorClass = computed(() => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  }
  return colors[props.color] || colors.blue
})

const trendClass = computed(() => {
  if (props.trend === null) return ''
  return props.trend >= 0 ? 'text-green-500 text-sm font-medium' : 'text-red-500 text-sm font-medium'
})

const formattedValue = computed(() => {
  if (props.format === 'text') return props.value
  if (props.format === 'percent') return `${props.value}%`
  if (props.format === 'time') return props.value
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

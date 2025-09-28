<template>
  <button :class="classes" v-bind="$attrs" @click="onClick">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const classes = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  { 'btn--disabled': props.disabled },
])

const onClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  outline: none;
}

.btn:focus-visible {
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.btn--small {
  padding: 8px 12px;
  font-size: 14px;
}

.btn--medium {
  padding: 12px 16px;
  font-size: 16px;
}

.btn--large {
  padding: 16px 24px;
  font-size: 18px;
}

.btn--primary {
  background-color: #3b82f6;
  color: white;
}

.btn--primary:hover:not(.btn--disabled) {
  background-color: #2563eb;
}

.btn--secondary {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn--secondary:hover:not(.btn--disabled) {
  background-color: #e5e7eb;
}

.btn--danger {
  background-color: #ef4444;
  color: white;
}

.btn--danger:hover:not(.btn--disabled) {
  background-color: #dc2626;
}

.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

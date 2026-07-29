<script setup>
import { useThemeStore } from '../stores/theme'
import { icons } from '../icons'

const themeStore = useThemeStore()
</script>


<style scoped>
.toggle {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-ink-soft);
}
.toggle:hover { color: var(--color-accent); border-color: var(--color-accent); }
.toggle span { width: 18px; height: 18px; display: block; }
.toggle :deep(svg) { width: 100%; height: 100%; }
</style>

<template>
    <button class="toggle" @click="themeStore.toggle()" :aria-label="themeStore.dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'">
        <span v-html="themeStore.dark ? icons.sun : icons.moon"></span>
    </button>
</template>
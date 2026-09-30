<script setup>
import { useThemeStore } from '../stores/theme'
import { icons } from '../icons'

const themeStore = useThemeStore()
</script>


<style scoped>
.toggle {
  display: flex; align-items: center; justify-content: center;
  width: 40px; height: 40px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 50%;
  cursor: pointer;
  color: var(--color-ink-soft);
}
.toggle:hover { color: var(--color-accent); border-color: var(--color-accent); }
[data-theme='dark'] .toggle { color: var(--color-accent); border-color: var(--color-accent-border); box-shadow: 0 0 18px -4px rgba(56, 189, 248, 0.5); }
.toggle span { width: 18px; height: 18px; display: block; }
.toggle :deep(svg) { width: 100%; height: 100%; }
</style>

<template>
    <button class="toggle" @click="themeStore.toggle()" :aria-label="themeStore.dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'">
        <span v-html="themeStore.dark ? icons.sun : icons.moon"></span>
    </button>
</template>
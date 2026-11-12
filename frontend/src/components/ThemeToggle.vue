<script setup>
import { useThemeStore } from '../stores/theme'
import { icons } from '../icons'

const themeStore = useThemeStore()
</script>

<template>
  <button class="toggle" @click="themeStore.toggle()" :aria-label="themeStore.dark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'">
    <span class="ic" v-html="themeStore.dark ? icons.sun : icons.moon"></span>
    <span class="lbl">{{ themeStore.dark ? 'Light' : 'Dark' }}</span>
  </button>
</template>

<style scoped>
.toggle {
  display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 14px;
  border: 1px solid var(--color-border); background: var(--color-surface); border-radius: 999px;
  cursor: pointer; color: var(--color-ink); font: inherit; font-size: 12px; font-weight: 700; transition: 0.18s ease;
}
.toggle:hover { border-color: var(--gold); }
.ic { width: 17px; height: 17px; display: block; }
.ic :deep(svg) { width: 100%; height: 100%; }
@media (max-width: 760px) { .lbl { display: none; } .toggle { padding: 0 10px; } }
</style>

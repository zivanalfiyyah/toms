<script setup>
import { icons } from '../icons'

defineProps({
  href: { type: String, required: true }
})
</script>

<style scoped>
.edit-page {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 3rem 0 2rem;
}
.edit-page::before,
.edit-page::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}
.edit-page a {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  white-space: nowrap;
}
.edit-page a:hover { color: var(--color-accent); text-decoration: none; }
.edit-icon { width: 14px; height: 14px; }
.edit-icon :deep(svg) { width: 100%; height: 100%; }
</style>

<template>
  <div class="edit-page">
    <a :href="href" target="_blank" rel="noopener">
      <span v-html="icons.edit" class="edit-icon"></span>
      Ubah halaman ini
    </a>
  </div>
</template>
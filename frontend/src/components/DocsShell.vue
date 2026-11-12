<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'

// Kerangka halaman dokumentasi (sidebar + isi), sama dengan desain portal.
defineProps({ noToc: { type: Boolean, default: false }, title: { type: String, default: 'Daftar Isi' } })
const open = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <div class="shell docs-shell" :class="{ 'no-toc': noToc, 'side-open': open }">
    <button type="button" class="docs-side-toggle" :aria-expanded="open" @click="open = !open">
      <span><small>DAFTAR ISI</small><b>{{ title }}</b></span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
    </button>
    <AppSidebar />
    <slot />
  </div>
</template>

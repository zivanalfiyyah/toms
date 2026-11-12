<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useSiteSearch } from '../utils/useSiteSearch'
import SearchResults from './SearchResults.vue'

// Kotak pencarian di hero: saran muncul tepat di bawah kotak (kaca buram, membulat).
defineProps({ compact: Boolean })
const open = ref(false)
const root = ref(null)
const s = useSiteSearch(() => { open.value = false })

function onFocus() { open.value = true; s.ensureData() }
function onDown(e) { if (root.value && !root.value.contains(e.target)) open.value = false }
onMounted(() => document.addEventListener('mousedown', onDown))
onBeforeUnmount(() => document.removeEventListener('mousedown', onDown))
</script>

<template>
  <div ref="root" class="hs-wrap">
    <form class="search" :class="{ compact }" @submit.prevent="s.enter()">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>
      <input v-model="s.query.value" placeholder="Cari SOP, kebijakan, formulir, atau kata kunci..." aria-label="Cari dokumen" autocomplete="off" @focus="onFocus" @input="open = true" @keydown.down.prevent="s.down()" @keydown.up.prevent="s.up()" @keydown.esc="open = false" />
      <button type="submit">Cari Dokumen</button>
    </form>
    <div v-if="open" class="hs-panel"><SearchResults :s="s" /></div>
  </div>
</template>

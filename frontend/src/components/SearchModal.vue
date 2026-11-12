<script setup>
import { onMounted, ref } from 'vue'
import { useSiteSearch } from '../utils/useSiteSearch'
import SearchResults from './SearchResults.vue'

// Kotak pencarian navbar: muncul tepat di bawah navbar (bukan layar penuh), kaca buram & membulat.
const emit = defineEmits(['close'])
const s = useSiteSearch(() => emit('close'))
const inputEl = ref(null)
onMounted(() => { inputEl.value?.focus(); s.ensureData() })
</script>

<template>
  <Teleport to="body">
    <div class="ob-scrim" @mousedown.self="$emit('close')">
      <div class="ob-pop" role="dialog" aria-label="Cari dokumen">
        <div class="ob-input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>
          <input ref="inputEl" v-model="s.query.value" type="text" placeholder="Cari judul kategori atau halaman..." autocomplete="off" @keydown.enter.prevent="s.enter()" @keydown.down.prevent="s.down()" @keydown.up.prevent="s.up()" @keydown.esc="$emit('close')" />
          <kbd>Esc</kbd>
        </div>
        <SearchResults :s="s" />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { highlightParts } from '../utils/searchIndex'

// Daftar saran pencarian (dipakai kotak navbar & kotak hero). `s` = hasil useSiteSearch().
defineProps({ s: { type: Object, required: true } })
</script>

<template>
  <div class="ob-results">
    <ul v-if="s.rows.value.length" :ref="(el) => (s.listEl.value = el)" class="ob-list">
      <li v-for="(row, i) in s.rows.value" :key="row.kind === 'result' ? row.r.key : row.t">
        <div v-if="row.kind === 'recent'" class="ob-row" :class="{ active: s.selected.value === i }" @mouseenter="s.selected.value = i" @click="s.activate(row)">
          <span class="ob-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></span>
          <span class="ob-text">{{ row.t }}</span>
          <button type="button" class="ob-del" @click.stop="s.removeRecent(row.t)">Hapus</button>
        </div>
        <button v-else type="button" class="ob-row" :class="{ active: s.selected.value === i }" @mouseenter="s.selected.value = i" @click="s.activate(row)">
          <span class="ob-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg></span>
          <span class="ob-text">
            <template v-for="(part, k) in highlightParts(row.r.title, s.query.value)" :key="k"><span v-if="part.hit">{{ part.text }}</span><b v-else>{{ part.text }}</b></template>
          </span>
          <span class="ob-meta">{{ row.r.trail || row.r.type }}</span>
        </button>
      </li>
    </ul>
    <p v-else-if="s.query.value.trim() && !s.toc.tree.length" class="ob-empty">Memuat data pencarian…</p>
    <p v-else-if="s.query.value.trim()" class="ob-empty">Tidak ada hasil untuk "<strong>{{ s.query.value }}</strong>".</p>
    <p v-else class="ob-empty">Ketik kata kunci untuk mulai mencari...</p>
    <p v-if="s.query.value.trim() && s.toc.tree.length && s.toc.pending > 0" class="ob-note">Masih memuat level yang lebih dalam… hasil bisa bertambah.</p>
  </div>
</template>

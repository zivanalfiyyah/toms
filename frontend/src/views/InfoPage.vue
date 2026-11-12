<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { infoGroups } from '../data/sample'

const router = useRouter()
const items = ref([])
const loading = ref(true)
const failed = ref(false)

const newsIcons = {
  0: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3Z"></path><path d="M12 9v5m0 3h.01"></path></svg>`,
  1: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h8l4 4v16H6z"></path><path d="M14 2v5h5M9 12h6M9 16h6"></path></svg>`,
  2: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"></path></svg>`,
  3: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>`
}
const leadFallbackImg = 'https://images.unsplash.com/photo-1605068263928-dc295689add1?auto=format&fit=crop&w=1200&q=85'

onMounted(async () => {
  try {
    items.value = (await api.get('/announcements')).data
  } catch (e) {
    failed.value = true
  } finally {
    loading.value = false
  }
})

const lead = computed(() => items.value.find((a) => a.is_lead) || items.value[0] || null)
const news = computed(() => items.value.filter((a) => a.id !== lead.value?.id))

const fmt = (d, long = false) =>
  d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: long ? 'long' : 'short', year: 'numeric' }) : ''
const open = (a) => router.push(`/informasi/${a.id}`)
</script>

<template>
  <div class="dz">
<section class="page-hero"><div class="shell"><div><span class="eyebrow light">NEWSROOM</span><h1>Informasi &amp; Pembaruan</h1><p>Pengumuman resmi, safety alert, agenda, dan wawasan operasional terkini.</p></div></div></section><section class="section shell info-layout">
<p v-if="loading" class="info-state">Memuat informasi…</p>
<p v-else-if="failed" class="info-state">Informasi belum dapat dimuat. Coba lagi beberapa saat.</p>
<p v-else-if="!items.length" class="info-state">Belum ada pengumuman.</p>
<article v-if="lead" class="lead-story"><div class="lead-img"><img :alt="lead.title" :src="lead.image_url || leadFallbackImg"><span>{{ lead.tag }}</span></div><div><small>{{ fmt(lead.published_at, true).toUpperCase() }}</small><h2>{{ lead.title }}</h2><p>{{ lead.excerpt }}</p><button @click="open(lead)">Baca selengkapnya <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></div></article>
<aside class="info-side"><span class="eyebrow">SOROTAN MINGGU INI</span><h3>Safety Campaign</h3><strong>Zero Preventable<br>Accident</strong><p>Materi kampanye dan toolkit kini tersedia untuk seluruh cabang.</p><button>Unduh toolkit</button></aside>
<div v-if="news.length" class="news-grid"><article v-for="(a, i) in news" :key="a.id"><div><span class="news-icon" :class="`n${i % 4}`" v-html="newsIcons[i % 4]"></span><b v-if="a.badge">{{ a.badge }}</b></div><small>{{ a.tag }} • {{ fmt(a.published_at) }}</small><h3>{{ a.title }}</h3><p>{{ a.excerpt }}</p><button @click="open(a)">Baca informasi <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></article></div>
<div class="info-categories"><div class="section-head"><div><h2>Kelompok Informasi</h2></div></div><div><button v-for="(g, i) in infoGroups" :key="g"><span>{{ String(i + 1).padStart(2, '0') }}</span>{{ g }}<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg></button></div></div></section>
  </div>
</template>

<style>
.dz .info-state { grid-column: 1 / -1; color: var(--muted); }
</style>

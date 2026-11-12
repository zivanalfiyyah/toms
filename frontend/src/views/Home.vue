<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { kpiAreas } from '../data/sample'
import { storeToRefs } from 'pinia'
import { usePortalStore } from '../stores/portal'
import api from '../api'
import HeroSearch from '../components/HeroSearch.vue'
import LatestDocs from '../components/LatestDocs.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const portal = usePortalStore()
portal.load()
const { babTopics } = storeToRefs(portal)

const router = useRouter()
const docsStore = useDocsStore()
const openIdx = ref(0)

onMounted(() => {
  if (!docsStore.categories.length) docsStore.fetchCategories()
})

const cats = computed(() => docsStore.categories)
const go = (to) => router.push(to)

// Pencarian global dibuka lewat Ctrl/Cmd + K (didengar di App.vue)
function openSearch() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
}

// Pencarian populer: buka halaman yang judulnya cocok; jika tidak ada, buka kotak pencarian
const popularTerms = ['SOP Keberangkatan', 'Safety Campaign', 'KPI dan SLA']
function goPopular(term) {
  const p = docsStore.flatPages.find((x) => (x.title || '').toLowerCase().includes(term.toLowerCase()))
  if (p) router.push(`/docs/${p.categorySlug}/${p.fullPath}`)
  else openSearch()
}

// Bab lampiran: bab yang namanya memuat formulir/lampiran; jika tidak ada, bab terakhir
const annexCat = computed(() => cats.value.find((c) => /lampiran|formulir/i.test(c.name)) || cats.value[cats.value.length - 1] || null)
const annexPages = computed(() => annexCat.value?.pages || [])
const annexTo = computed(() => (annexCat.value ? `/docs/${annexCat.value.slug}` : '/daftar-isi'))

// Topik pada panel bab: bisa string biasa atau { t, to } (tautan ke halaman relevan).
const topicText = (t) => (typeof t === 'string' ? t : t.t)
const topicTo = (t) => (typeof t === 'string' ? null : t.to || null)

// Angka resmi dari server: bab, dan topik = bab + seluruh halaman (sama dengan Daftar Isi).
const pub = ref(null)
onMounted(() => {
  api.get('/public-stats').then((r) => { pub.value = r.data }).catch(() => {})
})

const stats = computed(() => [
  [pub.value?.categories_count ?? cats.value.length, 'Bab dokumentasi'],
  [pub.value?.topics_count ?? docsStore.flatPages.length, 'Topik terdata'],
  [annexPages.value.length, 'SOP & formulir lampiran'],
  [kpiAreas.length, 'Area dashboard'],
])
</script>

<template>
  <div class="dz">
    <section class="hero">
      <div class="hero-shade"></div>
      <div class="shell hero-content">
        <div class="hero-copy">
          <span class="hero-label"><i></i> TOMS KNOWLEDGE CENTER</span>
          <h1>Panduan TOMS</h1>
          <p>Pusat informasi SOP, kebijakan, KPI, SLA, dan standar operasional untuk mendukung layanan transportasi yang aman, profesional, dan terpercaya.</p>
          <div class="search-wrap">
            <HeroSearch />
          </div>
          <div class="hero-links"><span>Pencarian populer:</span><button v-for="t in popularTerms" :key="t" @click="goPopular(t)">{{ t }}</button></div>
        </div>
        <div class="hero-status"><span>STATUS OPERASIONAL</span><div><b>98.7%</b><p>Ketepatan jadwal<br><strong>Hari ini</strong></p></div><hr><small><i></i> Data contoh, belum terhubung</small></div>
      </div>
    </section>

    <section class="stats-strip">
      <div class="shell">
        <div v-for="(s, i) in stats" :key="s[1]"><span>0{{ i + 1 }}</span><b>{{ s[0] }}</b><p>{{ s[1] }}</p></div>
      </div>
    </section>

    <section class="section shell">
      <div class="section-head"><div><h2>Topik Dokumentasi</h2><p>Pilih bab yang ingin kamu pelajari. Setiap bab berisi panduan lengkap.</p></div><button class="text-btn" @click="go('/daftar-isi')">Lihat Semua Bab <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></div>
      <div class="bab-acc">
        <div v-for="(bab, i) in babTopics" :key="bab.title" class="bab-acc-item" :class="{ open: openIdx === i }">
          <button class="bab-acc-head" :id="`bab-h-${i}`" :aria-expanded="openIdx === i" :aria-controls="`bab-p-${i}`" @click="openIdx = openIdx === i ? -1 : i"><span class="bab-acc-no">{{ String(i + 1).padStart(2, '0') }}</span><span class="bab-acc-title">{{ bab.title }}</span><span class="bab-acc-act"><span class="bab-acc-lbl">{{ openIdx === i ? 'Tutup' : 'Lihat Detail' }}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></span></button>
          <div class="bab-acc-panel" :id="`bab-p-${i}`" role="region" :aria-labelledby="`bab-h-${i}`"><div class="bab-acc-inner"><div class="bab-acc-card">
            <p class="bab-acc-goal"><strong>Tujuan: </strong>{{ bab.goal }}</p>
            <ul><li v-for="(t, k) in bab.topics" :key="k"><router-link v-if="topicTo(t)" :to="topicTo(t)">{{ topicText(t) }}</router-link><template v-else>{{ topicText(t) }}</template></li></ul>
            <small>{{ bab.topics.length }} topik dalam bab ini</small>
          </div></div></div>
        </div>
      </div>
    </section>

    <section v-if="auth.isLoggedIn" class="section shell latest-docs">
      <div class="section-head"><div><span class="eyebrow">AUDIT DOKUMEN</span><h2>Dokumen Terbaru</h2><p>Kategori dan halaman yang baru ditambahkan atau diperbarui, lengkap dengan nomor revisi.</p></div><button class="text-btn" @click="go('/dokumen-terbaru')">Lihat Semua <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></div>
      <LatestDocs :limit="6" />
    </section>

    <section v-if="annexCat" class="section latest-section">
      <div class="shell"><div class="annex">
        <div class="annex-side"><span class="eyebrow">LAMPIRAN</span><h2>{{ annexCat.name }}</h2><p>{{ annexCat.description || 'Dokumen pendukung operasional.' }}</p><div class="annex-count"><b>{{ annexPages.length }}</b><span>dokumen</span></div><button class="annex-link" @click="go(`/docs/${annexCat.slug}`)">Lihat semua lampiran<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></div>
        <ol class="annex-list">
          <li v-for="(p, i) in annexPages.slice(0, 7)" :key="p.id"><button class="annex-row" @click="go(`/docs/${annexCat.slug}/${p.slug}`)"><i>{{ String(i + 1).padStart(2, '0') }}</i><span>{{ p.title }}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></li>
          <li v-if="annexPages.length > 7"><button class="annex-row more" @click="go(`/docs/${annexCat.slug}`)"><i>+</i><span>{{ annexPages.length - 7 }} dokumen lainnya</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button></li>
        </ol>
      </div></div>
    </section>

    <section class="section shell quick-layout">
      <div>
        <div class="section-head"><div><span class="eyebrow">AKSES LANGSUNG</span><h2>Akses Cepat</h2><p>Jalur singkat menuju layanan yang paling sering digunakan.</p></div></div>
        <div class="quick-grid"><button @click="go('/daftar-isi')"><span class="cat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h8l4 4v16H6z"></path><path d="M14 2v5h5M9 12h6M9 16h6"></path></svg></span><span><b>Daftar Isi</b><small>Telusuri seluruh bab</small></span></button><button @click="go('/dashboard')"><span class="cat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10m6 10V4m6 16v-7m5 7H2"></path></svg></span><span><b>Dashboard Kinerja</b><small>Pantau KPI &amp; SLA</small></span></button><button @click="go(annexTo)"><span class="cat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l1 3h3v16H5V6h3z"></path><path d="m8 13 2 2 5-5M9 3v3h6V3"></path></svg></span><span><b>SOP Lampiran</b><small>Formulir &amp; checklist</small></span></button><button @click="go('/informasi')"><span class="cat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg></span><span><b>Informasi</b><small>Pengumuman &amp; revisi</small></span></button><button @click="go('/faq')"><span class="cat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M9.7 9a2.5 2.5 0 1 1 3.8 2.1c-1 .6-1.5 1.1-1.5 2.4M12 17h.01"></path></svg></span><span><b>Pusat Bantuan</b><small>Temukan jawaban cepat</small></span></button><button @click="go('/bantuan')"><span class="cat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 21h20L12 3Z"></path><path d="M12 9v5m0 3h.01"></path></svg></span><span><b>Laporkan Kendala</b><small>Hubungi tim dukungan</small></span></button></div>
      </div>
      <aside class="notice-card"><span class="eyebrow light">PENGUMUMAN UTAMA</span><h3>Safety Campaign<br>“Zero Preventable Accident”</h3><p>Perkuat budaya keselamatan melalui inspeksi harian, defensive driving, dan pelaporan proaktif.</p><button @click="go('/informasi')">Baca pengumuman <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg></button><div class="road-lines"></div></aside>
    </section>
  </div>
</template>

<style>
.dz .fetch-error { margin: 0 0 1rem; padding: 1rem 1.2rem; border: 1px solid #d33; border-radius: 12px; color: #d33; background: rgba(211, 51, 51, 0.06); }
.dz .bab-open { font-weight: 800; color: var(--gold-2); }
</style>

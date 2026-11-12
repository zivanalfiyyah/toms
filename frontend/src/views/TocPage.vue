<script setup>
import HeroSearch from '../components/HeroSearch.vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useDocsStore } from '../stores/docs'
import { useTocStore } from '../stores/toc'
import { icons } from '../icons'
import TocNode from '../components/TocNode.vue'
import DocsShell from '../components/DocsShell.vue'
import { useRouter } from 'vue-router'

const docsStore = useDocsStore()
const toc = useTocStore()
const router = useRouter()

function openSearch() {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
}

onMounted(async () => {
  if (!docsStore.categories.length) await docsStore.fetchCategories()
  // Muat seluruh level (tak terbatas) di belakang layar; daftar tampil bertahap.
  toc.load(docsStore.categories)
})

function reload() {
  toc.load(docsStore.categories, { force: true })
}

// Kunci: `c-<id>` untuk kategori, `p-<id>` untuk halaman yang punya subbab.
const open = reactive({})

// Saat "Buka Semua" aktif, halaman yang baru selesai dimuat ikut terbuka.
const autoOpen = ref(false)

function toggle(key) {
  autoOpen.value = false
  open[key] = !open[key]
}

function countPages(pages) {
  let n = 0
  for (const p of pages || []) n += 1 + countPages(p.children)
  return n
}

function collectPageKeys(pages, keys) {
  for (const p of pages || []) {
    if (p.children?.length) {
      keys.push(`p-${p.id}`)
      collectPageKeys(p.children, keys)
    }
  }
}

function expandAll() {
  const keys = []
  for (const cat of toc.tree) {
    keys.push(`c-${cat.id}`)
    collectPageKeys(cat.pages, keys)
  }
  keys.forEach((k) => { open[k] = true })
}

function toggleAll(state) {
  autoOpen.value = state
  if (state) expandAll()
  else Object.keys(open).forEach((k) => { open[k] = false })
}

const totalTopics = computed(() =>
  toc.tree.reduce((sum, cat) => sum + 1 + countPages(cat.pages), 0)
)

// Level yang baru dimuat ikut terbuka bila "Buka Semua" sedang aktif.
watch(totalTopics, () => {
  if (autoOpen.value) expandAll()
})
</script>

<template>
  <div class="dz">
    <section class="page-hero">
      <div class="shell">
        <div>
          <span class="eyebrow light">DAFTAR ISI &amp; NAVIGASI HIRARKI</span>
          <h1>Daftar Isi</h1>
          <p>Seluruh bab dan sub-bab dalam Panduan TOMS. Pilih topik atau gunakan kontrol expander di bawah ini.</p>
        </div>
        <div class="search-wrap">
          <HeroSearch compact />
        </div>
      </div>
    </section>

    <DocsShell no-toc active-toc>
      <div class="docs-main plain">
        <div class="docs-toc-head">
          <div class="docs-toc-bar">
            <div>
              <button type="button" class="outline-btn" @click="toggleAll(true)">Buka Semua</button>
              <button type="button" class="outline-btn" @click="toggleAll(false)">Tutup Semua</button>
            </div>
            <span>Total {{ totalTopics }} Topik Terdata<template v-if="toc.pending > 0"> · memuat…</template></span>
          </div>
        </div>

        <p v-if="toc.pending > 0" class="crawl-note"><span class="crawl-dot"></span>Memuat level yang lebih dalam… {{ toc.pending }} halaman tersisa</p>
        <p v-else-if="toc.failed > 0" class="crawl-note is-warn">
          {{ toc.failed }} halaman gagal dimuat sub-babnya.
          <button type="button" class="link-btn" @click="reload">Muat ulang</button>
        </p>

        <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
        <p v-else-if="docsStore.loading && !toc.tree.length" class="state">Memuat daftar isi…</p>

        <div v-else class="bab-list">
          <section v-for="(cat, i) in toc.tree" :key="cat.id" :id="`bab-${cat.slug}`" class="bab" :class="{ 'is-open': open[`c-${cat.id}`] }">
            <div class="bab-head" @click="toggle(`c-${cat.id}`)">
              <div class="bab-left">
                <span class="toc-chev" :class="{ open: open[`c-${cat.id}`] }">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
                </span>
                <span class="cat-icon" v-html="icons[cat.icon] || icons.folder"></span>
                <div><small>BAB {{ String(i + 1).padStart(2, '0') }}</small><b>{{ cat.name }}</b></div>
              </div>
              <div class="bab-right">
                <span class="badge">{{ cat.pages?.length ? `${cat.pages.length} sub-bab` : 'Kosong' }}</span>
                <button type="button" class="open-btn" @click.stop="router.push(`/docs/${cat.slug}`)">
                  Buka
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg>
                </button>
              </div>
            </div>
            <ul v-if="open[`c-${cat.id}`]" class="bab-body">
              <TocNode v-for="page in cat.pages" :key="page.id" :category="cat" :page="page" :open="open" @toggle="toggle" />
              <li v-if="!cat.pages?.length" class="toc-node"><div class="toc-row" style="padding-left: 14px;"><span class="toc-dot"></span><span class="toc-link">Belum ada halaman di kategori ini.</span></div></li>
            </ul>
          </section>
        </div>
      </div>
    </DocsShell>
  </div>
</template>

<style>
.dz .cat-icon svg { width: 20px; height: 20px; }
.dz .crawl-note { margin: 0 0 14px; padding: 10px 14px; border-radius: 12px; background: var(--gold-soft); color: var(--muted); font-size: 12.5px; display: flex; align-items: center; gap: 8px; }
.dz .crawl-note.is-warn { color: #b45309; }
.dz .crawl-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); animation: crawlp 1.2s ease-in-out infinite; }
@keyframes crawlp { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
.dz .link-btn { background: none; border: 0; padding: 0; cursor: pointer; font: inherit; font-weight: 700; color: var(--gold-ink); text-decoration: underline; }
.dz .fetch-error { padding: 14px 18px; border: 1px solid #d33; border-radius: 12px; color: #d33; }
.dz .state { color: var(--muted); }
</style>

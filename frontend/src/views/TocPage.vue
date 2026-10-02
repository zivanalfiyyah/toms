<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useDocsStore } from '../stores/docs'
import { useTocStore } from '../stores/toc'
import { icons } from '../icons'
import TocNode from '../components/TocNode.vue'

const docsStore = useDocsStore()
const toc = useTocStore()

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
  <div class="toc-page">
    <header class="toc-header">
      <div class="eyebrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M2 4h6a4 4 0 014 4v13a3 3 0 00-3-3H2zM22 4h-6a4 4 0 00-4 4v13a3 3 0 013-3h7z" />
        </svg>
        <span>Daftar Isi &amp; Navigasi Hirarki</span>
      </div>
      <h1>Daftar Isi</h1>
      <p class="desc">
        Seluruh bab dan sub-bab dalam Panduan TOMS. Pilih topik atau gunakan kontrol expander di bawah ini.
      </p>

      <div class="actions">
        <div class="btn-group">
          <button type="button" class="btn" @click="toggleAll(true)">Buka Semua</button>
          <button type="button" class="btn" @click="toggleAll(false)">Tutup Semua</button>
        </div>
        <span class="total">Total {{ totalTopics }} Topik Terdata<template v-if="toc.pending > 0"> · memuat…</template></span>
      </div>
    </header>

    <p v-if="toc.pending > 0" class="crawl-note">
      <span class="crawl-dot"></span>Memuat level yang lebih dalam… {{ toc.pending }} halaman tersisa
    </p>
    <p v-else-if="toc.failed > 0" class="crawl-note is-warn">
      {{ toc.failed }} halaman gagal dimuat sub-babnya.
      <button type="button" class="link-btn" @click="reload">Muat ulang</button>
    </p>

    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
    <p v-else-if="docsStore.loading && !toc.tree.length" class="state">Memuat daftar isi…</p>

    <div v-else class="bab-list">
      <section
        v-for="cat in toc.tree"
        :key="cat.id"
        class="bab"
        :class="{ 'is-open': open[`c-${cat.id}`] }"
      >
        <div class="bab-head" @click="toggle(`c-${cat.id}`)">
          <div class="bab-left">
            <svg
              class="chev"
              :class="{ 'is-open': open[`c-${cat.id}`] }"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            ><path d="M9 6l6 6-6 6" /></svg>
            <span class="bab-icon" v-html="icons[cat.icon] || icons.folder"></span>
            <span class="bab-name">{{ cat.name }}</span>
          </div>
          <div class="bab-right">
            <span class="badge" :class="{ 'is-empty': !cat.pages?.length }">
              {{ cat.pages?.length ? `${cat.pages.length} sub-bab` : 'Kosong' }}
            </span>
            <router-link :to="`/docs/${cat.slug}`" class="open-btn" @click.stop>
              Buka
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5" /></svg>
            </router-link>
          </div>
        </div>

        <div v-if="open[`c-${cat.id}`]" class="bab-body">
          <ul v-if="cat.pages?.length" class="pages">
            <TocNode
              v-for="page in cat.pages"
              :key="page.id"
              :category="cat"
              :page="page"
              :open="open"
              @toggle="toggle"
            />
          </ul>
          <p v-else class="empty">Belum ada halaman di kategori ini.</p>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.toc-page { max-width: 860px; margin: 0 auto; }

.toc-header {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}
.eyebrow {
  display: flex; align-items: center; gap: 0.4rem;
  color: var(--color-accent); font-size: 0.8rem; font-weight: 600; margin-bottom: 0.5rem;
}
.eyebrow svg { width: 16px; height: 16px; }
.toc-header h1 { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; letter-spacing: -0.03em; margin: 0 0 0.5rem; }
.desc { color: var(--color-ink-soft); font-size: 0.9rem; line-height: 1.6; margin: 0; }

.actions {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;
  margin-top: 1.25rem; padding-top: 1rem; border-top: 1px solid var(--color-border);
}
.btn-group { display: flex; gap: 0.5rem; }
.btn {
  padding: 0.4rem 0.8rem; border: none; border-radius: 8px; cursor: pointer;
  font-size: 0.75rem; font-weight: 600;
  background: var(--color-bg); color: var(--color-ink);
  transition: background 0.15s ease, color 0.15s ease;
}
.btn:hover { background: var(--color-accent-soft); color: var(--color-accent); }
.total { font-size: 0.75rem; color: var(--color-ink-soft); }

.bab-list { display: flex; flex-direction: column; gap: 0.9rem; }
.bab {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  box-shadow: var(--shadow-card);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.bab-head {
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.9rem 1rem; cursor: pointer; transition: background 0.15s ease;
}
.bab-head:hover { background: var(--color-accent-soft); }
.bab-left { display: flex; align-items: center; gap: 0.7rem; min-width: 0; }
.chev { width: 18px; height: 18px; flex-shrink: 0; color: var(--color-ink-soft); transition: transform 0.2s ease; }
.chev.is-open { transform: rotate(90deg); }
.bab-icon { width: 18px; height: 18px; flex-shrink: 0; color: var(--color-accent); }
.bab-icon :deep(svg) { width: 100%; height: 100%; }
.bab-name { font-family: var(--font-display); font-weight: 700; font-size: 0.98rem; color: var(--color-ink); }

.bab-right { display: flex; align-items: center; gap: 0.7rem; flex-shrink: 0; }
.badge {
  font-size: 0.72rem; font-weight: 500; padding: 0.2rem 0.65rem; border-radius: 999px;
  background: var(--color-bg); color: var(--color-ink-soft);
}
.badge.is-empty { opacity: 0.7; font-style: italic; }
.open-btn {
  display: inline-flex; align-items: center; gap: 0.3rem;
  padding: 0.3rem 0.75rem; border-radius: 8px;
  font-size: 0.75rem; font-weight: 600;
  background: var(--color-accent-soft); color: var(--color-accent);
  border: 1px solid var(--color-accent-border);
  transition: background 0.15s ease, color 0.15s ease;
}
.open-btn svg { width: 13px; height: 13px; }
.open-btn:hover { background: var(--color-accent); color: #fff; text-decoration: none; }

.bab.is-open { border-color: var(--color-accent-border); }
.bab-body {
  border-top: 1px solid var(--color-accent-border);
  background: var(--well-bg);
  box-shadow: var(--well-shadow);
  padding: 1rem;
}
.pages { margin: 0 0 0 0.5rem; padding: 0 0 0 1rem; border-left: 2px solid var(--color-accent-border); }
.empty { margin: 0; font-size: 0.85rem; color: var(--color-ink-soft); }

.state { color: var(--color-ink-soft); }

.crawl-note {
  display: flex; align-items: center; gap: 0.5rem;
  margin: 0 0 1rem; padding: 0.55rem 0.9rem; font-size: 0.78rem;
  color: var(--color-ink-soft); background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-border); border-radius: var(--radius);
}
.crawl-note.is-warn { color: #d97706; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.35); }
.crawl-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); animation: crawl-pulse 1.2s ease-in-out infinite; }
@keyframes crawl-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.link-btn { background: none; border: none; padding: 0; cursor: pointer; font: inherit; font-weight: 600; color: var(--color-accent); text-decoration: underline; }
.fetch-error {
  padding: 1rem 1.2rem; border: 1px solid #d33; border-radius: var(--radius);
  color: #d33; background: rgba(211, 51, 51, 0.06);
}

@media (max-width: 600px) {
  .bab-right .badge { display: none; }
}
</style>

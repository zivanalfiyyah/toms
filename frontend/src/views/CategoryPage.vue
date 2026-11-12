<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useDocsStore } from '../stores/docs'
import { useAuthStore } from '../stores/auth'
import { icons } from '../icons'
import EditPageLink from '../components/EditPageLink.vue'
import TiptapRenderer from '../components/TiptapRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import DocsShell from '../components/DocsShell.vue'
import { useRouter } from 'vue-router'
import api from '../api'
import { useUiStore } from '../stores/ui'
import { downloadPdf } from '../utils/downloadPdf'

const props = defineProps({
  category: { type: String, required: true }
})

const docsStore = useDocsStore()
const router = useRouter()

function countPages(pages) {
  let n = 0
  for (const p of pages || []) n += 1 + countPages(p.children)
  return n
}
const totalTopics = computed(() => countPages(cat.value?.pages))
const catNumber = computed(() => String(currentCategoryIndex.value + 1).padStart(2, '0'))
const auth = useAuthStore()
const cat = computed(() => docsStore.categoryBySlug(props.category))

// Suka & Unduh PDF untuk kategori
const ui = useUiStore()
const like = ref({ liked: false, count: 0, busy: false })
const dl = ref({ busy: false, msg: '' })
async function loadLike() {
  if (!cat.value || !auth.isLoggedIn) return
  try { const { data } = await api.get(`/categories/${cat.value.id}/like`); like.value = { liked: data.liked, count: data.likes_count, busy: false } } catch { /* abaikan */ }
}
watch(() => cat.value?.id, loadLike, { immediate: true })
async function toggleLike() {
  if (!auth.isLoggedIn) { ui.promptLogin(window.location.pathname); return }
  if (!cat.value || like.value.busy) return
  like.value.busy = true
  try {
    const { data } = like.value.liked ? await api.delete(`/categories/${cat.value.id}/like`) : await api.post(`/categories/${cat.value.id}/like`)
    like.value = { liked: data.liked, count: data.likes_count, busy: false }
  } catch { like.value.busy = false }
}
async function doDownload() {
  if (!cat.value || dl.value.busy) return
  dl.value = { busy: true, msg: '' }
  const r = await downloadPdf('category', cat.value.id, cat.value.slug)
  dl.value = { busy: false, msg: r.ok || r.reason === 'login' ? '' : r.message }
  if (dl.value.msg) setTimeout(() => { dl.value.msg = '' }, 5000)
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '')

// Diisi via event @headings dari TiptapRenderer (lihat src/utils/headings.js).
// Sebelumnya sidebar "Pada halaman ini" di sini selalu tampil kosong untuk
// kategori tanpa subbab, karena cuma me-list cat.pages dan tidak pernah
// membaca heading H1-H6 di dalam cat.content_html sama sekali.
const pageHeadings = ref([])
// Kartu isi (bergulir sendiri di desktop). Dikembalikan ke atas saat pindah kategori.
const contentEl = ref(null)
watch(() => props.category, () => {
  pageHeadings.value = []
  contentEl.value?.scrollTo({ top: 0, behavior: 'instant' })
})

// Navigasi manual lewat JS untuk klik item TOC — supaya konsisten berhasil
// walau elemen tujuannya baru saja selesai dirender (v-html) oleh
// TiptapRenderer, bukan mengandalkan lompatan native browser murni yang
// bisa gagal diam-diam dalam SPA. href tetap dipasang di <a> (supaya
// klik-kanan copy link / buka tab baru tetap berfungsi normal).
function scrollToHeading(id, event) {
  event.preventDefault()
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.pushState(null, '', `#${id}`)
}

// Kalau halaman dibuka/di-refresh langsung dengan #hash sudah ada di URL,
// browser mencoba lompat ke situ SEBELUM konten (v-html) selesai
// dirender — elemen targetnya belum ada, jadi lompatan browser gagal
// diam-diam. Di sini kita coba lagi begitu heading benar-benar siap.
watch(pageHeadings, async (headings) => {
  if (!headings.length || !window.location.hash) return
  await nextTick()
  setTimeout(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ block: 'start' })
  }, 50)
})

const currentCategoryIndex = computed(() => {
  return docsStore.categories.findIndex((c) => c.slug === props.category)
})
const prevCategory = computed(() => {
  const i = currentCategoryIndex.value
  return i > 0 ? docsStore.categories[i - 1] : null
})
const nextCategory = computed(() => {
  const i = currentCategoryIndex.value
  const list = docsStore.categories
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null
})

onMounted(() => {
  docsStore.error = null
  if (!docsStore.categories.length) docsStore.fetchCategories()
})

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
</script>
<template>
  <div class="dz">
    <section v-if="cat" class="page-hero">
      <div class="shell">
        <div>
          <span class="eyebrow light">BAB {{ catNumber }} • KATEGORI DOKUMENTASI</span>
          <h1>{{ cat.name }}</h1>
          <p v-if="cat.pages?.length">{{ cat.pages.length }} sub-bab yang memuat total {{ totalTopics }} topik dalam panduan TOMS.</p>
          <p v-else-if="cat.description">{{ cat.description }}</p>
        </div>
      </div>
    </section>
    <section v-else class="page-hero"><div class="shell"><div><span class="eyebrow light">KATEGORI DOKUMENTASI</span><h1>Dokumentasi</h1></div></div></section>

    <DocsShell :no-toc="!(pageHeadings.length || cat?.pages?.length)" :title="cat?.name || 'Daftar Isi'">
      <div class="docs-main">
        <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
        <p v-else-if="!cat" class="state">{{ docsStore.loading ? 'Memuat…' : 'Kategori tidak ditemukan.' }}</p>
        <template v-else>
          <div class="breadcrumb">
            <button type="button" @click="router.push('/')">Beranda</button>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg><button type="button" @click="router.push('/daftar-isi')">Dokumentasi</button></span>
            <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg><b>{{ cat.name }}</b></span>
          </div>

          <div class="cat-bar">
            <p class="docs-meta">{{ cat.pages?.length ? `${cat.pages.length} sub-bab` : 'Kategori' }}<template v-if="cat.revision"> • <span class="docs-rev">{{ cat.revision_label }}</span> • Diperbarui {{ fmtDate(cat.updated_at) }}</template></p>
            <div class="docs-actions">
              <button type="button" class="docs-copy docs-like" :class="{ on: like.liked }" :disabled="like.busy" @click="toggleLike">
                <svg width="15" height="15" viewBox="0 0 24 24" :fill="like.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 12C19 16.6 12 21 12 21z"></path></svg>{{ like.liked ? 'Disukai' : 'Suka' }}<b class="docs-count">{{ like.count }}</b>
              </button>
              <button type="button" class="docs-copy docs-dl" :disabled="dl.busy" @click="doDownload">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"></path></svg>{{ dl.busy ? 'Menyiapkan…' : 'Unduh PDF' }}
              </button>
            </div>
          </div>
          <p v-if="dl.msg" class="docs-dl-err" role="alert">{{ dl.msg }}</p>

          <div ref="contentEl" class="docs-body" tabindex="-1">
            <p v-if="cat.description" class="docs-lead">{{ cat.description }}</p>
            <TiptapRenderer
              v-if="cat.content_html && cat.content_html.trim() !== ''"
              :content="cat.content_html"
              class="single-page-content"
              @headings="pageHeadings = $event"
            />

            <template v-if="cat.pages?.length">
              <h2 class="docs-sub-title">Sub-bab</h2>
              <ul class="docs-sub-list">
                <li v-for="(page, i) in cat.pages" :key="page.id" :id="`sub-${slugify(page.title)}`">
                  <button v-if="page.slug" type="button" @click="router.push(`/docs/${cat.slug}/${page.slug}`)"><i>{{ String(i + 1).padStart(2, '0') }}</i>{{ page.title }}</button>
                  <button v-else type="button" disabled title="Slug halaman ini kosong di data"><i>{{ String(i + 1).padStart(2, '0') }}</i>{{ page.title }} ⚠️</button>
                  <span>{{ page.children?.length ? `${page.children.length} topik di dalamnya` : '' }}</span>
                </li>
              </ul>
            </template>

            <EditPageLink v-if="auth.canEdit" :to="`/docs/${cat.slug}/edit`" />
          </div>

          <div class="pager">
            <button v-if="prevCategory" type="button" @click="router.push(`/docs/${prevCategory.slug}`)">
              <small>← Sebelumnya</small><b>{{ prevCategory.name }}</b><span>BAB {{ String(currentCategoryIndex).padStart(2, '0') }}</span>
            </button>
            <button v-if="nextCategory" type="button" class="next" @click="router.push(`/docs/${nextCategory.slug}`)">
              <small>Berikutnya →</small><b>{{ nextCategory.name }}</b><span>BAB {{ String(currentCategoryIndex + 2).padStart(2, '0') }}</span>
            </button>
          </div>
        </template>
      </div>

      <TableOfContents v-if="cat && pageHeadings.length" :headings="pageHeadings" />
      <aside v-else-if="cat?.pages?.length" class="docs-toc" aria-label="Pada halaman ini">
        <p class="docs-toc-title">Pada halaman ini</p>
        <ul>
          <li v-for="page in cat.pages" :key="page.id"><a :href="`#sub-${slugify(page.title)}`" class="dt-link" :title="page.title">{{ page.title }}</a></li>
        </ul>
      </aside>
    </DocsShell>
  </div>
</template>

<style>
.dz .docs-body { margin: 0; }
.dz .docs-lead { color: var(--muted); font-size: 15px; line-height: 1.7; margin: 0 0 22px; }
.dz .state { color: var(--muted); }
.dz .fetch-error { padding: 14px 18px; border: 1px solid #d33; border-radius: 12px; color: #d33; }
.dz .docs-sub-list button:disabled { cursor: not-allowed; opacity: .7; }
</style>

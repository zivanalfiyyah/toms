<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useDocsStore } from '../stores/docs'
import DocsShell from '../components/DocsShell.vue'
import { useRouter } from 'vue-router'
import TiptapRenderer from '../components/TiptapRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { icons } from '../icons'
import EditPageLink from '../components/EditPageLink.vue'
import { useAuthStore } from '../stores/auth'
import { useLikesStore } from '../stores/likes'
import { useUiStore } from '../stores/ui'
import { downloadPdf } from '../utils/downloadPdf'

const props = defineProps({
  category: { type: String, required: true },
  slugs: { type: Array, required: true } // e.g. ['sistem-manajemen-keselamatan-smk', 'komitmen-dan-kebijakan', 'komitmen-penerapan-implementasi-6a6b1073']
})

const docsStore = useDocsStore()
const router = useRouter()
const catName = computed(() => docsStore.categoryBySlug(props.category)?.name || props.category)
function goPage(p) { router.push(`/docs/${p.categorySlug}/${p.fullPath}`) }
const auth = useAuthStore()
const likes = useLikesStore()
const liking = ref(false)
const liked = computed(() => (likes.loaded ? likes.ids.has(docData.value?.id) : !!docData.value?.liked))

const ui = useUiStore()
const likeCount = computed(() => Math.max(0, (docData.value?.likes_count ?? 0) + (liked.value ? 1 : 0) - (docData.value?.liked ? 1 : 0)))
const dl = ref({ busy: false, msg: '' })
async function doDownload() {
  if (!docData.value || dl.value.busy) return
  dl.value = { busy: true, msg: '' }
  const r = await downloadPdf('page', docData.value.id, docData.value.slug)
  dl.value = { busy: false, msg: r.ok || r.reason === 'login' ? '' : r.message }
  if (dl.value.msg) setTimeout(() => { dl.value.msg = '' }, 5000)
}
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '')

async function toggleLike() {
  if (!auth.isLoggedIn) { ui.promptLogin(window.location.pathname); return }
  if (!docData.value || liking.value) return
  liking.value = true
  try {
    if (liked.value) await likes.unlike(docData.value.id)
    else await likes.like(docData.value.id)
  } catch (e) { /* abaikan */ } finally { liking.value = false }
}
// Diisi via event @headings dari TiptapRenderer (lihat src/utils/headings.js),
// bukan lagi dibaca ulang dari docData.content — supaya TOC selalu sinkron
// dengan apa yang sebenarnya dirender.
const pageHeadings = ref([])
// Kartu isi (bergulir sendiri di desktop). Dikembalikan ke atas saat pindah halaman.
const contentEl = ref(null)

// Full path segments joined, used for building nested links
const basePath = computed(() => `/docs/${props.category}/${props.slugs.join('/')}`)

const docData = computed(() => docsStore.currentPage)

function load() {
  // NOTE: this replaces the old fetchPage(category, page, child) call.
  // The store/backend needs to accept an arbitrary-depth slug array and
  // resolve it by walking parent_id down the chain (or a single query
  // that matches the last slug + validates the ancestor chain).
  pageHeadings.value = []
  contentEl.value?.scrollTo({ top: 0, behavior: 'instant' })
  docsStore.fetchPageByPath(props.category, props.slugs)
}
onMounted(load)
watch(() => [props.category, ...props.slugs], load)

const currentIndex = computed(() => {
  return docsStore.flatPages.findIndex(
    (p) => p.categorySlug === props.category && p.fullPath === props.slugs.join('/')
  )
  // NOTE: flatPages only sees as deep as what /categories already
  // returned (see docs.js comment). Pages deeper than that won't show
  // up here, so prev/next may be absent at very deep levels until the
  // backend can return (or we can fetch) the full nested tree.
})
const prevPage = computed(() => {
  const i = currentIndex.value
  return i > 0 ? docsStore.flatPages[i - 1] : null
})
const nextPage = computed(() => {
  const i = currentIndex.value
  const list = docsStore.flatPages
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null
})

function extractText(node) {
  if (!node) return ''
  let text = node.text || ''
  if (node.content) for (const child of node.content) text += ' ' + extractText(child)
  return text.trim()
}

</script>
<template>
  <div class="dz">
    <DocsShell :no-toc="!pageHeadings.length" :title="catName">
      <div class="docs-main">
        <div ref="contentEl" class="docs-body" tabindex="-1">
          <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
          <p v-else-if="docsStore.loading" class="state">Memuat...</p>
          <template v-else-if="docData">
            <div class="breadcrumb">
              <button type="button" @click="router.push('/')">Beranda</button>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg><button type="button" @click="router.push('/daftar-isi')">Dokumentasi</button></span>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg><button type="button" @click="router.push(`/docs/${category}`)">{{ catName }}</button></span>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg><b>{{ docData.title }}</b></span>
            </div>

            <div class="docs-title-row">
              <div>
                <h1>{{ docData.title }}</h1>
                <p class="docs-meta">{{ catName }} • {{ docData.children?.length ? `${docData.children.length} sub-bab` : 'Halaman akhir' }}<template v-if="docData.revision"> • <span class="docs-rev">{{ docData.revision_label }}</span> • Diperbarui {{ fmtDate(docData.updated_at) }}</template></p>
                <p v-if="dl.msg" class="docs-dl-err" role="alert">{{ dl.msg }}</p>
              </div>
              <div class="docs-actions">
                <button type="button" class="docs-copy docs-like" :class="{ on: liked }" :disabled="liking" @click="toggleLike">
                  <svg width="15" height="15" viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6.6 5.2 5.2 0 0 1 21.3 12C19 16.6 12 21 12 21z"></path></svg>{{ liked ? 'Disukai' : 'Suka' }}<b class="docs-count">{{ likeCount }}</b>
                </button>
                <button type="button" class="docs-copy docs-dl" :disabled="dl.busy" @click="doDownload">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"></path></svg>{{ dl.busy ? 'Menyiapkan…' : 'Unduh PDF' }}
                </button>
              </div>
            </div>

            <TiptapRenderer v-if="docData.content_html" :content="docData.content_html" @headings="pageHeadings = $event" />

            <EditPageLink v-if="auth.canEdit" :to="`${basePath}/edit`" />

            <template v-if="docData.children && docData.children.length > 0">
              <h2 class="docs-sub-title">Sub-bab</h2>
              <ul class="docs-sub-list">
                <li v-for="(c, i) in docData.children" :key="c.id">
                  <button type="button" @click="router.push(`${basePath}/${c.slug}`)"><i>{{ String(i + 1).padStart(2, '0') }}</i>{{ c.title }}</button>
                  <span>{{ c.description || '' }}</span>
                </li>
              </ul>
            </template>

            <div class="pager">
              <button v-if="prevPage" type="button" @click="goPage(prevPage)">
                <small>← Sebelumnya</small><b>{{ prevPage.title }}</b><span>{{ prevPage.categoryName || catName }}</span>
              </button>
              <button v-if="nextPage" type="button" class="next" @click="goPage(nextPage)">
                <small>Berikutnya →</small><b>{{ nextPage.title }}</b><span>{{ nextPage.categoryName || catName }}</span>
              </button>
            </div>
          </template>
          <p v-else class="state">Halaman tidak ditemukan.</p>
        </div>
      </div>

      <TableOfContents v-if="docData" :headings="pageHeadings" />
    </DocsShell>
  </div>
</template>

<style>
.dz .docs-body { margin: 0; }
.dz .state { color: var(--muted); }
.dz .fetch-error { padding: 14px 18px; border: 1px solid #d33; border-radius: 12px; color: #d33; }
</style>

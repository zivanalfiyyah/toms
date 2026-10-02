<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useDocsStore } from '../stores/docs'
import Breadcrumb from '../components/Breadcrumb.vue'
import TiptapRenderer from '../components/TiptapRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { icons } from '../icons'
import EditPageLink from '../components/EditPageLink.vue'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  category: { type: String, required: true },
  slugs: { type: Array, required: true } // e.g. ['sistem-manajemen-keselamatan-smk', 'komitmen-dan-kebijakan', 'komitmen-penerapan-implementasi-6a6b1073']
})

const docsStore = useDocsStore()
const auth = useAuthStore()
const copied = ref(false)
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

async function copyPage() {
  if (!docData.value) return
  const text = `${docData.value.title}\n\n${extractText(docData.value.content)}`
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

<template>
  <div class="doc-page">
    <div ref="contentEl" class="doc-content" tabindex="-1">
      <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
      <div v-else-if="docsStore.loading">Memuat...</div>
      <template v-else-if="docData">
        <Breadcrumb :segments="[category, ...slugs]" />

        <div class="title-row">
          <h1>{{ docData.title }}</h1>
          <button class="copy-btn" @click="copyPage">
            <span v-html="copied ? icons.check : icons.copy"></span>
            {{ copied ? 'Tersalin' : 'Salin Halaman' }}
          </button>
        </div>

        <TiptapRenderer
          v-if="docData.content_html"
          :content="docData.content_html"
          @headings="pageHeadings = $event"
        />

        <EditPageLink :to="`${basePath}/edit`" />

        <!-- Subbab: works at ANY depth now, not just level 2 or 3 -->
        <template v-if="docData.children && docData.children.length > 0">
          <h2 class="subbab-title">Subbab</h2>
          <ul class="subbab-list">
            <li v-for="c in docData.children" :key="c.id">
              <router-link :to="`${basePath}/${c.slug}`">{{ c.title }}</router-link>
              <span v-if="c.description"> — {{ c.description }}</span>
              <router-link
                :to="`${basePath}/${c.slug}/edit`"
                class="edit-item-link"
                title="Ubah halaman ini"
              >
                <span v-html="icons.edit"></span>
              </router-link>
            </li>
          </ul>
        </template>

        <nav class="pager">
          <router-link
            v-if="prevPage"
            :to="`/docs/${prevPage.categorySlug}/${prevPage.fullPath}`"
            class="pager-card prev"
          >
            <span class="pager-label">&larr; Sebelumnya</span>
            <span class="pager-title">{{ prevPage.title }}</span>
          </router-link>
          <span v-else></span>

          <router-link
            v-if="nextPage"
            :to="`/docs/${nextPage.categorySlug}/${nextPage.fullPath}`"
            class="pager-card next"
          >
            <span class="pager-label">Selanjutnya &rarr;</span>
            <span class="pager-title">{{ nextPage.title }}</span>
          </router-link>
        </nav>
      </template>
      <p v-else>Halaman tidak ditemukan.</p>
    </div>

    <TableOfContents v-if="docData" :headings="pageHeadings" />
  </div>
</template>

<style scoped>
.doc-page { display: flex; gap: 25px; align-items: flex-start; }
.doc-content:focus { outline: none; }

/* Desktop: kartu isi tetap di tempat seperti sidebar; hanya teks di dalamnya yang bergulir.
   Mobile (<= 860px) tidak berubah: seluruh halaman bergulir. */
@media (min-width: 861px) {
  .doc-page { margin-bottom: -1.5rem; } /* cegah scroll jendela sisa 24px */
  .doc-content {
    position: sticky;
    top: calc(var(--header-h) + 1.5rem);
    max-height: calc(100vh - var(--header-h) - 3rem);
    overflow-y: auto;
    scroll-behavior: smooth;
  }
}
.doc-content {
  flex: 1;
  min-width: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 29px clamp(1.25rem, 3vw, 2.5rem) 58px;
  box-shadow: var(--shadow-card);
}
.doc-content h1 { font-size: clamp(1.7rem, 3vw, 2.45rem); font-weight: 800; letter-spacing: -0.045em; line-height: 1.1; margin: 0; color: var(--color-ink); }
.doc-content h2 { font-weight: 700; }

/* Kepala artikel: breadcrumb di atas, judul besar, garis pemisah ke isi */
.title-row {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding-bottom: 1.5rem; margin-bottom: 1.75rem; border-bottom: 1px solid var(--color-border);
}
.title-row h1 { margin: 0 !important; }
.copy-btn {
  display: flex; align-items: center; gap: 0.4rem;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 10px; padding: 0.5rem 0.9rem;
  font-size: 11px; font-weight: 700; color: var(--color-ink-soft); cursor: pointer; flex-shrink: 0;
  transition: 0.18s ease;
}
.copy-btn:hover { border-color: #a8d7f3; background: var(--color-bg); color: var(--color-accent); }
.copy-btn span { width: 14px; height: 14px; display: block; }
.copy-btn :deep(svg) { width: 100%; height: 100%; }

.subbab-title { font-size: 22px; letter-spacing: -0.45px; margin: 0 0 17px; padding-bottom: 12px; border-bottom: 1px solid var(--color-border); }
.subbab-list { list-style: none; padding: 0; margin: 0 0 2rem; }
.subbab-list li { margin-bottom: 0.6rem; font-size: 0.95rem; color: var(--color-ink-soft); scroll-margin-top: 5rem; }
.subbab-list a { font-weight: 600; }
.edit-item-link {
  display: inline-flex;
  align-items: center;
  margin-left: 0.5rem;
  width: 13px; height: 13px;
  color: var(--color-ink-soft);
  vertical-align: middle;
}
.edit-item-link:hover { color: var(--color-accent); }
.edit-item-link :deep(svg) { width: 100%; height: 100%; }

.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}
.pager-card {
  display: flex; flex-direction: column; gap: 0.3rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-surface);
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.pager-card:hover { border-color: #a8d8f3; text-decoration: none; transform: translateY(-2px); box-shadow: 0 10px 22px rgba(30, 73, 106, 0.08); }
.pager-card.next { text-align: right; align-items: flex-end; }
.pager-label { font-size: 0.75rem; color: var(--color-ink-soft); }
.pager-title { font-family: var(--font-display); font-weight: 600; color: var(--color-ink); }

.fetch-error {
  padding: 1rem 1.2rem;
  border: 1px solid #d33;
  border-radius: var(--radius);
  color: #d33;
  background: rgba(211, 51, 51, 0.06);
}

/* Desktop: tujuan scroll berada di dalam kartu, jadi jaraknya tidak perlu setinggi navbar. */
@media (min-width: 861px) {
  .subbab-list li { scroll-margin-top: 1rem; }
}
</style>
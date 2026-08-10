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

// Full path segments joined, used for building nested links
const basePath = computed(() => `/docs/${props.category}/${props.slugs.join('/')}`)

const docData = computed(() => docsStore.currentPage)

function load() {
  // NOTE: this replaces the old fetchPage(category, page, child) call.
  // The store/backend needs to accept an arbitrary-depth slug array and
  // resolve it by walking parent_id down the chain (or a single query
  // that matches the last slug + validates the ancestor chain).
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
    <div class="doc-content">
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

        <TiptapRenderer v-if="docData.content_html" :content="docData.content_html" />

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

    <TableOfContents v-if="docData" :content="docData.content" />
  </div>
</template>

<style scoped>
.doc-page { display: flex; gap: 2rem; }
.doc-content { flex: 1; min-width: 0; }
.title-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.title-row h1 { margin: 0; }
.copy-btn {
  display: flex; align-items: center; gap: 0.4rem;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 0.4rem 0.8rem;
  font-size: 0.8rem; color: var(--color-ink-soft); cursor: pointer; flex-shrink: 0;
}
.copy-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
.copy-btn span { width: 14px; height: 14px; display: block; }
.copy-btn :deep(svg) { width: 100%; height: 100%; }

.subbab-title { font-size: 1.1rem; margin-bottom: 0.75rem; }
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
  border-radius: var(--radius);
}
.pager-card:hover { border-color: var(--color-accent); text-decoration: none; }
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
</style>
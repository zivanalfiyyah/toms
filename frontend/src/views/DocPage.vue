<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useDocsStore } from '../stores/docs'
import Breadcrumb from '../components/Breadcrumb.vue'
import TiptapRenderer from '../components/TiptapRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'
import { icons } from '../icons'
import EditPageLink from '../components/EditPageLink.vue'

const props = defineProps({
  category: { type: String, required: true },
  slug: { type: String, required: true }
})

const docsStore = useDocsStore()
const page = computed(() => docsStore.currentPage)
const copied = ref(false)

function load() {
  docsStore.fetchPage(props.category, props.slug)
}
onMounted(load)
watch(() => [props.category, props.slug], load)

// Cari posisi halaman saat ini di daftar datar semua halaman, lalu ambil tetangga kiri/kanannya.
const currentIndex = computed(() => {
  return docsStore.flatPages.findIndex(
    (p) => p.categorySlug === props.category && p.slug === props.slug
  )
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
  if (!page.value) return
  const text = `${page.value.title}\n\n${extractText(page.value.content)}`
  await navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}
</script>

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
</style>

<template>
  <div class="doc-page">
    <div class="doc-content">
      <div v-if="docsStore.loading">Memuat...</div>
      <template v-else-if="page">
        <Breadcrumb :segments="[category, slug]" />
        <div class="title-row">
          <h1>{{ page.title }}</h1>
          <button class="copy-btn" @click="copyPage">
            <span v-html="copied ? icons.check : icons.copy"></span>
            {{ copied ? 'Tersalin' : 'Salin Halaman' }}
          </button>
        </div>
        <TiptapRenderer :content="page.content" />

        <EditPageLink :to="`/docs/${category}/${slug}/edit`" />

        <nav class="pager">
          <router-link v-if="prevPage" :to="`/docs/${prevPage.categorySlug}/${prevPage.slug}`" class="pager-card prev">
            <span class="pager-label">&larr; Sebelumnya</span>
            <span class="pager-title">{{ prevPage.title }}</span>
          </router-link>
          <span v-else></span>

          <router-link v-if="nextPage" :to="`/docs/${nextPage.categorySlug}/${nextPage.slug}`" class="pager-card next">
            <span class="pager-label">Selanjutnya &rarr;</span>
            <span class="pager-title">{{ nextPage.title }}</span>
          </router-link>
        </nav>
      </template>
      <p v-else>Halaman tidak ditemukan.</p>
    </div>

    <TableOfContents v-if="page" :content="page.content" />
  </div>
</template>

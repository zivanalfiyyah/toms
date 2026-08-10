<script setup>
import { computed, onMounted } from 'vue'
import { useDocsStore } from '../stores/docs'
import { useAuthStore } from '../stores/auth'
import { icons } from '../icons'
import EditPageLink from '../components/EditPageLink.vue'
import TiptapRenderer from '../components/TiptapRenderer.vue'
import TableOfContents from '../components/TableOfContents.vue'

const props = defineProps({ 
  category: String, 
  page: String 
})

const docsStore = useDocsStore()
const auth = useAuthStore()
const cat = computed(() => docsStore.categoryBySlug(props.category))
const page = computed(() => docsStore.pageBySlug(props.category, props.page))

const currentPageIndex = computed(() => {
  return docsStore.flatCategoryPages.findIndex(
    (p) => p.categorySlug === props.category && p.slug === props.page
  )
})
const prevPage = computed(() => {
  const i = currentPageIndex.value
  return i > 0 ? docsStore.flatCategoryPages[i - 1] : null
})
const nextPage = computed(() => {
  const i = currentPageIndex.value
  const list = docsStore.flatCategoryPages
  return i >= 0 && i < list.length - 1 ? list[i + 1] : null
})

onMounted(() => { 
  docsStore.error = null
  if (!docsStore.categories.length) docsStore.fetchCategories()
})

const slugify = (text) => {
  return text
    ? text.toLowerCase().trim().replace(/[\s\W-]+/g, '-')
    : ''
}
</script>

<template>
  <div class="category-page">
    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
    <div v-else-if="!page">Halaman tidak ditemukan.</div>
    <template v-else>
      <div class="category-content">
        <p class="breadcrumb">
          <router-link to="/">docs</router-link>
          <span class="sep">/</span>{{ cat?.slug }}
          <span class="sep">/</span>
          <span class="current">{{ page.slug }}</span>
        </p>

        <h1>{{ page.title }}</h1>
        <p class="lead">{{ page.description }}</p>

        <TiptapRenderer v-if="page.content_html" :content="page.content_html" class="single-page-content" />
        <div v-else class="single-page-content" v-html="page.content_html"></div>

        <EditPageLink :to="`/docs/${category}/${props.page}/edit`" />

        <template v-if="page.children && page.children.length > 0">
          <h2 class="subbab-title">Subbab</h2>
          <ul class="subbab-list">
            <li v-for="c in page.children" :key="c.id">
              <router-link :to="`/docs/${category}/${props.page}/${c.slug}`">{{ c.title }}</router-link>
              <span> — {{ c.description }}</span>
              <router-link
                :to="`/docs/${category}/${props.page}/${c.slug}/edit`"
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
            :to="`/docs/${prevPage.categorySlug}/${prevPage.slug}`"
            class="pager-card prev"
          >
            <span class="pager-label">&larr; Sebelumnya</span>
            <span class="pager-title">{{ prevPage.title }}</span>
          </router-link>
          <span v-else></span>

          <router-link
            v-if="nextPage"
            :to="`/docs/${nextPage.categorySlug}/${nextPage.slug}`"
            class="pager-card next"
          >
            <span class="pager-label">Selanjutnya &rarr;</span>
            <span class="pager-title">{{ nextPage.title }}</span>
          </router-link>
        </nav>
      </div>

      <TableOfContents :content="page.content" />
    </template>
  </div>
</template>

<style scoped>
.breadcrumb { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-ink-soft); margin: 0 0 1.25rem; }
.breadcrumb .sep { margin: 0 0.35rem; color: var(--color-border); }
.breadcrumb .current { color: var(--color-accent); }
.lead { color: var(--color-ink-soft); margin: 0.5rem 0 2rem; }
.subbab-title { font-size: 1.1rem; margin-bottom: 0.75rem; }
.subbab-list { list-style: none; padding: 0; margin: 0; }
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

.category-page {
  display: flex;
  gap: 2rem;
}
.category-content {
  flex: 1;
  min-width: 0;
}

.category-content :deep(.single-page-content table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background-color: transparent; 
}

.category-content :deep(.single-page-content th),
.category-content :deep(.single-page-content td) {
  border: 1px solid var(--color-border);
  padding: 10px 14px;
  text-align: left;
  vertical-align: top;
  color: var(--color-ink);
}

.category-content :deep(.single-page-content th) {
  background-color: rgba(128, 128, 128, 0.15);
  font-weight: bold;
}

.category-content :deep(.single-page-content tr:nth-child(even)) {
  background-color: rgba(128, 128, 128, 0.04);
}

.category-content :deep(.single-page-content tr:hover) {
  background-color: rgba(128, 128, 128, 0.08);
}

.single-page-content :deep(img) {
  max-width: 350px !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
  margin: 0 auto !important;
}

.category-content :deep(.single-page-content ul) {
  list-style: disc !important;
  list-style-type: disc !important;
  padding-left: 2.5rem !important;
  margin: 1rem 0 !important;
}

.category-content :deep(.single-page-content ol) {
  list-style: decimal !important;
  list-style-type: decimal !important;
  padding-left: 2.5rem !important;
  margin: 1rem 0 !important;
}

.category-content :deep(.single-page-content li) {
  display: list-item !important; 
  margin-bottom: 0.4rem !important;
  line-height: 1.7 !important;
}

.category-content :deep(.single-page-content p) {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.category-content :deep(.single-page-content p span) {
  display: inline;
}

.category-content :deep(.single-page-content),
.category-content :deep(.single-page-content *) {
  font-family: inherit !important;
}

.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}
.pager-card {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}
.pager-card:hover {
  border-color: var(--color-accent);
  text-decoration: none;
}
.pager-card.next {
  text-align: right;
  align-items: flex-end;
}
.pager-label {
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}
.pager-title {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-ink);
}

.fetch-error {
  padding: 1rem 1.2rem;
  border: 1px solid #d33;
  border-radius: var(--radius);
  color: #d33;
  background: rgba(211, 51, 51, 0.06);
}
</style>
<script setup>
import { computed, onMounted } from 'vue'
import { useDocsStore } from '../stores/docs'
import { useAuthStore } from '../stores/auth'
import { icons } from '../icons'

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
        
        <div class="single-page-content" v-html="page.content_html"></div>

        <template v-if="page.children && page.children.length > 0">
          <h2 class="subbab-title">Subbab</h2>
          <ul class="subbab-list">
            <li v-for="c in page.children" :key="c.id">
              <router-link :to="`/docs/${category}/${props.page}/${c.slug}`">{{ c.title }}</router-link>
              <span> — {{ c.description }}</span>
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

      <aside class="toc">
        <p class="toc-title">Pada halaman ini</p>
        <ul>
          <li v-for="c in page.children" :key="c.id" :id="c.slug">
            <a :href="`#${c.slug}`">{{ c.title }}</a>
          </li>
        </ul>
      </aside>
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

.category-content :deep(.single-page-content img) {
  max-width: 100%;  
  max-height: 400px;     
  width: auto;
  height: auto;
  display: block;
  margin: 1.5rem auto;  
  /* border-radius: 8px;   */
  object-fit: contain;   
}

.toc {
  width: 200px;
  flex-shrink: 0;
  padding: 1.75rem 0.5rem;
  position: sticky;
  top: 4.5rem;
  align-self: flex-start;
}
.toc-title {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-ink-soft);
  margin-bottom: 0.6rem;
}
.toc ul { list-style: none; margin: 0; padding: 0; border-left: 2px solid var(--color-border); }
.toc li { margin-bottom: 0.35rem; }
.toc a {
  display: block;
  padding: 0.1rem 0 0.1rem 0.75rem;
  margin-left: -2px;
  border-left: 2px solid transparent;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}
.toc a:hover { color: var(--color-accent); border-left-color: var(--color-accent); text-decoration: none; }


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

@media (max-width: 1100px) { .toc { display: none; } }

.fetch-error {
  padding: 1rem 1.2rem;
  border: 1px solid #d33;
  border-radius: var(--radius);
  color: #d33;
  background: rgba(211, 51, 51, 0.06);
}
</style>
<script setup>
import { computed, onMounted } from 'vue'
import { useDocsStore } from '../stores/docs'
import EditPageLink from '../components/EditPageLink.vue'

const props = defineProps({
  category: { type: String, required: true }
})

const docsStore = useDocsStore()
const cat = computed(() => docsStore.categoryBySlug(props.category))

onMounted(() => {
  if (!docsStore.categories.length) docsStore.fetchCategories()
})

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
</script>

<style scoped>
.breadcrumb { font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-ink-soft); margin: 0 0 1.25rem; }
.breadcrumb .sep { margin: 0 0.35rem; color: var(--color-border); }
.breadcrumb .current { color: var(--color-accent); }
.lead { color: var(--color-ink-soft); margin: 0.5rem 0 2rem; }
.subbab-title { font-size: 1.1rem; margin-bottom: 0.75rem; }
.subbab-list { list-style: none; padding: 0; margin: 0; }
.subbab-list li { margin-bottom: 0.6rem; font-size: 0.95rem; color: var(--color-ink-soft); scroll-margin-top: 5rem; }
.subbab-list a { font-weight: 600; }

.category-page {
  display: flex;
  gap: 2rem;
}
.category-content {
  flex: 1;
  min-width: 0;
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

@media (max-width: 1100px) { .toc { display: none; } }
</style>

<template>
  <div class="category-page">
    <div v-if="!cat">Kategori tidak ditemukan.</div>
    <template v-else>
      <div class="category-content">
        <p class="breadcrumb">
          <router-link to="/">docs</router-link>
          <span class="sep">/</span>
          <span class="current">{{ cat.slug }}</span>
        </p>
        <h1>{{ cat.name }}</h1>
        <p class="lead">{{ cat.description }}</p>

        <h2 class="subbab-title">Subbab</h2>
        <ul class="subbab-list">
          <li v-for="page in cat.pages" :key="page.id" :id="slugify(page.title)">
            <router-link :to="`/docs/${cat.slug}/${page.slug}`">{{ page.title }}</router-link>
            <span> — {{ page.description }}</span>
          </li>
        </ul>
        <EditPageLink :href="`https://admin.toms-docs.local/edit-category/${cat.slug}`" />
      </div>

      <aside class="toc">
        <p class="toc-title">Pada halaman ini</p>
        <ul>
          <li v-for="page in cat.pages" :key="page.id">
            <a :href="`#${slugify(page.title)}`">{{ page.title }}</a>
          </li>
        </ul>
      </aside>
    </template>
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { useDocsStore } from '../stores/docs'
import { useAuthStore } from '../stores/auth'
import { icons } from '../icons'
import EditPageLink from '../components/EditPageLink.vue'

const props = defineProps({
  category: { type: String, required: true }
})

const docsStore = useDocsStore()
const auth = useAuthStore()
const cat = computed(() => docsStore.categoryBySlug(props.category))

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
.subbab-sublist { list-style: none; padding-left: 1.5rem; margin: 0.4rem 0 0; border-left: 2px solid var(--color-border); }
.subbab-sublist li { margin-bottom: 0.4rem; font-size: 0.9rem; }
.single-page-content { line-height: 1.7; }
.single-page-content :deep(h2) { margin-top: 2rem; }
.single-page-content :deep(table) { border-collapse: collapse; width: 100%; margin: 1rem 0; }
.single-page-content :deep(td), .single-page-content :deep(th) { border: 1px solid var(--color-border); padding: 0.4rem 0.6rem; }

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

<template>
  <div class="category-page">
    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
    <div v-else-if="!cat">Kategori tidak ditemukan.</div>
    <template v-else>
      <div class="category-content">
        <p class="breadcrumb">
          <router-link to="/">docs</router-link>
          <span class="sep">/</span>
          <span class="current">{{ cat.slug }}</span>
        </p>
        <h1>{{ cat.name }}</h1>
        <p class="lead">{{ cat.description }}</p>

        <template v-if="cat.pages?.length === 1 && !cat.pages[0].children?.length">
          <div class="single-page-content" v-html="cat.pages[0].content_html"></div>
          <EditPageLink :to="`/docs/${cat.slug}/${cat.pages[0].slug}/edit`" />
        </template>

        <template v-else>
          <h2 class="subbab-title">Subbab</h2>
          <ul class="subbab-list">
            <li v-for="page in cat.pages" :key="page.id" :id="slugify(page.title)">
              <router-link :to="`/docs/${cat.slug}/${page.slug}`">{{ page.title }}</router-link>
              <span v-if="page.description"> — {{ page.description }}</span>
              <router-link
                :to="`/docs/${cat.slug}/${page.slug}/edit`"
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
            v-if="prevCategory"
            :to="`/docs/${prevCategory.slug}`"
            class="pager-card prev"
          >
            <span class="pager-label">&larr; Sebelumnya</span>
            <span class="pager-title">{{ prevCategory.name }}</span>
          </router-link>
          <span v-else></span>

          <router-link
            v-if="nextCategory"
            :to="`/docs/${nextCategory.slug}`"
            class="pager-card next"
          >
            <span class="pager-label">Selanjutnya &rarr;</span>
            <span class="pager-title">{{ nextCategory.name}}</span>
          </router-link>
        </nav>
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
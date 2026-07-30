<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { icons } from '../icons'

defineEmits(['navigate'])
const docsStore = useDocsStore()
const route = useRoute()

onMounted(() => {
  if (!docsStore.categories.length) docsStore.fetchCategories()
})

// Kategori yang sedang aktif, ditentukan dari parameter :category di URL saat ini.
const activeCategory = computed(() => {
  const slug = route.params.category
  return docsStore.categories.find((c) => c.slug === slug) || null
})
</script>

<style scoped>
.sidebar {
  width: 240px; flex-shrink: 0; padding: 1.75rem 1.25rem;
  border-right: 1px solid var(--color-border); background: var(--color-surface);
  position: sticky; top: 58px; height: calc(100vh - 58px); overflow-y: auto;
}

/* Blok atas: daftar semua kategori */
.category-nav { list-style: none; margin: 0 0 1.25rem; padding: 0; }
.category-link {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.4rem 0.5rem;
  border-radius: var(--radius);
  color: var(--color-ink-soft);
  font-size: 0.9rem;
  text-decoration: none;
}
.category-link:hover { background: var(--color-accent-soft); color: var(--color-accent); text-decoration: none; }
.category-link.is-active { color: var(--color-accent); font-weight: 600; }

.category-icon { width: 16px; height: 16px; flex-shrink: 0; }
.category-icon :deep(svg) { width: 100%; height: 100%; }

.divider { border: none; border-top: 1px dashed var(--color-border); margin: 0 0 1.25rem; }

/* Blok bawah: daftar halaman dari kategori aktif */
.pages-block-title {
  font-family: var(--font-display); font-size: 0.8rem; font-weight: 600;
  color: var(--color-accent);
  margin: 0 0 0.6rem;
  padding: 0 0.5rem;
}
.page-list { list-style: none; margin: 0; padding: 0; }
.link { display: block; padding: 0.35rem 0.6rem 0.35rem 1.2rem; border-radius: var(--radius); color: var(--color-ink); font-size: 0.83rem; }
.link:hover { background: var(--color-accent-soft); text-decoration: none; }
.link.is-active {
  background: var(--color-accent-soft); color: var(--color-accent); font-weight: 600;
  border-left: 3px solid var(--color-accent); padding-left: calc(1.2rem - 3px);
}

@media (max-width: 860px) {
  .sidebar {
    position: fixed; top: 58px; left: 0; bottom: 0; width: 260px; z-index: 30;
    transform: translateX(-100%); transition: transform 0.2s ease; overflow-y: auto;
  }
  .sidebar.is-open { transform: translateX(0); }
}
</style>

<template>
  <aside class="sidebar">
    <ul class="category-nav">
      <li v-for="cat in docsStore.categories" :key="cat.id">
        <router-link
          :to="`/docs/${cat.slug}`"
          class="category-link"
          :class="{ 'is-active': activeCategory?.id === cat.id }"
          @click="$emit('navigate')"
        >
          <span v-html="icons[cat.icon]" class="category-icon"></span>
          {{ cat.name }}
        </router-link>
      </li>
    </ul>

    <template v-if="activeCategory">
      <hr class="divider" />
      <p class="pages-block-title">{{ activeCategory.name }}</p>
      <ul class="page-list">
        <li v-for="page in activeCategory.pages" :key="page.id">
          <router-link
            :to="`/docs/${activeCategory.slug}/${page.slug}`"
            class="link"
            active-class="is-active"
            @click="$emit('navigate')"
          >
            {{ page.title }}
          </router-link>
        </li>
      </ul>
    </template>
  </aside>
</template>
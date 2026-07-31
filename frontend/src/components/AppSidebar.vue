<script setup>
import { computed, onMounted, reactive, watch } from 'vue'
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

// Halaman (page) yang sedang aktif, dipakai untuk auto-expand subbab-nya.
const activePage = computed(() => {
  const pageSlug = route.params.page
  return activeCategory.value?.pages?.find((p) => p.slug === pageSlug) || null
})

// Menyimpan id page mana saja yang dropdown-nya sedang terbuka.
const expandedPages = reactive(new Set())

function isExpanded(page) {
  return expandedPages.has(page.id)
}
function toggleExpand(page) {
  if (expandedPages.has(page.id)) expandedPages.delete(page.id)
  else expandedPages.add(page.id)
}

// Otomatis buka dropdown untuk page yang sedang dibuka lewat URL.
watch(
  activePage,
  (page) => {
    if (page) expandedPages.add(page.id)
  },
  { immediate: true }
)
</script>

<template>
  <aside class="sidebar">
    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
    <ul class="category-nav">
      <li v-for="cat in docsStore.categories" :key="cat.id">
        <router-link
          :to="`/docs/${cat.slug}`"
          class="category-link"
          :class="{ 'is-active': activeCategory?.id === cat.id }"
          @click="$emit('navigate')"
        >
          <!-- Menggunakan safe check agar icon tidak bikin crash kalau key missing -->
          <span v-if="icons[cat.icon]" v-html="icons[cat.icon]" class="category-icon"></span>
          <!-- FIXED: cat.title (sebelumnya cat.name) -->
          {{ cat.name }}
        </router-link>
      </li>
    </ul>

    <template v-if="activeCategory">
      <hr class="divider" />
      <!-- FIXED: activeCategory.title (sebelumnya activeCategory.name) -->
      <p class="pages-block-title">{{ activeCategory.name }}</p>
      <ul class="page-list">
        <li v-for="page in activeCategory.pages" :key="page.id" class="page-item">
          <div class="page-row">
            <router-link
              :to="`/docs/${activeCategory.slug}/${page.slug}`"
              class="link"
              active-class="is-active"
              @click="$emit('navigate')"
            >
              {{ page.title }}
            </router-link>
            <button
              v-if="page.children?.length"
              type="button"
              class="toggle-btn"
              :class="{ 'is-expanded': isExpanded(page) }"
              :aria-expanded="isExpanded(page)"
              :aria-label="isExpanded(page) ? 'Tutup subbab' : 'Buka subbab'"
              @click="toggleExpand(page)"
            >
              <span v-html="icons.chevron"></span>
            </button>
          </div>
          <ul v-if="page.children?.length && isExpanded(page)" class="child-list">
            <li v-for="child in page.children" :key="child.id">
              <router-link
                :to="`/docs/${activeCategory.slug}/${page.slug}/${child.slug}`"
                class="child-link"
                active-class="is-active"
                @click="$emit('navigate')"
              >
                {{ child.title }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </template>
  </aside>
</template>

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
.page-item { margin-bottom: 0.1rem; }
.page-row { display: flex; align-items: center; }
.link { display: block; padding: 0.35rem 0.6rem 0.35rem 1.2rem; border-radius: var(--radius); color: var(--color-ink); font-size: 0.83rem; flex: 1; min-width: 0; }
.link:hover { background: var(--color-accent-soft); text-decoration: none; }
.link.is-active {
  background: var(--color-accent-soft); color: var(--color-accent); font-weight: 600;
  border-left: 3px solid var(--color-accent); padding-left: calc(1.2rem - 3px);
}

.toggle-btn {
  display: flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; flex-shrink: 0;
  background: none; border: none; cursor: pointer;
  color: var(--color-ink-soft); border-radius: var(--radius);
}
.toggle-btn:hover { background: var(--color-accent-soft); color: var(--color-accent); }
.toggle-btn span { width: 12px; height: 12px; display: block; transition: transform 0.15s ease; }
.toggle-btn :deep(svg) { width: 100%; height: 100%; }
.toggle-btn.is-expanded span { transform: rotate(90deg); }

.child-list { list-style: none; margin: 0.1rem 0 0.3rem; padding: 0; }
.child-link {
  display: block; padding: 0.32rem 0.6rem 0.32rem 2.1rem;
  border-radius: var(--radius); color: var(--color-ink-soft); font-size: 0.78rem;
}
.child-link:hover { background: var(--color-accent-soft); color: var(--color-accent); text-decoration: none; }
.child-link.is-active {
  background: var(--color-accent-soft); color: var(--color-accent); font-weight: 600;
  border-left: 3px solid var(--color-accent); padding-left: calc(2.1rem - 3px);
}

@media (max-width: 860px) {
  .sidebar {
    position: fixed; top: 58px; left: 0; bottom: 0; width: 260px; z-index: 30;
    transform: translateX(-100%); transition: transform 0.2s ease; overflow-y: auto;
  }
  .sidebar.is-open { transform: translateX(0); }
}

.fetch-error {
  margin: 0.5rem 0.75rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid #d33;
  border-radius: var(--radius);
  color: #d33;
  font-size: 0.8rem;
  background: rgba(211, 51, 51, 0.06);
}
</style>
<script setup>
import { computed, onMounted, ref, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { useAuthStore } from '../stores/auth'
import { icons } from '../icons'
import SidebarPageItem from './SidebarPageItem.vue'

defineEmits(['navigate'])
const docsStore = useDocsStore()
const authStore = useAuthStore()
const route = useRoute()

const isAdmin = computed(() => authStore.canEdit)
const sidebarEl = ref(null)

onMounted(() => {
  if (!docsStore.categories.length) docsStore.fetchCategories()
})

const activeCategory = computed(() => {
  const slug = route.params.category
  return docsStore.categories.find((c) => c.slug === slug) || null
})

// Keep the currently active link in view automatically — whenever the
// route changes (or the category list finishes loading), scroll the
// sidebar so the active item is visible without the user scrolling.
function scrollActiveIntoView() {
  nextTick(() => {
    // Prefer the active PAGE link. The category link also gets `.is-active`
    // and sits earlier in the DOM, so a plain `.is-active` query would match
    // it first and stop there (it's usually already visible), skipping the
    // actual active page further down.
    const el =
      sidebarEl.value?.querySelector('.link.is-active') ||
      sidebarEl.value?.querySelector('.category-link.is-active')
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  })
}

watch(
  () => [route.fullPath, docsStore.categories.length],
  scrollActiveIntoView,
  { flush: 'post', immediate: true }
)
</script>

<template>
  <aside class="sidebar" ref="sidebarEl">
    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
    <ul class="category-nav">
      <li v-for="cat in docsStore.categories" :key="cat.id" class="category-item">
        <router-link
          :to="`/docs/${cat.slug}`"
          class="category-link"
          :class="{ 'is-active': activeCategory?.id === cat.id }"
          @click="$emit('navigate')"
        >
          <span v-if="icons[cat.icon]" v-html="icons[cat.icon]" class="category-icon"></span>
          {{ cat.name }}
        </router-link>

        <ul v-if="activeCategory?.id === cat.id" class="page-list">
          <SidebarPageItem
            v-for="page in activeCategory.pages"
            :key="page.id"
            :category="activeCategory"
            :page="page"
            @navigate="$emit('navigate')"
          />
        </ul>
      </li>
    </ul>

    <template v-if="isAdmin">
      <hr class="divider" />
      <router-link to="/admin" class="category-link admin-link" @click="$emit('navigate')">
        <span v-if="icons.kerangkaPenyelenggaraan" v-html="icons.kerangkaPenyelenggaraan" class="category-icon"></span>
        Admin Panel
      </router-link>
    </template>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px; flex-shrink: 0; padding: 1.75rem 1.25rem;
  border-right: 1px solid var(--color-border); background: var(--color-surface);
  position: sticky; top: 58px; height: calc(100vh - 58px); overflow-y: auto;
}

.category-nav { list-style: none; margin: 0 0 1.25rem; padding: 0; }
.category-item { margin-bottom: 0.15rem; }
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

.page-list {
  list-style: none;
  margin: 0.2rem 0 0.5rem;
  padding: 0 0 0 0.4rem;
  border-left: 1px dashed var(--color-border);
}
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
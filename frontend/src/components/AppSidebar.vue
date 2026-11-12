<script setup>
import { computed, onMounted, ref, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { icons } from '../icons'
import SidebarPageItem from './SidebarPageItem.vue'

defineEmits(['navigate'])
const docsStore = useDocsStore()
const route = useRoute()

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
    const box = sidebarEl.value
    const el = box?.querySelector('.ds-link.active') || box?.querySelector('.ds-cat.active')
    if (!box || !el) return
    // Hanya menggeser panel sidebar itu sendiri, bukan halaman utama.
    const b = box.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    box.scrollTo({ top: box.scrollTop + (r.top - b.top) - box.clientHeight / 2 + r.height / 2, behavior: 'smooth' })
  })
}

watch(
  () => [route.fullPath, docsStore.categories.length],
  scrollActiveIntoView,
  { flush: 'post', immediate: true }
)
</script>

<template>
  <aside class="docs-side" ref="sidebarEl" aria-label="Navigasi dokumentasi">
    <div v-if="docsStore.error" class="fetch-error">{{ docsStore.error }}</div>
    <ul class="ds-cats">
      <li>
        <router-link to="/daftar-isi" class="ds-cat ds-toc" :class="{ active: route.name === 'toc' }" @click="$emit('navigate')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"></path></svg>Daftar Isi
        </router-link>
      </li>
      <li v-for="cat in docsStore.categories" :key="cat.id">
        <router-link :to="`/docs/${cat.slug}`" class="ds-cat" :class="{ active: activeCategory?.id === cat.id }" @click="$emit('navigate')">{{ cat.name }}</router-link>
        <ul v-if="activeCategory?.id === cat.id && activeCategory.pages?.length" class="ds-pages">
          <SidebarPageItem v-for="page in activeCategory.pages" :key="page.id" :category="activeCategory" :page="page" @navigate="$emit('navigate')" />
        </ul>
      </li>
    </ul>
  </aside>
</template>

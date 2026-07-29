<script setup>
import { onMounted } from 'vue'
import { useDocsStore } from '../stores/docs'
import { icons }  from '../icons'

defineEmits(['navigate'])
const docsStore = useDocsStore()

onMounted(() => {
    if (!docsStore.categories.length) docsStore.fetchCategories()
})
</script>


<style scoped>
.sidebar { width: 240px; flex-shrink: 0; padding: 1.75rem 1.25rem; border-right: 1px solid var(--color-border); background: var(--color-surface); position: sticky; top: 58px; height: calc(100vh - 58px); overflow-y: auto;
            position: sticky; top: 58px; height: calc(100vh - 58px); overflow-y: auto; }
.group { margin-bottom: 1.5rem; }
.group-title {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-display); font-size: 0.8rem; font-weight: 600;
  color: var(--color-ink-soft); margin: 0 0 0.5rem;
  text-decoration: none;
}
.group-title:hover { color: var(--color-accent); text-decoration: none; }
.group-icon { width: 15px; height: 15px; color: var(--color-accent); }
.group-icon :deep(svg) { width: 100%; height: 100%; }
ul { list-style: none; margin: 0; padding: 0; }
.link { display: block; padding: 0.35rem 0.6rem 0.35rem 1.7rem; border-radius: var(--radius); color: var(--color-ink); font-size: 0.9rem; }
.link:hover { background: var(--color-accent-soft); text-decoration: none; }
.link.is-active { background: var(--color-accent-soft); color: var(--color-accent); font-weight: 600;
                    border-left: 3px solid var(--color-accent); padding-left: calc(1.75rem - 3px); }

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
    <nav v-for="cat in docsStore.categories" :key="cat.id" class="group">
      <router-link :to="`/docs/${cat.slug}`" class="group-title" @click="$emit('navigate')">
        <span v-html="icons[cat.icon]" class="group-icon"></span>
        {{ cat.title }}
      </router-link>
      <ul>
        <li v-for="page in cat.pages" :key="page.id">
          <router-link :to="`/docs/${cat.slug}/${page.slug}`" class="link" active-class="is-active" @click="$emit('navigate')">
            {{ page.title }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>
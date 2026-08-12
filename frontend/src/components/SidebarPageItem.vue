<script setup>
import { computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { icons } from '../icons'

// Renders itself + recurses into `page.children`, so the sidebar can go
// as deep as the data goes — matching the router's `:slugs+` pattern
// which already supports pages nested arbitrarily deep.
const props = defineProps({
  category: { type: Object, required: true },
  page: { type: Object, required: true },
  parentSlugs: { type: Array, default: () => [] }, // ancestor slugs, NOT including this page
  depth: { type: Number, default: 0 }
})
defineEmits(['navigate'])

const route = useRoute()

const ownSlugs = computed(() => [...props.parentSlugs, props.page.slug])
const to = computed(() => `/docs/${props.category.slug}/${ownSlugs.value.join('/')}`)

// route.params.slugs is what the router actually provides now (an array,
// or a single string if there's only one segment) — route.params.page /
// route.params.child no longer exist for doc-page/edit-page routes.
const routeSlugs = computed(() => {
  const s = route.params.slugs
  if (Array.isArray(s)) return s
  return s ? [s] : []
})

const isActive = computed(() => {
  return route.params.category === props.category.slug &&
    routeSlugs.value.join('/') === ownSlugs.value.join('/')
})

// Auto-expand if this page is an ancestor of whatever page is currently open.
const isAncestorOfActive = computed(() => {
  const rs = routeSlugs.value
  const own = ownSlugs.value
  if (rs.length <= own.length) return false
  return own.every((slug, i) => rs[i] === slug)
})

const state = reactive({ expanded: false })
// Sync expand state with the active path on every navigation: open the
// branch that leads to the active page, and close any branch that no
// longer does — so the sidebar always matches the current page without
// leftover branches piling up from earlier clicks.
watch(isAncestorOfActive, (v) => { state.expanded = v }, { immediate: true })

function toggle() {
  state.expanded = !state.expanded
}
</script>

<template>
  <li class="page-item">
    <div class="page-row">
      <router-link
        :to="to"
        class="link"
        :class="{ 'is-active': isActive }"
        :style="{ paddingLeft: `${1.2 + depth * 0.9}rem` }"
        @click="$emit('navigate')"
      >
        {{ page.title }}
      </router-link>
      <button
        v-if="page.children?.length"
        type="button"
        class="toggle-btn"
        :class="{ 'is-expanded': state.expanded }"
        :aria-expanded="state.expanded"
        :aria-label="state.expanded ? 'Tutup subbab' : 'Buka subbab'"
        @click="toggle"
      >
        <span v-html="icons.chevron"></span>
      </button>
    </div>
    <ul v-if="page.children?.length && state.expanded" class="child-list">
      <SidebarPageItem
        v-for="child in page.children"
        :key="child.id"
        :category="category"
        :page="child"
        :parent-slugs="ownSlugs"
        :depth="depth + 1"
        @navigate="$emit('navigate')"
      />
    </ul>
  </li>
</template>

<style scoped>
.page-item { margin-bottom: 0.1rem; }
.page-row { display: flex; align-items: center; }
.link {
  display: block; padding: 0.35rem 0.6rem 0.35rem 1.2rem; border-radius: var(--radius);
  color: var(--color-ink); font-size: 0.83rem; flex: 1; min-width: 0;
}
.link:hover { background: var(--color-accent-soft); text-decoration: none; }
.link.is-active {
  background: var(--color-accent-soft); color: var(--color-accent); font-weight: 600;
  border-left: 3px solid var(--color-accent);
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
</style>
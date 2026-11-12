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
  <li class="ds-item">
    <div class="ds-row">
      <router-link :to="to" class="ds-link" :class="{ active: isActive }" :style="{ paddingLeft: `${10 + depth * 14}px` }" @click="$emit('navigate')">{{ page.title }}</router-link>
      <button
        v-if="page.children?.length"
        type="button"
        class="ds-toggle"
        :aria-expanded="state.expanded"
        :aria-label="state.expanded ? 'Tutup subbab' : 'Buka subbab'"
        @click="toggle"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" :style="{ transform: state.expanded ? 'rotate(90deg)' : 'none' }"><path d="m9 18 6-6-6-6"></path></svg>
      </button>
    </div>
    <ul v-if="page.children?.length && state.expanded" class="ds-children">
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

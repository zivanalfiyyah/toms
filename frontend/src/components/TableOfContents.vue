<template>
  <aside v-if="headings.length" class="toc">
    <p class="toc-title">Pada halaman ini</p>
    <ul class="toc-tree">
      <li v-for="h in headings" :key="h.id">
        <a :href="`#${h.id}`" :class="{ active: activeId === h.id }">{{ h.text }}</a>
        <ul v-if="h.children.length" class="sub">
          <li v-for="c in h.children" :key="c.id">
            <a :href="`#${c.id}`" :class="{ active: activeId === c.id }">{{ c.text }}</a>
          </li>
        </ul>
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({ content: { type: Object, default: null } })

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const headings = computed(() => {
  if (!props.content?.content) return []

  const flat = []
  for (const node of props.content.content) {
    if (node.type === 'heading') {
      const text = (node.content || []).map((c) => c.text || '').join('')
      flat.push({ id: slugify(text), text, level: node.attrs?.level || 1 })
    }
  }
  if (!flat.length) return []

  const topLevel = Math.min(...flat.map((h) => h.level))
  const tree = []
  let currentParent = null

  for (const h of flat) {
    if (h.level === topLevel) {
      currentParent = { ...h, children: [] }
      tree.push(currentParent)
    } else if (currentParent) {
      currentParent.children.push(h)
    } else {
      tree.push({ ...h, children: [] })
    }
  }

  return tree
})

const activeId = ref(null)
let ticking = false

function getAllIds() {
  const ids = []
  for (const h of headings.value) {
    ids.push(h.id)
    for (const c of h.children) ids.push(c.id)
  }
  return ids
}

function updateActive() {
  const ids = getAllIds()
  let current = null

  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= 120) {
      current = id
    } else {
      break
    }
  }

  activeId.value = current
  ticking = false
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(updateActive)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

watch(
  () => props.content,
  async () => {
    activeId.value = null
    await nextTick()
    setTimeout(updateActive, 50)
  },
  { immediate: true }
)
</script>

<style scoped>
.toc {
  width: 210px;
  flex-shrink: 0;
  padding: 1.5rem 0.5rem;
  position: sticky;
  top: 4.5rem;
  align-self: flex-start;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 1. Judul + Garis Pembatas Atas */
.toc-title {
  font-size: 0.725rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #374151;
  margin: 0 0 0.85rem 0;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb; /* Garis horizontal atas */
}

/* 2. Daftar Menu + Garis Vertikal Lurus Sebelah Kiri */
.toc-tree, 
.toc-tree .sub {
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

.toc-tree {
  border-left: 1px solid #e5e7eb; /* Garis vertikal abu-abu lurus */
}

.toc-tree li {
  margin: 0 !important;
  padding: 0 !important;
  list-style-type: none !important;
}

/* 3. Link Menu Utama */
.toc-tree a {
  display: block;
  padding: 0.3rem 0 0.3rem 0.85rem;
  font-size: 0.725rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #6b7280;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.15s ease;
  background: transparent;
}

.toc-tree a:hover {
  color: #0d9488;
}

.toc-tree a.active {
  color: #0d9488;
  font-weight: 700;
}

/* 4. Sub Menu / Anak Menu (Building Trust...) */
.toc-tree .sub a {
  padding-left: 1.6rem; /* Menjorok ke dalam */
  font-size: 0.68rem;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
}

.toc-tree .sub a.active {
  color: #0d9488;
  font-weight: 600;
}

@media (max-width: 1100px) {
  .toc { display: none; }
}
</style>
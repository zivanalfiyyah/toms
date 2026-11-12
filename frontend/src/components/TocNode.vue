<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { icons } from '../icons'

// Satu baris halaman di Daftar Isi (markup dari desain portal). Rekursif untuk `page.children`.
const props = defineProps({
  category: { type: Object, required: true },
  page: { type: Object, required: true },
  parentSlugs: { type: Array, default: () => [] },
  depth: { type: Number, default: 0 },
  open: { type: Object, required: true } // { [key]: boolean }
})
defineEmits(['toggle'])

const router = useRouter()
const slugs = computed(() => [...props.parentSlugs, props.page.slug])
const to = computed(() => `/docs/${props.category.slug}/${slugs.value.join('/')}`)
const key = computed(() => `p-${props.page.id}`)
const hasChildren = computed(() => !!props.page.children?.length)
const isOpen = computed(() => !!props.open[key.value])
const pad = computed(() => `${14 + props.depth * 22}px`)
</script>

<template>
  <li class="toc-node" :class="{ 'has-kids': hasChildren, 'is-open': isOpen }">
    <div class="toc-row" :class="{ card: hasChildren }" :style="hasChildren ? null : { paddingLeft: pad }" @click="hasChildren ? $emit('toggle', key) : router.push(to)">
      <button
        v-if="hasChildren"
        type="button"
        class="toc-chev"
        :class="{ open: isOpen }"
        :aria-expanded="isOpen"
        aria-label="Buka/tutup sub-bab"
        @click.stop="$emit('toggle', key)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
      </button>
      <span v-else class="toc-dot"></span>
      <span v-if="hasChildren" class="toc-ico" v-html="icons.folder"></span>
      <div class="toc-title">
        <small v-if="hasChildren">SUB-BAB</small>
        <button type="button" class="toc-link" @click.stop="hasChildren ? $emit('toggle', key) : router.push(to)">{{ page.title }}</button>
      </div>
      <span v-if="hasChildren" class="badge">{{ page.children.length }} sub-bab</span>
      <button type="button" class="toc-open" @click.stop="router.push(to)">Buka →</button>
    </div>
    <ul v-if="hasChildren && isOpen" class="toc-kids">
      <TocNode
        v-for="child in page.children"
        :key="child.id"
        :category="category"
        :page="child"
        :parent-slugs="slugs"
        :depth="depth + 1"
        :open="open"
        @toggle="(k) => $emit('toggle', k)"
      />
    </ul>
  </li>
</template>

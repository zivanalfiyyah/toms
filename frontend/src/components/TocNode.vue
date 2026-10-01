<script setup>
import { computed } from 'vue'

// Satu baris halaman di Daftar Isi. Merender dirinya sendiri secara rekursif
// untuk `page.children`, jadi kedalaman mengikuti data yang sudah dimuat.
const props = defineProps({
  category: { type: Object, required: true },
  page: { type: Object, required: true },
  parentSlugs: { type: Array, default: () => [] },
  depth: { type: Number, default: 0 },
  open: { type: Object, required: true } // { [key]: boolean }
})
defineEmits(['toggle'])

const slugs = computed(() => [...props.parentSlugs, props.page.slug])
const to = computed(() => `/docs/${props.category.slug}/${slugs.value.join('/')}`)
const key = computed(() => `p-${props.page.id}`)
const hasChildren = computed(() => !!props.page.children?.length)
const isOpen = computed(() => !!props.open[key.value])
// children === undefined berarti sub-bab halaman ini masih dimuat di belakang layar
const isLoading = computed(() => props.page.children === undefined)
</script>

<template>
  <li class="toc-node">
    <div class="row">
      <button
        v-if="hasChildren"
        type="button"
        class="chev"
        :class="{ 'is-open': isOpen }"
        :aria-expanded="isOpen"
        :aria-label="isOpen ? 'Tutup subbab' : 'Buka subbab'"
        @click="$emit('toggle', key)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6" /></svg>
      </button>
      <span v-else class="chev-spacer"></span>

      <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
        <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" /><path d="M14 3v5h5M9 13h6M9 17h6" />
      </svg>
      <span class="title">{{ page.title }}</span>
      <span v-if="isLoading" class="loading-dot" title="Memuat sub-bab…"></span>
      <span v-if="hasChildren" class="count">{{ page.children.length }} sub-bab</span>

      <router-link :to="to" class="open-btn">
        Buka
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </router-link>
    </div>

    <ul v-if="hasChildren && isOpen" class="children">
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

<style scoped>
.toc-node { list-style: none; }
.row {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 0.55rem 0.75rem;
  margin-bottom: 0.5rem;
}
.row:hover { border-color: var(--color-accent-border); box-shadow: var(--glow-active); }
.loading-dot {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
  background: var(--color-accent); animation: toc-pulse 1.2s ease-in-out infinite;
}
@keyframes toc-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }
.chev, .chev-spacer { width: 20px; height: 20px; flex-shrink: 0; }
.chev {
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; padding: 0; cursor: pointer;
  color: var(--color-ink-soft); border-radius: 6px;
}
.chev:hover { background: var(--color-accent-soft); color: var(--color-accent); }
.chev svg { width: 14px; height: 14px; transition: transform 0.15s ease; }
.chev.is-open svg { transform: rotate(90deg); }

.file-icon { width: 16px; height: 16px; flex-shrink: 0; color: var(--color-ink-soft); }
.title { flex: 1; min-width: 0; font-size: 0.88rem; font-weight: 500; color: var(--color-ink); }
.count {
  font-size: 0.7rem; color: var(--color-ink-soft);
  background: var(--color-bg); padding: 0.15rem 0.55rem; border-radius: 999px;
}
.open-btn {
  display: inline-flex; align-items: center; gap: 0.25rem; flex-shrink: 0;
  padding: 0.25rem 0.65rem; border-radius: 8px;
  font-size: 0.75rem; font-weight: 500;
  background: var(--color-bg); color: var(--color-ink-soft);
  transition: background 0.15s ease, color 0.15s ease;
}
.open-btn svg { width: 12px; height: 12px; }
.open-btn:hover { background: var(--color-accent); color: #fff; text-decoration: none; }

.children {
  margin: 0 0 0.25rem 0.9rem; padding: 0 0 0 0.9rem;
  border-left: 2px solid var(--color-accent-border);
}
[data-theme='dark'] .row { background: var(--glass-bg); border-color: var(--glass-border); }
</style>

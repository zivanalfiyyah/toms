<script setup>
// Renders one page row + recursively renders its children, so the admin
// tree can go as deep as the data actually goes (matching the public
// site, which already supports arbitrary-depth pages via the router's
// `:slugs+` pattern and docsStore.fetchPageByPath).
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '../../stores/admin'

const props = defineProps({
  cat: { type: Object, required: true },
  page: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['add-child', 'edit', 'remove'])

const admin = useAdminStore()
const loadingChildren = ref(false)

const levelLabels = ['Halaman', 'Sub Halaman', 'Sub-sub Halaman', 'Sub-sub-sub Halaman']
const levelLabel = computed(() => levelLabels[props.depth] ?? `Level ${props.depth + 1}`)

async function loadChildren() {
  loadingChildren.value = true
  await admin.loadPageChildren(props.page)
  loadingChildren.value = false
}

onMounted(() => {
  if (props.page.children === undefined) {
    loadChildren()
  }
})
</script>

<template>
  <li class="page-item" :data-focus-key="`p-${page.id}`">
    <div class="page-row" :style="{ paddingLeft: `${depth * 1.1}rem` }">
      <span class="page-title">
        <span class="level-badge" :class="`level-${depth}`">{{ levelLabel }}</span>
        {{ page.title }}
      </span>
      <span class="page-actions">
        <span v-if="loadingChildren" class="loading-hint">Memuat...</span>
        <button class="btn-link" @click="emit('add-child', cat, page)">+ Sub Halaman</button>
        <button class="btn-link" @click="emit('edit', cat, page)">Edit</button>
        <button class="btn-link danger" @click="emit('remove', page)">Hapus</button>
      </span>
    </div>
    <ul v-if="page.children?.length" class="child-list">
      <AdminPageTreeItem
        v-for="child in page.children"
        :key="child.id"
        :cat="cat"
        :page="child"
        :depth="depth + 1"
        @add-child="(...args) => emit('add-child', ...args)"
        @edit="(...args) => emit('edit', ...args)"
        @remove="(...args) => emit('remove', ...args)"
      />
    </ul>
  </li>
</template>

<style scoped>
.page-item { border-top: 1px dashed var(--color-border); }
.page-row {
  display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; padding: 0.4rem 0.5rem;
  border-radius: 10px; transition: background 0.15s ease;
}
.page-row:hover { background: var(--color-accent-soft); }
.page-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; }
.page-actions { flex-shrink: 0; }
.btn-link { background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: 0.78rem; font-weight: 600; padding: 0; margin-left: 0.85rem; }
.btn-link:hover { text-decoration: underline; }
.btn-link.danger { color: #ef4444; }
.loading-hint { color: var(--color-ink-soft); font-size: 0.8rem; margin-left: 0.75rem; }
.child-list { list-style: none; margin: 0; padding: 0; border-left: 1px dashed var(--color-accent-border); margin-left: 0.6rem; }

.level-badge {
  flex-shrink: 0;
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  padding: 0.05rem 0;
  margin-right: 0.6rem;
  color: var(--color-ink-soft);
  white-space: nowrap;
}
.level-badge::after { content: '·'; margin-left: 0.6rem; color: var(--color-ink-soft); opacity: 0.6; }
.level-1 { color: #0ea5e9; }
.level-2 { color: #10b981; }
.level-3 { color: #f59e0b; }
</style>
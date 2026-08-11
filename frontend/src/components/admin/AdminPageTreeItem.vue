<script setup>
// Renders one page row + recursively renders its children, so the admin
// tree can go as deep as the data actually goes (matching the public
// site, which already supports arbitrary-depth pages via the router's
// `:slugs+` pattern and docsStore.fetchPageByPath).
defineProps({
  cat: { type: Object, required: true },
  page: { type: Object, required: true },
  depth: { type: Number, default: 0 }
})

const emit = defineEmits(['add-child', 'edit', 'remove'])
</script>

<template>
  <li class="page-item">
    <div class="page-row" :style="{ paddingLeft: `${depth * 1.1}rem` }">
      <span class="page-title">{{ page.title }}</span>
      <span class="page-actions">
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
.page-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; padding: 0.4rem 0; }
.page-title { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.page-actions { flex-shrink: 0; }
.btn-link { background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: 0.8rem; padding: 0; margin-left: 0.75rem; }
.btn-link.danger { color: #d33; }
.child-list { list-style: none; margin: 0; padding: 0; }
</style>

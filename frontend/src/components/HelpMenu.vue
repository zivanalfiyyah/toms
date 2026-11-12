<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { helpLinks } from '../data/helpLinks'
import { icons } from '../icons'

defineProps({ active: { type: Boolean, default: false } })

const route = useRoute()
const open = ref(false)
const root = ref(null)

function onDocClick(e) {
  if (root.value && !root.value.contains(e.target)) open.value = false
}
function onKey(e) {
  if (e.key === 'Escape') open.value = false
}
onMounted(() => {
  document.addEventListener('mousedown', onDocClick)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onDocClick)
  document.removeEventListener('keydown', onKey)
})
watch(() => route.fullPath, () => { open.value = false })
</script>

<template>
  <div ref="root" class="nav-drop">
    <button
      class="nav-link nav-trigger"
      :class="{ active, open }"
      aria-haspopup="menu"
      :aria-expanded="open"
      @click="open = !open"
    >
      Bantuan
      <span class="caret" v-html="icons.caret"></span>
    </button>

    <div v-if="open" class="menu" role="menu">
      <router-link v-for="h in helpLinks" :key="h.to" :to="h.to" class="menu-item" role="menuitem">
        <b>{{ h.label }}</b>
        <small>{{ h.desc }}</small>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.nav-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--color-ink-soft);
  font-size: 12px;
  font-weight: 700;
  transition: 0.18s ease;
}
.nav-link:hover { color: var(--color-accent); background: var(--color-bg); text-decoration: none; }
.nav-link.active { color: var(--color-accent); background: var(--color-accent-soft); }
.nav-link.active::after {
  content: ''; position: absolute; left: 12px; right: 12px; bottom: 2px;
  height: 2px; border-radius: 5px; background: var(--color-accent-strong);
}
.nav-drop { position: relative; display: inline-flex; align-items: center; height: 100%; }
.nav-trigger { border: 0; background: none; cursor: pointer; font-family: inherit; gap: 5px; }
.caret { width: 13px; height: 13px; display: inline-block; transition: transform 0.18s ease; }
.caret :deep(svg) { width: 100%; height: 100%; }
.nav-trigger.open .caret { transform: rotate(180deg); }
.nav-trigger.open { color: var(--color-accent); background: var(--color-bg); }

.menu {
  position: absolute; top: calc(100% - 6px); left: 0; z-index: 60;
  width: 290px; padding: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 16px 36px rgba(28, 58, 84, 0.15);
}
.menu-item { display: block; padding: 10px 12px; border-radius: 9px; color: var(--color-ink); }
.menu-item b { display: block; font-size: 12px; font-weight: 800; }
.menu-item small { display: block; margin-top: 2px; font-size: 10.5px; color: var(--color-ink-soft); line-height: 1.45; }
.menu-item:hover { background: var(--color-accent-soft); text-decoration: none; }
.menu-item.router-link-exact-active b { color: var(--color-accent); }
</style>

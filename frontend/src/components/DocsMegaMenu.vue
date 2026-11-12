<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import { megaGroups } from '../data/megaMenu'
import { icons } from '../icons'

defineProps({ active: { type: Boolean, default: false } })

const route = useRoute()
const open = ref(false)
const current = ref(0)
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
      Dokumentasi
      <span class="caret" v-html="icons.caret"></span>
    </button>

    <div v-if="open" class="mega" role="menu">
      <div class="mega-groups">
        <button
          v-for="(g, i) in megaGroups"
          :key="g.title"
          class="mega-gbtn"
          :class="{ on: current === i }"
          @mouseenter="current = i"
          @focus="current = i"
          @click="current = i"
        >
          <i>{{ String(i + 1).padStart(2, '0') }}</i>
          <span><b>{{ g.title }}</b><small>{{ g.desc }}</small></span>
        </button>
        <router-link to="/daftar-isi" class="mega-all">Buka Daftar Isi lengkap →</router-link>
      </div>
      <div class="mega-items">
        <div class="mega-head">
          <b>{{ megaGroups[current].title }}</b>
          <small>{{ megaGroups[current].items.length }} halaman</small>
        </div>
        <router-link
          v-for="it in megaGroups[current].items"
          :key="it.to"
          :to="it.to"
          class="mega-item"
          role="menuitem"
        >{{ it.label }}</router-link>
      </div>
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

.mega {
  position: absolute; top: calc(100% - 6px); left: -80px; z-index: 60;
  width: min(820px, 92vw);
  display: grid; grid-template-columns: 300px 1fr;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: 0 18px 40px rgba(28, 58, 84, 0.16);
  overflow: hidden;
}
.mega-groups { background: var(--well-bg); border-right: 1px solid var(--color-border); padding: 8px; max-height: 70vh; overflow: auto; }
.mega-gbtn {
  display: flex; gap: 10px; align-items: flex-start; width: 100%;
  padding: 9px 10px; border: 0; border-radius: 9px; background: none;
  text-align: left; cursor: pointer; font-family: inherit; color: var(--color-ink);
}
.mega-gbtn i { font-style: normal; font-size: 10px; font-weight: 900; color: var(--color-accent); padding-top: 2px; }
.mega-gbtn b { display: block; font-size: 12px; font-weight: 800; }
.mega-gbtn small { display: block; margin-top: 2px; font-size: 10px; line-height: 1.45; color: var(--color-ink-soft); }
.mega-gbtn.on, .mega-gbtn:hover { background: var(--color-accent-soft); }
.mega-all { display: block; margin: 8px 6px 4px; padding: 8px; font-size: 11px; font-weight: 800; color: var(--color-accent); border-top: 1px solid var(--color-border); }
.mega-all:hover { text-decoration: none; }

.mega-items { padding: 12px 14px; max-height: 70vh; overflow: auto; }
.mega-head { display: flex; justify-content: space-between; align-items: baseline; padding: 2px 6px 10px; border-bottom: 1px solid var(--color-border); margin-bottom: 6px; }
.mega-head b { font-size: 13px; color: var(--color-ink); }
.mega-head small { font-size: 10px; color: var(--color-ink-soft); }
.mega-item { display: block; padding: 8px 8px; border-radius: 8px; font-size: 12px; font-weight: 600; color: var(--color-ink-soft); }
.mega-item:hover { background: var(--color-bg); color: var(--color-accent); text-decoration: none; }
</style>

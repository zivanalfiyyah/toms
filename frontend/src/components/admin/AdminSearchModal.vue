<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useAdminSearchStore } from '../../stores/adminSearch'
import { useTocStore } from '../../stores/toc'
import { icons } from '../../icons'
import { buildAdminIndex, searchAdminIndex, menuShortcuts } from '../../utils/adminSearchIndex'
import { highlightParts } from '../../utils/searchIndex'

const props = defineProps({
  menu: { type: Array, default: () => [] } // menu admin yang boleh dilihat user ini
})
const emit = defineEmits(['close'])

const auth = useAuthStore()
const store = useAdminSearchStore()
const toc = useTocStore()
const router = useRouter()

const query = ref('')
const inputEl = ref(null)
const listEl = ref(null)
const selected = ref(0)

const isAdmin = computed(() => auth.roleNames.includes('admin'))

onMounted(() => {
  inputEl.value?.focus()
  store.load({ isAdmin: isAdmin.value })
})

function reload() {
  store.load({ isAdmin: isAdmin.value, force: true })
}

const index = computed(() =>
  buildAdminIndex({ menu: props.menu, users: store.users, requests: store.requests, tree: toc.tree })
)

const groups = computed(() =>
  query.value.trim() ? searchAdminIndex(index.value, query.value) : menuShortcuts(index.value)
)

// Beri nomor urut global tiap hasil supaya navigasi keyboard lintas kelompok.
const sections = computed(() => {
  let n = 0
  return groups.value.map((g) => ({ ...g, rows: g.items.map((item) => ({ item, idx: n++ })) }))
})
const flat = computed(() => sections.value.flatMap((s) => s.rows.map((r) => r.item)))

const hl = (text) => highlightParts(text, query.value)

watch(query, () => { selected.value = 0 })

function go(item) {
  router.push(item.to)
  emit('close')
}

function onEnter() {
  const target = flat.value[selected.value]
  if (target) go(target)
}
function onArrowDown() {
  if (selected.value < flat.value.length - 1) selected.value++
}
function onArrowUp() {
  if (selected.value > 0) selected.value--
}

watch(selected, async () => {
  await nextTick()
  listEl.value?.querySelector('.item.active')?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <Teleport to="body">
    <div class="overlay" @click.self="$emit('close')">
      <div class="box" role="dialog" aria-label="Cari di panel admin">
        <div class="box-header">
          <span v-html="icons.search" class="icon"></span>
          <input
            ref="inputEl"
            v-model="query"
            type="text"
            placeholder="Cari menu, pengguna, permintaan akses, kategori, halaman..."
            @keydown.enter="onEnter"
            @keydown.down.prevent="onArrowDown"
            @keydown.up.prevent="onArrowUp"
            @keydown.esc="$emit('close')"
          />
        </div>

        <div v-if="sections.length" ref="listEl" class="results">
          <section v-for="s in sections" :key="s.label">
            <p class="group">
              {{ s.label }}
              <span v-if="s.total > s.items.length" class="more">{{ s.items.length }} dari {{ s.total }}</span>
            </p>
            <ul>
              <li v-for="row in s.rows" :key="row.item.key">
                <div class="item" :class="{ active: selected === row.idx }" @mouseenter="selected = row.idx">
                  <router-link :to="row.item.to" class="item-main" @click="$emit('close')">
                    <p class="title">
                      <template v-for="(p, i) in hl(row.item.title)" :key="i">
                        <mark v-if="p.hit">{{ p.text }}</mark>
                        <template v-else>{{ p.text }}</template>
                      </template>
                    </p>
                    <p v-if="row.item.subtitle" class="sub">
                      <template v-for="(p, i) in hl(row.item.subtitle)" :key="i">
                        <mark v-if="p.hit">{{ p.text }}</mark>
                        <template v-else>{{ p.text }}</template>
                      </template>
                    </p>
                  </router-link>
                  <span v-if="row.item.badge" class="badge">{{ row.item.badge }}</span>
                </div>
              </li>
            </ul>
          </section>
        </div>

        <p v-else-if="query.trim() && store.loading && !store.categories.length" class="empty">Memuat data pencarian…</p>
        <p v-else-if="query.trim()" class="empty">Tidak ada hasil untuk "<strong>{{ query }}</strong>".</p>

        <div class="footer">
          <span v-if="toc.pending > 0">Memuat halaman level dalam… hasil bisa bertambah.</span>
          <span v-else-if="store.failed.length" class="warn">Gagal memuat: {{ store.failed.join(', ') }}.</span>
          <span v-else>↑↓ pilih · Enter buka · Esc tutup</span>
          <button type="button" class="reload" :disabled="store.loading" @click="reload">Muat ulang data</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(2, 6, 23, 0.5);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: flex-start; justify-content: center; padding: 12vh 1rem 1rem;
}
.box {
  width: 100%; max-width: 640px; display: flex; flex-direction: column; max-height: 76vh;
  background: var(--color-surface); border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl); box-shadow: 0 24px 60px -20px rgba(15, 23, 42, 0.45), var(--shadow-a);
  overflow: hidden;
}
[data-theme='dark'] .box { border-color: var(--color-accent-border); }

.box-header { display: flex; align-items: center; gap: 0.7rem; padding: 0.9rem 1.1rem; border-bottom: 1px solid var(--color-border); }
.icon { width: 18px; height: 18px; flex-shrink: 0; color: var(--color-accent); }
.icon :deep(svg) { width: 100%; height: 100%; }
.box-header input {
  flex: 1; min-width: 0; border: none; outline: none; background: transparent;
  color: var(--color-ink); font-size: 0.95rem; font-family: inherit;
}

.results { overflow-y: auto; padding: 0.4rem 0.5rem 0.6rem; }
.group {
  display: flex; align-items: center; justify-content: space-between;
  margin: 0.6rem 0.6rem 0.25rem; font-size: 0.68rem; font-weight: 800;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-soft);
}
.more { font-weight: 500; letter-spacing: 0; text-transform: none; }
ul { list-style: none; margin: 0; padding: 0; }

.item {
  display: flex; align-items: center; gap: 0.6rem; padding: 0.45rem 0.6rem; border-radius: var(--radius);
  border: 1px solid transparent; transition: background 0.12s ease;
}
.item.active { background: var(--color-accent-soft); border-color: var(--color-accent-border); }
.item-main { flex: 1; min-width: 0; color: var(--color-ink); }
.item-main:hover { text-decoration: none; }
.title { margin: 0; font-size: 0.88rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sub { margin: 0.1rem 0 0; font-size: 0.72rem; color: var(--color-ink-soft); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
mark { background: rgba(14, 165, 233, 0.22); color: inherit; border-radius: 3px; padding: 0 1px; }

.badge {
  flex-shrink: 0; font-size: 0.68rem; font-weight: 700; padding: 0.1rem 0.55rem; border-radius: 999px;
  color: var(--color-accent); background: var(--color-accent-soft); border: 1px solid var(--color-accent-border);
}

.empty { margin: 0; padding: 1.5rem 1.2rem; text-align: center; font-size: 0.85rem; color: var(--color-ink-soft); }

.footer {
  display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
  padding: 0.55rem 1rem; border-top: 1px solid var(--color-border);
  font-size: 0.72rem; color: var(--color-ink-soft); background: var(--well-bg);
}
.footer .warn { color: #d97706; }
.reload { background: none; border: none; padding: 0; cursor: pointer; font: inherit; font-weight: 600; color: var(--color-accent); }
.reload:hover:not(:disabled) { text-decoration: underline; }
.reload:disabled { opacity: 0.5; cursor: default; }
</style>

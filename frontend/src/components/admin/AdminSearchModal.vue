<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useAdminSearchStore } from '../../stores/adminSearch'
import { useTocStore } from '../../stores/toc'
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
  buildAdminIndex({ menu: props.menu, users: store.users, tree: toc.tree })
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
  listEl.value?.querySelector('.ob-row.active')?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
  <Teleport to="body">
    <div class="ob-overlay" @click.self="$emit('close')">
      <div class="ob-box" role="dialog" aria-label="Cari di panel admin">
        <div class="ob-input">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg>
          <input ref="inputEl" v-model="query" type="text" placeholder="Cari menu, pengguna, kategori, halaman..." autocomplete="off" @keydown.enter="onEnter" @keydown.down.prevent="onArrowDown" @keydown.up.prevent="onArrowUp" @keydown.esc="$emit('close')" />
          <button v-if="query" type="button" class="ob-clear" aria-label="Hapus" @click="query = ''; inputEl?.focus()">&times;</button>
        </div>

        <div v-if="sections.length" ref="listEl" class="ob-list">
          <section v-for="s in sections" :key="s.label">
            <p class="ob-group">{{ s.label }}<template v-if="s.total > s.items.length"> · {{ s.items.length }} dari {{ s.total }}</template></p>
            <router-link v-for="row in s.rows" :key="row.item.key" :to="row.item.to" class="ob-row" :class="{ active: selected === row.idx }" @mouseenter="selected = row.idx" @click="$emit('close')">
              <span class="ob-ico"><svg  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path></svg></span>
              <span class="ob-text">
                <template v-for="(p, i) in hl(row.item.title)" :key="i"><span v-if="p.hit">{{ p.text }}</span><b v-else>{{ p.text }}</b></template>
              </span>
              <span v-if="row.item.subtitle || row.item.meta" class="ob-meta">{{ row.item.subtitle || row.item.meta }}</span>
              <span v-if="row.item.badge" class="ob-badge">{{ row.item.badge }}</span>
            </router-link>
          </section>
        </div>

        <p v-else-if="query.trim() && store.loading && !store.categories.length" class="ob-empty">Memuat data pencarian…</p>
        <p v-else-if="query.trim()" class="ob-empty">Tidak ada hasil untuk "<strong>{{ query }}</strong>".</p>

        <div class="ob-foot">
          <span v-if="toc.pending > 0">Memuat halaman level dalam… hasil bisa bertambah.</span>
          <span v-else-if="store.failed.length" class="warn">Gagal memuat: {{ store.failed.join(', ') }}.</span>
          <span v-else>↑↓ pilih · Enter buka · Esc tutup</span>
          <button type="button" :disabled="store.loading" @click="reload">Muat ulang data</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

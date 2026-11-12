import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { useTocStore } from '../stores/toc'
import { buildIndex, searchIndex } from './searchIndex'

const RECENT_KEY = 'toms-recent-search'

function loadRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch (e) { return [] }
}

// Logika pencarian bersama (kotak di navbar & kotak di hero): kueri, hasil, riwayat, navigasi keyboard.
export function useSiteSearch(onPicked) {
  const router = useRouter()
  const docsStore = useDocsStore()
  const toc = useTocStore()

  const query = ref('')
  const selected = ref(0)
  const listEl = ref(null)
  const recent = ref(loadRecent())

  const index = computed(() => buildIndex(toc.tree))
  const results = computed(() => searchIndex(index.value, query.value))
  const rows = computed(() => (query.value.trim()
    ? results.value.map((r) => ({ kind: 'result', r }))
    : recent.value.map((t) => ({ kind: 'recent', t }))))

  async function ensureData() {
    if (!docsStore.categories.length) await docsStore.fetchCategories()
    toc.load(docsStore.categories, { ttl: 5 * 60 * 1000 })
  }

  function saveRecent(q) {
    const t = String(q || '').trim()
    if (!t) return
    recent.value = [t, ...recent.value.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6)
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.value)) } catch (e) { /* abaikan */ }
  }
  function removeRecent(t) {
    recent.value = recent.value.filter((x) => x !== t)
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(recent.value)) } catch (e) { /* abaikan */ }
  }
  function pick(r) {
    saveRecent(query.value)
    router.push(`/docs/${r.path}`)
    onPicked?.()
  }
  function activate(row) {
    if (!row) return
    if (row.kind === 'recent') { query.value = row.t; selected.value = 0 } else pick(row.r)
  }
  const enter = () => activate(rows.value[selected.value] || rows.value[0])
  const down = () => { if (selected.value < rows.value.length - 1) selected.value++ }
  const up = () => { if (selected.value > 0) selected.value-- }

  watch(query, () => { selected.value = 0 })
  watch(selected, async () => {
    await nextTick()
    listEl.value?.querySelector('.ob-row.active')?.scrollIntoView({ block: 'nearest' })
  })

  return { query, selected, listEl, recent, rows, toc, ensureData, removeRecent, activate, enter, down, up }
}

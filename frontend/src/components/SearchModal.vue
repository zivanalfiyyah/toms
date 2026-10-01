<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { useTocStore } from '../stores/toc'
import { icons } from '../icons'
import { buildIndex, searchIndex, highlightParts } from '../utils/searchIndex'

const emit = defineEmits(['close'])
const docsStore = useDocsStore()
const toc = useTocStore()
const router = useRouter()

const query = ref('')
const inputEl = ref(null)
const listEl = ref(null)
const selectedIndex = ref(0)

onMounted(async () => {
    inputEl.value?.focus()
    if (!docsStore.categories.length) await docsStore.fetchCategories()
    // Muat seluruh level halaman (tak terbatas) di belakang layar; hasil
    // pencarian ikut bertambah saat level yang lebih dalam selesai dimuat.
    toc.load(docsStore.categories, { ttl: 5 * 60 * 1000 })
})

// Kategori + semua halaman di semua level, diratakan untuk pencarian judul.
const index = computed(() => buildIndex(toc.tree))
const results = computed(() => searchIndex(index.value, query.value))

function onInput() {
    selectedIndex.value = 0
}

function onEnter() {
    if (results.value.length > 0) {
        const target = results.value[selectedIndex.value] || results.value[0]
        if (target) {
            router.push(`/docs/${target.path}`)
            emit('close')
        }
    }
}

function onArrowDown() {
    if (selectedIndex.value < results.value.length - 1) {
        selectedIndex.value++
    }
}

function onArrowUp() {
    if (selectedIndex.value > 0) {
        selectedIndex.value--
    }
}

// Pastikan hasil yang dipilih lewat panah selalu terlihat di dalam daftar.
watch(selectedIndex, async () => {
    await nextTick()
    listEl.value?.querySelector('a.active')?.scrollIntoView({ block: 'nearest' })
})
</script>

<template>
    <div class="overlay" @click.self="$emit('close')">
        <div class="box">
            <div class="box-header">
                <span v-html="icons.search" class="icon"></span>
                <input
                    ref="inputEl"
                    v-model="query"
                    type="text"
                    placeholder="Cari judul kategori atau halaman..."
                    @input="onInput"
                    @keydown.enter="onEnter"
                    @keydown.down.prevent="onArrowDown"
                    @keydown.up.prevent="onArrowUp"
                    @keydown.esc="$emit('close')"
                />
            </div>

            <ul v-if="results.length" ref="listEl">
                <li v-for="(r, index) in results" :key="r.key">
                    <router-link
                        :to="`/docs/${r.path}`"
                        :class="{ active: selectedIndex === index }"
                        @mouseenter="selectedIndex = index"
                        @click="$emit('close')"
                    >
                        <p class="title">
                            <template v-for="(part, i) in highlightParts(r.title, query)" :key="i">
                                <mark v-if="part.hit">{{ part.text }}</mark>
                                <template v-else>{{ part.text }}</template>
                            </template>
                        </p>
                        <p class="meta">
                            <span class="type">{{ r.type }}</span>
                            <span v-if="r.trail" class="trail">{{ r.trail }}</span>
                        </p>
                    </router-link>
                </li>
            </ul>

            <p v-else-if="query.trim() && !toc.tree.length" class="empty">Memuat data pencarian…</p>

            <p v-else-if="query.trim()" class="empty">
                Tidak ada hasil untuk "<strong>{{ query }}</strong>".
            </p>

            <div v-else class="initial-hint">
                Ketik kata kunci untuk mulai mencari...
            </div>

            <p v-if="query.trim() && toc.tree.length && toc.pending > 0" class="loading-note">
                Masih memuat level yang lebih dalam… hasil bisa bertambah.
            </p>
        </div>
    </div>
</template>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(11, 13, 18, 0.55);
  display: flex; justify-content: center;
  align-items: flex-start;
  padding-top: 10vh; z-index: 50;
  backdrop-filter: blur(4px);
}
.box {
  width: 520px; max-width: 90vw;
  height: auto;
  background: var(--color-surface);
  border-radius: 12px;
  box-shadow: 0 24px 60px rgba(0,0,0,0.3);
  overflow: hidden;
  border: 1px solid var(--color-border);
}
[data-theme='dark'] .box {
  border-color: var(--color-accent-border);
  box-shadow: 0 0 60px -10px rgba(56, 189, 248, 0.4), 0 24px 60px rgba(0, 0, 0, 0.5);
}
.box-header {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0 1rem;
  border-bottom: 1px solid var(--color-border);
}
.box-header .icon { width: 18px; height: 18px; color: var(--color-ink-soft); }
.box-header .icon :deep(svg) { width: 100%; height: 100%; }
.box input {
  flex: 1; border: none; padding: 0.8rem 0;
  font-size: 1rem; font-family: var(--font-body);
  outline: none; background: transparent; color: var(--color-ink);
}
.box ul { list-style: none; margin: 0; padding: 0.4rem; max-height: 50vh; overflow-y: auto; }
.box a { display: block; padding: 0.5rem 0.75rem; border-radius: var(--radius); color: inherit; }

.box a:hover, .box a.active { 
  background: var(--color-accent-soft); 
  text-decoration: none; 
}

.title { font-weight: 600; margin: 0; font-size: 0.88rem; }

.meta { display: flex; align-items: center; gap: 0.5rem; margin: 0.2rem 0 0; font-size: 0.72rem; min-width: 0; }
.type {
  flex-shrink: 0; padding: 0.05rem 0.5rem; border-radius: 999px; font-weight: 600;
  color: var(--color-accent); background: var(--color-accent-soft); border: 1px solid var(--color-accent-border);
}
.trail { flex: 1; min-width: 0; color: var(--color-ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.title mark { background: rgba(14, 165, 233, 0.22); color: inherit; border-radius: 3px; padding: 0 1px; }
.loading-note { margin: 0; padding: 0.5rem 1rem; font-size: 0.75rem; color: var(--color-ink-soft); border-top: 1px solid var(--color-border); text-align: center; }

.empty { padding: 1rem; color: var(--color-ink-soft); margin: 0; text-align: center; font-size: 0.875rem; }
.initial-hint {
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  opacity: 0.7;
}
</style>
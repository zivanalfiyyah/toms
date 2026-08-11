<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDocsStore } from '../stores/docs'
import { icons } from '../icons'

const emit = defineEmits(['close'])
const docsStore = useDocsStore()
const router = useRouter()

const query = ref('')
const inputEl = ref(null)
const selectedIndex = ref(0)

onMounted(() => inputEl.value?.focus())

function onInput() {
    selectedIndex.value = 0
    docsStore.search(query.value)
}

function getPath(r) {
    if (r.path) return r.path;

    // flatPages (sumber docsStore.searchResults) mengirim categorySlug +
    // fullPath (rangkaian slug lengkap dari root sampai halaman ini).
    // Field pageSlug/parent di bawah tidak pernah dikirim oleh docs.js —
    // sebelumnya bikin link ke halaman bertingkat (subbab dari subbab) salah.
    if (r.categorySlug && r.fullPath) return `${r.categorySlug}/${r.fullPath}`;

    const category = r.categorySlug || r.category?.slug || '';
    const parent = r.pageSlug || r.parent?.slug || '';
    const slug = r.slug || '';

    if (category && parent && slug) return `${category}/${parent}/${slug}`;
    if (category && slug) return `${category}/${slug}`;
    if (parent && slug) return `${parent}/${slug}`;
    return slug;
}

function onEnter() {
    if (docsStore.searchResults.length > 0) {
        const target = docsStore.searchResults[selectedIndex.value] || docsStore.searchResults[0];
        if (target) {
            router.push(`/docs/${getPath(target)}`);
            emit('close');
        }
    }
}

function onArrowDown() {
    if (selectedIndex.value < docsStore.searchResults.length - 1) {
        selectedIndex.value++;
    }
}

function onArrowUp() {
    if (selectedIndex.value > 0) {
        selectedIndex.value--;
    }
}

function formatSnippet(text) {
    if (!text) return '';
    const clean = text
        .replace(/<[^>]*>?/gm, '') 
        .replace(/\s+/g, ' ')      
        .trim();
    return clean.length > 60 ? clean.substring(0, 60) + '...' : clean;
}
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
                    placeholder="Cari judul atau isi..."
                    @input="onInput"
                    @keydown.enter="onEnter"
                    @keydown.down.prevent="onArrowDown"
                    @keydown.up.prevent="onArrowUp"
                    @keydown.esc="$emit('close')"
                />
            </div>

            <ul v-if="docsStore.searchResults.length">
                <li v-for="(r, index) in docsStore.searchResults" :key="r.id || index">
                    <router-link 
                        :to="`/docs/${getPath(r)}`" 
                        :class="{ active: selectedIndex === index }"
                        @mouseenter="selectedIndex = index"
                        @click="$emit('close')"
                    >
                        <p class="title">{{ r.title }}</p>
                        <p class="snippet">{{ formatSnippet(r.snippet || r.content_text) }}</p>
                    </router-link>
                </li>
            </ul>

            <p v-else-if="query.trim()" class="empty">
                Tidak ada hasil untuk "<strong>{{ query }}</strong>".
            </p>

            <div v-else class="initial-hint">
                Ketik kata kunci untuk mulai mencari...
            </div>
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

.snippet { 
  margin: 0.1rem 0 0; 
  font-size: 0.78rem; 
  color: var(--color-ink-soft); 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis;
}

.empty { padding: 1rem; color: var(--color-ink-soft); margin: 0; text-align: center; font-size: 0.875rem; }
.initial-hint {
  padding: 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  opacity: 0.7;
}
</style>
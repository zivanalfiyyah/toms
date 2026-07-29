<script setup>
import { ref, onMounted } from 'vue'
import { useDocsStore } from '../stores/docs'
import { icons } from '../icons'

defineEmits(['close'])
const docsStore = useDocsStore()
const query = ref('')
const inputEl = ref(null)

onMounted(() => inputEl.value?.focus())

function onInput() {
    docsStore.search(query.value)
}
</script>


<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(11, 13, 18, 0.55);
  display: flex; justify-content: center;
  align-items: flex-start; /* <-- Biar modal nempel ringkas di atas */
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
  flex: 1; border: none; padding: 0.9rem 0;
  font-size: 1rem; font-family: var(--font-body);
  outline: none; background: transparent; color: var(--color-ink);
}
.box ul { list-style: none; margin: 0; padding: 0.5rem; max-height: 50vh; overflow-y: auto; }
.box a { display: block; padding: 0.6rem 0.75rem; border-radius: var(--radius); color: inherit; }
.box a:hover { background: var(--color-accent-soft); text-decoration: none; }
.title { font-weight: 600; margin: 0; font-size: 0.9rem; }
.snippet { margin: 0.15rem 0 0; font-size: 0.8rem; color: var(--color-ink-soft); }
.empty { padding: 1rem; color: var(--color-ink-soft); margin: 0; text-align: center; font-size: 0.875rem; }

/* Kunci utama agar saat baru dibuka modalnya pendek & rapi */
.initial-hint {
  padding: 1.25rem 1rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  opacity: 0.7;
}
</style>


<template>
    <div class="overlay" @click.self="$emit('close')">
        <div class="box">
            <div class="box-header">
                <span v-html="icons.search" class="icon"></span>
                <input
                    ref="inputEl"
                    v-model="query"
                    type="text"
                    placeholder="Cari judul atau isi dokumentasi..."
                    @input="onInput"
                    @keydown.esc="$emit('close')"
                />
            </div>

            <!-- State 1: Ada Hasil -->
            <ul v-if="docsStore.searchResults.length">
                <li v-for="r in docsStore.searchResults" :key="r.path">
                    <router-link :to="`/docs/${r.path}`" @click="$emit('close')">
                        <p class="title">{{ r.title }}</p>
                        <p class="snippet">{{ r.snippet }}</p>
                    </router-link>
                </li>
            </ul>

            <!-- State 2: Cari tapi Tidak Ketemu -->
            <p v-else-if="query.trim()" class="empty">
                Tidak ada hasil untuk "<strong>{{ query }}</strong>".
            </p>

            <!-- State 3: Belum Mengetik (Biar kotak modalnya ringkas & gak panjang melar) -->
            <div v-else class="initial-hint">
                Ketik kata kunci untuk mulai mencari dokumentasi
            </div>
        </div>
    </div>
</template>

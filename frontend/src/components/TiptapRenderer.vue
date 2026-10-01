<script setup>
import { computed, watch } from 'vue'
import { extractHeadings } from '../utils/headings'

const props = defineProps({
  content: { 
    type: [Object, String, null], 
    required: false,            
    default: ''                 
  }
})

// Emit daftar heading (H1-H6) yang berhasil diparsing dari konten, supaya
// komponen TOC ("Pada halaman ini") di parent bisa dibangun dari sumber
// yang PERSIS SAMA dengan yang dirender di sini — id-nya dijamin cocok.
const emit = defineEmits(['headings'])

function sanitizeNode(node) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return null
  if (typeof node.type !== 'string') return null

  const clean = { ...node }

  if (clean.type === 'text') {
    if (typeof clean.text !== 'string' || clean.text.length === 0) return null
    return clean
  }

  if (Array.isArray(clean.content)) {
    clean.content = clean.content.map(sanitizeNode).filter(Boolean)
  }

  if (Array.isArray(clean.marks)) {
    clean.marks = clean.marks.filter(m => m && typeof m.type === 'string')
  }

  return clean
}

function renderBlocksSafely(jsonContent) {
  const parts = []
  for (const block of jsonContent.content) {
    try {
      const wrapped = { type: 'doc', content: [block] }
      parts.push(generateHTML(wrapped, extensions))
    } catch (e) {
      console.error('🔥 Melewati satu blok konten karena gagal di-render:', e, block)
      parts.push('<p style="color:#d33;"><em>[Satu bagian konten di halaman ini rusak dan dilewati. Silakan buka halaman ini di mode Ubah lalu simpan ulang untuk memperbaikinya.]</em></p>')
    }
  }
  return parts.join('')
}

const parsed = computed(() => {
  try {
    let raw = props.content

    if (typeof raw === 'object' || (typeof raw === 'string' && raw.trim().startsWith('{'))) {
      return {
        html: '<p style="color:red; background:#ffebeb; padding:10px; border-radius:6px;"><b>⚠️ STOP!</b> Data yang dikirim ke komponen ini masih JSON. Tolong buka file halaman utamanya (Parent), dan ubah kodingannya jadi: <br><code>&lt;TiptapRenderer :content="namavariabel.content_html" /&gt;</code></p>',
        headings: [],
      }
    }

    if (!raw || raw.trim() === '') {
      return { html: '<p><em>Tidak ada konten.</em></p>', headings: [] }
    }

    return extractHeadings(raw)
  } catch (e) {
    console.error('🔥 ERROR RENDER TIPTAP:', e)
    return { html: `<p style="color:red;">[Error Render]: ${e.message}</p>`, headings: [] }
  }
})

const html = computed(() => parsed.value.html)

// Beritahu parent setiap kali daftar heading berubah (ganti halaman,
// konten baru disimpan, dsb).
watch(
  () => parsed.value.headings,
  (headings) => emit('headings', headings),
  { immediate: true }
)
</script>

<template>
  <div class="tiptap-content" v-html="html"></div>
</template>

<style scoped>

.tiptap-content :deep(h1),
.tiptap-content :deep(h2),
.tiptap-content :deep(h3),
.tiptap-content :deep(h4),
.tiptap-content :deep(h5),
.tiptap-content :deep(h6) {
  scroll-margin-top: 5.5rem;
}
/* Desktop: judul tujuan scroll berada di dalam kartu, jadi tidak perlu jarak setinggi navbar. */
@media (min-width: 861px) {
  .tiptap-content :deep(h1),
  .tiptap-content :deep(h2),
  .tiptap-content :deep(h3),
  .tiptap-content :deep(h4),
  .tiptap-content :deep(h5),
  .tiptap-content :deep(h6) {
    scroll-margin-top: 1rem;
  }
}
.tiptap-content :deep(h2) { font-size: 1.4rem; margin-top: 2rem; }
.tiptap-content :deep(h3) { font-size: 1.15rem; margin-top: 1.5rem; }
.tiptap-content :deep(p) { line-height: 1.7; margin: 0.9rem 0; color: var(--color-ink); }

.tiptap-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background-color: transparent;
}

.tiptap-content :deep(th),
.tiptap-content :deep(td) {
  border: 1px solid var(--color-border);
  padding: 10px 14px; 
  text-align: left;
  vertical-align: top;
  color: var(--color-ink);
}

.tiptap-content :deep(th) {
  background-color: rgba(128, 128, 128, 0.15);
  font-weight: bold;
}

.tiptap-content :deep(tbody tr:nth-child(even)) {
  background-color: rgba(128, 128, 128, 0.04);
}

.tiptap-content :deep(tbody tr:hover) {
  background-color: rgba(128, 128, 128, 0.08);
}

.tiptap-content :deep(img) {
  max-width: 500px !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
  margin: 1.5rem auto !important;
  object-fit: contain !important;
  border-radius: 0 !important;
}
</style>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: { type: [Object, String], required: true }
})

function slugify(text) {
  if (!text) return ''
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const html = computed(() => {
  try {
    let raw = props.content

    if (typeof raw === 'object' || (typeof raw === 'string' && raw.trim().startsWith('{'))) {
      return '<p style="color:red; background:#ffebeb; padding:10px; border-radius:6px;"><b>⚠️ STOP!</b> Data yang dikirim ke komponen ini masih JSON. Tolong buka file halaman utamanya (Parent), dan ubah kodingannya jadi: <br><code>&lt;TiptapRenderer :content="namavariabel.content_html" /&gt;</code></p>'
    }

    if (!raw || raw.trim() === '') {
      return '<p><em>Tidak ada konten.</em></p>'
    }

    raw = raw.replace(/<h([1-6])>(.*?)<\/h\1>/g, (m, level, text) => {
      return `<h${level} id="${slugify(text)}">${text}</h${level}>`
    })

    return raw
  } catch (e) {
    console.error('🔥 ERROR RENDER TIPTAP:', e)
    return `<p style="color:red;">[Error Render]: ${e.message}</p>`
  }
})
</script>

<template>
  <div class="tiptap-content" v-html="html"></div>
</template>

<style scoped>
.tiptap-content :deep(h2) { font-size: 1.4rem; margin-top: 2rem; }
.tiptap-content :deep(h3) { font-size: 1.15rem; margin-top: 1.5rem; }
.tiptap-content :deep(p) { line-height: 1.7; margin: 0.9rem 0; color: var(--color-ink); }

.tiptap-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  background-color: transparent;
  border-radius: 8px; 
  overflow: hidden;
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
}
</style>
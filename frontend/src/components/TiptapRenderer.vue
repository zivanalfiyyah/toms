<script setup>
import { computed } from 'vue'
import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/Starter-kit'

const props = defineProps({
    content: { type: Object, required: true }
})

const extensions = [StarterKit]

function slugify(text) {
    return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const html = computed(() => {
  try {
    let raw = generateHTML(props.content, extensions)
    raw = raw.replace(/<h([1-6])>(.*?)<\/h\1>/g, (m, level, text) => {
      return `<h${level} id="${slugify(text)}">${text}</h${level}>`
    })
    return raw
  } catch (e) {
    console.error('Gagal merender konten:', e)
    return '<p><em>Konten tidak dapat ditampilkan.</em></p>'
  }
})
</script>

<style scoped>
.tiptap-content :deep(h2) { font-size: 1.4rem; margin-top: 2rem; }
.tiptap-content :deep(h3) { font-size: 1.15rem; margin-top: 1.5rem; }
.tiptap-content :deep(p) { line-height: 1.7; margin: 0.9rem 0; color: var(--color-ink); }
.tiptap-content :deep(ol),
.tiptap-content :deep(ul) { padding-left: 1.4rem; }
.tiptap-content :deep(li) { margin: 0.3rem 0; }
.tiptap-content :deep(pre) {
  background: var(--color-code-bg);
  color: var(--color-code-text);
  padding: 1rem 1.25rem;
  border-radius: var(--radius);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.875rem;
}
.tiptap-content :deep(code) { font-family: var(--font-mono); }
</style>
 
<template>
    <div class="tiptap-content" v-html="html"></div>
</template>

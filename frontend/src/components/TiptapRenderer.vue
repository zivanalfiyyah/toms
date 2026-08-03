<script setup>
import { computed } from 'vue'
import { generateHTML } from '@tiptap/core'
import { StarterKit } from '@tiptap/starter-kit'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

const props = defineProps({
  content: { type: [Object, String], required: true }
})

const extensions = [
  StarterKit,
  Image,
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell
]

function slugify(text) {
  if (!text) return ''
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const html = computed(() => {
  try {
    let jsonContent = props.content

    if (typeof jsonContent === 'string') {
      jsonContent = JSON.parse(jsonContent)
    }

    if (!jsonContent || !jsonContent.content || jsonContent.content.length === 0) {
      return '<p><em>Tidak ada konten.</em></p>'
    }

    let raw = generateHTML(jsonContent, extensions)

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
  background-color: #ffffff;
  border-radius: 8px; 
  overflow: hidden;
}

.tiptap-content :deep(th),
.tiptap-content :deep(td) {
  border: 1px solid #cbd5e1;
  padding: 10px 14px; 
  text-align: left;
  vertical-align: top; 
}

.tiptap-content :deep(th) {
  background-color: #f1f5f9;
  font-weight: bold;
  color: #1e293b; 
}

.tiptap-content :deep(tbody tr:nth-child(even)) {
  background-color: #f8fafc; 
}

.tiptap-content :deep(tbody tr:hover) {
  background-color: #f1f5f9;
}
</style>
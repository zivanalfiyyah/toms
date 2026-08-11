<script setup>
import { onMounted, onBeforeUnmount, ref, shallowRef, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Editor } from '@tiptap/core'
import { StarterKit } from '@tiptap/starter-kit'

import { Table as OriginalTable } from '@tiptap/extension-table'
import { TableRow as OriginalTableRow } from '@tiptap/extension-table-row'
import { TableCell as OriginalTableCell } from '@tiptap/extension-table-cell'
import { TableHeader as OriginalTableHeader } from '@tiptap/extension-table-header'
import { Image as OriginalImage } from '@tiptap/extension-image'

import { Underline } from '@tiptap/extension-underline'
import { Link } from '@tiptap/extension-link'
import api from '../api'
import { useAuthStore } from '../stores/auth'
import { useDocsStore } from '../stores/docs'

// This mirrors EditPage.vue (which edits a Page) but edits a Category's
// own `content` / `content_html` instead. A category can now hold its
// own "materi" directly, independent of the pages underneath it.
const props = defineProps({
  category: { type: String, required: true },
  // The router also passes slugs: [] on this route (to reuse the same
  // pattern as edit-page's props factory); a category edit doesn't need
  // it, but declaring it here stops it from leaking onto the root <div>
  // as a stray HTML attribute.
  slugs: { type: Array, default: () => [] }
})

const router = useRouter()
const auth = useAuthStore()
const docsStore = useDocsStore()

const backTo = `/docs/${props.category}`

const categoryId = ref(null)
const name = ref('')
const description = ref('')
const icon = ref('')
const parentId = ref(null)
const order = ref(0)
const editorEl = ref(null)
const loading = ref(true)
const saving = ref(false)
const loadErrorMessage = ref('')
const actionErrorMessage = ref('')
const editorVersion = ref(0)

const CustomTable = OriginalTable.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: { default: null, parseHTML: el => el.getAttribute('style'), renderHTML: attrs => attrs.style ? { style: attrs.style } : {} },
      border: { default: null, parseHTML: el => el.getAttribute('border'), renderHTML: attrs => attrs.border ? { border: attrs.border } : {} },
      width: { default: null, parseHTML: el => el.getAttribute('width'), renderHTML: attrs => attrs.width ? { width: attrs.width } : {} },
    }
  }
})

const CustomTableRow = OriginalTableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: { default: null, parseHTML: el => el.getAttribute('style'), renderHTML: attrs => attrs.style ? { style: attrs.style } : {} }
    }
  }
})

const CustomTableCell = OriginalTableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: { default: null, parseHTML: el => el.getAttribute('style'), renderHTML: attrs => attrs.style ? { style: attrs.style } : {} },
      width: { default: null, parseHTML: el => el.getAttribute('width'), renderHTML: attrs => attrs.width ? { width: attrs.width } : {} },
      valign: { default: null, parseHTML: el => el.getAttribute('valign'), renderHTML: attrs => attrs.valign ? { valign: attrs.valign } : {} }
    }
  }
})

const CustomTableHeader = OriginalTableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: { default: null, parseHTML: el => el.getAttribute('style'), renderHTML: attrs => attrs.style ? { style: attrs.style } : {} },
      width: { default: null, parseHTML: el => el.getAttribute('width'), renderHTML: attrs => attrs.width ? { width: attrs.width } : {} }
    }
  }
})

const CustomImage = OriginalImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: { default: null, parseHTML: el => el.getAttribute('style'), renderHTML: attrs => attrs.style ? { style: attrs.style } : {} },
      class: { default: null, parseHTML: el => el.getAttribute('class'), renderHTML: attrs => attrs.class ? { class: attrs.class } : {} }
    }
  }
})

const editor = shallowRef(null)

onMounted(async () => {
  if (!auth.canEdit) {
    router.push(backTo)
    return
  }

  try {
    const catRes = await api.get('/categories', {
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      params: { _ts: Date.now() },
    })
    const cat = catRes.data.find((c) => c.slug === props.category)
    if (!cat) {
      loadErrorMessage.value = 'Kategori tidak ditemukan.'
      loading.value = false
      return
    }

    // /categories (index) only returns top-level categories, so if this
    // is a nested category, fetch it directly by id to be safe.
    const detailRes = await api.get(`/categories/${cat.id}`)
    const detail = detailRes.data

    categoryId.value = detail.id
    name.value = detail.name
    description.value = detail.description ?? ''
    icon.value = detail.icon ?? ''
    parentId.value = detail.parent_id ?? null
    order.value = detail.order ?? 0

    loading.value = false
    await nextTick()

    try {
      editor.value = new Editor({
        element: editorEl.value,
        extensions: [
          StarterKit,
          CustomTable.configure({ resizable: true }),
          CustomTableRow,
          CustomTableHeader,
          CustomTableCell,
          CustomImage.configure({ allowBase64: true }),
          Underline,
          Link.configure({ openOnClick: false }),
        ],
        content: detail.content_html || '<p></p>',
        onTransaction: () => {
          editorVersion.value++
        },
      })
    } catch (editorErr) {
      console.error('CategoryEditPage: Tiptap Editor failed to initialize with this content:', editorErr)
      console.error('content_html yang gagal di-parse:', detail.content_html)
      loadErrorMessage.value = 'Gagal memuat editor konten. Kemungkinan ada struktur HTML (mis. tabel) yang tidak didukung editor. Detail: ' + editorErr.message
    }
  } catch (err) {
    console.error('CategoryEditPage load error:', err)
    loadErrorMessage.value = err.response?.data?.message || 'Gagal memuat kategori.'
    loading.value = false
  }
})

const imageInputEl = ref(null)
const docxInputEl = ref(null)
const importing = ref(false)

function setLink() {
  if (!editor.value) return
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('Masukkan URL link', previousUrl || 'https://')
  if (url === null) return
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function triggerImagePick() {
  imageInputEl.value?.click()
}

async function handleImagePick(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file || !editor.value) return
  try {
    const formData = new FormData()
    formData.append('image', file)
    // Reuses the generic page image-upload endpoint; it just stores the
    // file and returns a URL, nothing page-specific about it.
    const res = await api.post('/pages/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    editor.value.chain().focus().setImage({ src: res.data.url }).run()
  } catch (err) {
    actionErrorMessage.value = 'Gagal upload gambar: ' + (err.response?.data?.message || err.message)
  }
}

function triggerDocxPick() {
  docxInputEl.value?.click()
}

async function handleDocxPick(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (!categoryId.value) {
    actionErrorMessage.value = 'Kategori belum termuat, coba lagi sebentar.'
    return
  }

  const confirmed = window.confirm('Import ini akan MENGGANTI seluruh isi materi kategori ini dengan isi file Word yang diupload. Lanjutkan?')
  if (!confirmed) return

  importing.value = true
  actionErrorMessage.value = ''
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('_method', 'PUT')
    const res = await api.post(`/categories/${categoryId.value}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const updatedCategory = res.data.category
    if (editor.value) {
      editor.value.commands.setContent(updatedCategory?.content_html || '<p></p>')
    }
  } catch (err) {
    const data = err.response?.data
    actionErrorMessage.value = 'Gagal import: ' + (data?.error || data?.message || err.message) + (data?.line ? ` (baris ${data.line})` : '')
  } finally {
    importing.value = false
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})

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

async function handleSave() {
  if (!editor.value) return
  saving.value = true
  actionErrorMessage.value = ''
  try {
    const cleanContent = sanitizeNode(editor.value.getJSON()) || { type: 'doc', content: [] }
    const res = await api.put(`/categories/${categoryId.value}`, {
      name: name.value,
      description: description.value,
      icon: icon.value,
      parent_id: parentId.value,
      order: order.value,
      content: cleanContent,
      content_html: editor.value.getHTML(),
    })

    const newSlug = res.data?.slug ?? res.data?.data?.slug

    await docsStore.fetchCategories()

    router.push(`/docs/${newSlug || props.category}`)
  } catch (err) {
    actionErrorMessage.value = err.response?.data?.message || 'Gagal menyimpan perubahan.'
  } finally {
    saving.value = false
  }
}

function handleCancel() {
  router.push(backTo)
}
</script>

<style scoped>
.edit-wrap { max-width: 780px; margin: 2rem auto; padding: 0 1.5rem; }
.field { margin-bottom: 1rem; }
label { display: block; font-size: 0.85rem; margin-bottom: 0.3rem; color: var(--color-ink-soft); }
input[type="text"], input[type="number"], textarea {
  width: 100%; padding: 0.5rem 0.7rem; border: 1px solid var(--color-border);
  border-radius: var(--radius); background: var(--color-bg); color: var(--color-ink);
  font-family: inherit;
}
textarea { resize: vertical; min-height: 60px; }

.toolbar {
  display: flex; gap: 4px; padding: 8px; flex-wrap: wrap;
  border: 1px solid var(--color-border); border-bottom: none;
  border-radius: var(--radius) var(--radius) 0 0; background: var(--color-surface);
}
.toolbar button {
  padding: 0.3rem 0.6rem; border: 1px solid var(--color-border); border-radius: 6px;
  background: var(--color-bg); cursor: pointer; font-size: 0.85rem;
}
.toolbar button.is-active { background: var(--color-accent); color: #fff; }
.toolbar-sep { width: 1px; align-self: stretch; background: var(--color-border); margin: 0 2px; }

.tiptap-editor {
  border: 1px solid var(--color-border); border-radius: 0 0 var(--radius) var(--radius);
  min-height: 300px; padding: 1rem; background: var(--color-bg);
}
.tiptap-editor :deep(.ProseMirror) { outline: none; min-height: 280px; }

.tiptap-editor :deep(table) {
  border-collapse: collapse;
  margin: 1rem 0;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

.tiptap-editor :deep(td),
.tiptap-editor :deep(th) {
  border: 1px solid var(--color-border, #ccc);
  box-sizing: border-box;
  min-width: 1em;
  padding: 8px;
  vertical-align: top;
  position: relative;
}

.tiptap-editor :deep(th) {
  background-color: #f8f9fa;
  font-weight: bold;
  text-align: left;
}

.tiptap-editor :deep(.column-resize-handle) {
  background-color: #adf;
  bottom: -2px;
  position: absolute;
  right: -2px;
  pointer-events: none;
  top: 0;
  width: 4px;
}
.tiptap-editor :deep(img) { max-width: 100%; height: auto; border-radius: 6px; }

.actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
.btn-save {
  padding: 0.6rem 1.2rem; border: none; border-radius: var(--radius);
  background: var(--color-accent); color: #fff; font-weight: 600; cursor: pointer;
}
.btn-cancel {
  padding: 0.6rem 1.2rem; border: 1px solid var(--color-border); border-radius: var(--radius);
  background: transparent; cursor: pointer;
}
.error { color: #d33; margin-bottom: 1rem; }
.import-row { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; }
.btn-import {
  padding: 0.5rem 1rem; border: 1px solid var(--color-accent); border-radius: var(--radius);
  background: transparent; color: var(--color-accent); font-weight: 600; cursor: pointer; font-size: 0.85rem;
}
.btn-import:disabled { opacity: 0.6; cursor: not-allowed; }
.import-hint { font-size: 0.78rem; color: var(--color-ink-soft); }
</style>

<template>
  <div class="edit-wrap">
    <h1>Ubah Materi Kategori</h1>

    <p v-if="loading">Memuat...</p>
    <p v-if="loadErrorMessage" class="error">{{ loadErrorMessage }}</p>

    <template v-if="!loading && !loadErrorMessage">
      <p v-if="actionErrorMessage" class="error">{{ actionErrorMessage }}</p>

      <div class="field">
        <label>Nama Kategori</label>
        <input type="text" v-model="name" />
      </div>

      <div class="field">
        <label>Deskripsi Singkat</label>
        <textarea v-model="description" rows="2"></textarea>
      </div>

      <div class="field">
        <label>Icon (opsional)</label>
        <input type="text" v-model="icon" placeholder="mis. book, folder, dll" />
      </div>

      <div class="field">
        <label>Urutan</label>
        <input type="number" v-model.number="order" />
      </div>

      <div class="field import-row">
        <button type="button" class="btn-import" :disabled="importing" @click="triggerDocxPick">
          {{ importing ? 'Meng-import...' : 'Import dari Word (.docx)' }}
        </button>
        <input ref="docxInputEl" type="file" accept=".docx" style="display:none" @change="handleDocxPick" />
        <span class="import-hint">Ini akan mengganti seluruh isi materi kategori di bawah dengan isi file Word yang diupload.</span>
      </div>

      <div class="field">
        <label>Materi Kategori</label>
        <div class="toolbar">
          <span style="display:none">{{ editorVersion }}</span>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('heading', { level: 1 }) }" @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()">H1</button>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }" @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }" @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()">H3</button>
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('bold') }" @click="editor?.chain().focus().toggleBold().run()"><b>B</b></button>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('italic') }" @click="editor?.chain().focus().toggleItalic().run()"><i>I</i></button>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('underline') }" @click="editor?.chain().focus().toggleUnderline().run()"><u>U</u></button>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('strike') }" @click="editor?.chain().focus().toggleStrike().run()"><s>S</s></button>
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('bulletList') }" @click="editor?.chain().focus().toggleBulletList().run()">List</button>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('orderedList') }" @click="editor?.chain().focus().toggleOrderedList().run()">1. List</button>
          <button type="button" :disabled="!editor" :class="{ 'is-active': editor?.isActive('blockquote') }" @click="editor?.chain().focus().toggleBlockquote().run()">Quote</button>
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" @click="setLink">Link</button>
          <button type="button" :disabled="!editor" @click="triggerImagePick">Gambar</button>
          <input ref="imageInputEl" type="file" accept="image/*" style="display:none" @change="handleImagePick" />
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" @click="editor?.chain().focus().undo().run()">Undo</button>
          <button type="button" :disabled="!editor" @click="editor?.chain().focus().redo().run()">Redo</button>
        </div>
        <div ref="editorEl" class="tiptap-editor"></div>
      </div>

      <div class="actions">
        <button class="btn-save" :disabled="saving" @click="handleSave">
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
        </button>
        <button class="btn-cancel" @click="handleCancel">Batal</button>
      </div>
    </template>
  </div>
</template>
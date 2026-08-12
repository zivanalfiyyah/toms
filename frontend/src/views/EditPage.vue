<script setup>
import { onMounted, onBeforeUnmount, ref, shallowRef, nextTick, computed } from 'vue'
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
import { TextAlign } from '@tiptap/extension-text-align'
import { Highlight } from '@tiptap/extension-highlight'
import api from '../api'
import { useAuthStore } from '../stores/auth'
import { useDocsStore } from '../stores/docs'

const props = defineProps({
  category: { type: String, required: true },
  slugs: { type: Array, required: true }
})

const router = useRouter()
const auth = useAuthStore()
const docsStore = useDocsStore()

const backTo = `/docs/${props.category}/${props.slugs.join('/')}`

const pageId = ref(null)
const title = ref('')
const status = ref('draft')
const editorEl = ref(null)
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
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
      errorMessage.value = 'Halaman tidak ditemukan.'
      loading.value = false
      return
    }

    let node = cat.pages?.find((p) => p.slug === props.slugs[0])
    if (!node) {
      errorMessage.value = 'Halaman tidak ditemukan.'
      loading.value = false
      return
    }
    for (let i = 1; i < props.slugs.length; i++) {
      if (!node.children) {
        const res = await api.get(`/pages/${node.id}`)
        node = res.data
      }
      const next = node.children?.find((c) => c.slug === props.slugs[i])
      if (!next) {
        errorMessage.value = 'Halaman tidak ditemukan.'
        loading.value = false
        return
      }
      node = next
    }
    const target = node

    if (!target) {
      errorMessage.value = 'Halaman tidak ditemukan.'
      loading.value = false
      return
    }

    const detailRes = await api.get(`/pages/${target.id}`)
    const detail = detailRes.data

    pageId.value = detail.id
    title.value = detail.title
    status.value = detail.status ?? 'draft'

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
          TextAlign.configure({ types: ['heading', 'paragraph'] }),
          Highlight.configure({ multicolor: false }),
        ],
        content: detail.content_html || '<p></p>',
        onTransaction: () => {
          editorVersion.value++
        },
      })
    } catch (editorErr) {
      console.error('EditPage: Tiptap Editor failed to initialize with this page content:', editorErr)
      console.error('content_html yang gagal di-parse:', detail.content_html)
      errorMessage.value = 'Gagal memuat editor konten. Kemungkinan ada struktur HTML (mis. tabel) di halaman ini yang tidak didukung editor. Detail: ' + editorErr.message
    }
  } catch (err) {
    console.error('EditPage load error:', err)
    errorMessage.value = err.response?.data?.message || 'Gagal memuat halaman.'
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

function deleteSelectedImage() {
  if (!editor.value) return
  editor.value.chain().focus().deleteSelection().run()
}

async function handleImagePick(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file || !editor.value) return
  try {
    const formData = new FormData()
    formData.append('image', file)
    const res = await api.post('/pages/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    editor.value.chain().focus().setImage({ src: res.data.url }).run()
  } catch (err) {
    errorMessage.value = 'Gagal upload gambar: ' + (err.response?.data?.message || err.message)
  }
}

function triggerDocxPick() {
  docxInputEl.value?.click()
}

async function handleDocxPick(e) {
  const file = e.target.files?.[0]
  e.target.value = ''
  if (!file) return
  if (!pageId.value) {
    errorMessage.value = 'Halaman belum termuat, coba lagi sebentar.'
    return
  }

  const confirmed = window.confirm('Import ini akan MENGGANTI seluruh isi konten halaman ini dengan isi file Word yang diupload. Lanjutkan?')
  if (!confirmed) return

  importing.value = true
  errorMessage.value = ''
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('_method', 'PUT')
    const res = await api.post(`/pages/${pageId.value}/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    const updatedPage = res.data.page
    title.value = updatedPage.title
    
    if (editor.value) {
      editor.value.commands.setContent(updatedPage.content_html || updatedPage.content || '<p></p>')
    }
  } catch (err) {
    const data = err.response?.data
    errorMessage.value = 'Gagal import: ' + (data?.error || data?.message || err.message) + (data?.line ? ` (baris ${data.line})` : '')
  } finally {
    importing.value = false
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// --- Table controls ---
// The table extensions were already wired into the editor's schema
// (CustomTable / CustomTableRow / CustomTableCell / CustomTableHeader),
// so tables could be resized once inserted — but there was no toolbar
// action to actually insert or edit one. These add that missing layer.
function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}
function addColumnBefore() {
  editor.value?.chain().focus().addColumnBefore().run()
}
function addColumnAfter() {
  editor.value?.chain().focus().addColumnAfter().run()
}
function deleteColumn() {
  editor.value?.chain().focus().deleteColumn().run()
}
function addRowBefore() {
  editor.value?.chain().focus().addRowBefore().run()
}
function addRowAfter() {
  editor.value?.chain().focus().addRowAfter().run()
}
function deleteRow() {
  editor.value?.chain().focus().deleteRow().run()
}
function deleteTable() {
  if (!window.confirm('Hapus seluruh tabel ini?')) return
  editor.value?.chain().focus().deleteTable().run()
}
function mergeOrSplitCells() {
  editor.value?.chain().focus().mergeOrSplit().run()
}
function toggleHeaderRow() {
  editor.value?.chain().focus().toggleHeaderRow().run()
}
function toggleHeaderColumn() {
  editor.value?.chain().focus().toggleHeaderColumn().run()
}

// --- Heading dropdown (Paragraf / Heading 1-3) ---
// editorVersion is bumped on every editor transaction (see onTransaction
// above), so referencing it here makes this computed re-evaluate live as
// the cursor moves or the user types — same trick the toolbar buttons use.
const currentBlockType = computed(() => {
  void editorVersion.value
  if (!editor.value) return 'paragraph'
  for (const level of [1, 2, 3]) {
    if (editor.value.isActive('heading', { level })) return String(level)
  }
  return 'paragraph'
})

function onHeadingChange(e) {
  const val = e.target.value
  if (!editor.value) return
  if (val === 'paragraph') {
    editor.value.chain().focus().setParagraph().run()
  } else {
    editor.value.chain().focus().setHeading({ level: Number(val) }).run()
  }
}

// --- Text align dropdown ---
const currentAlign = computed(() => {
  void editorVersion.value
  if (!editor.value) return 'left'
  for (const align of ['left', 'center', 'right', 'justify']) {
    if (editor.value.isActive({ textAlign: align })) return align
  }
  return 'left'
})

function onAlignChange(e) {
  editor.value?.chain().focus().setTextAlign(e.target.value).run()
}

// --- Raw HTML source view ---
// Lets an admin who's comfortable with HTML tweak markup directly
// (e.g. fixing something the toolbar can't reach), then apply it back
// into the editor.
const showHtmlSource = ref(false)
const htmlSource = ref('')

function toggleHtmlSource() {
  if (!editor.value) return
  if (!showHtmlSource.value) {
    htmlSource.value = editor.value.getHTML()
  }
  showHtmlSource.value = !showHtmlSource.value
}

function applyHtmlSource() {
  if (!editor.value) return
  editor.value.commands.setContent(htmlSource.value || '<p></p>')
  showHtmlSource.value = false
}

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
  errorMessage.value = ''
  try {
    const cleanContent = sanitizeNode(editor.value.getJSON()) || { type: 'doc', content: [] }
    const res = await api.put(`/pages/${pageId.value}`, {
      title: title.value,
      status: status.value,
      content: cleanContent,
      content_html: editor.value.getHTML(),
    })

    const newSlug = res.data?.slug || res.data?.page?.slug
    const redirectSlugs = newSlug && newSlug !== props.slugs[props.slugs.length - 1]
      ? [...props.slugs.slice(0, -1), newSlug]
      : props.slugs

    await docsStore.fetchCategories()

    router.push(`/docs/${props.category}/${redirectSlugs.join('/')}`)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Gagal menyimpan perubahan.'
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
input[type="text"], select {
  width: 100%; padding: 0.5rem 0.7rem; border: 1px solid var(--color-border);
  border-radius: var(--radius); background: var(--color-bg); color: var(--color-ink);
}

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

.toolbar-select {
  padding: 0.3rem 0.4rem; border: 1px solid var(--color-border); border-radius: 6px;
  background: var(--color-bg); color: var(--color-ink); font-size: 0.85rem; cursor: pointer;
}

.table-toolbar {
  border-top: none;
  border-radius: 0;
  background: var(--color-accent-soft, #eef2ff);
}
.toolbar-label { font-size: 0.8rem; color: var(--color-ink-soft); align-self: center; margin-right: 2px; }

.html-source-panel {
  border: 1px solid var(--color-border); border-top: none; background: var(--color-surface);
  padding: 0.75rem;
}
.html-source-textarea {
  width: 100%; min-height: 180px; font-family: 'SFMono-Regular', Consolas, monospace; font-size: 0.8rem;
  border: 1px solid var(--color-border); border-radius: var(--radius); padding: 0.6rem;
  background: var(--color-bg); color: var(--color-ink); resize: vertical;
}
.html-source-actions { display: flex; gap: 0.5rem; margin-top: 0.6rem; }

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
.btn-delete-img {
  padding: 0.3rem 0.6rem; border: 1px solid #d33; border-radius: 6px;
  background: transparent; color: #d33; cursor: pointer; font-size: 0.85rem;
}
</style>

<template>
  <div class="edit-wrap">
    <h1>Ubah Halaman</h1>

    <p v-if="loading">Memuat...</p>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <template v-if="!loading && !errorMessage">
      <div class="field">
        <label>Judul</label>
        <input type="text" v-model="title" />
      </div>

      <div class="field import-row">
        <button type="button" class="btn-import" :disabled="importing" @click="triggerDocxPick">
          {{ importing ? 'Meng-import...' : 'Import Ulang dari Word (.docx)' }}
        </button>
        <input ref="docxInputEl" type="file" accept=".docx" style="display:none" @change="handleDocxPick" />
        <span class="import-hint">Ini akan mengganti seluruh isi konten di bawah dengan isi file Word yang diupload.</span>
      </div>

      <div class="field">
        <label>Status</label>
        <select v-model="status">
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <div class="field">
        <label>Konten</label>
        <div class="toolbar">
          <span style="display:none">{{ editorVersion }}</span>
          <button type="button" :disabled="!editor" title="Undo" @click="editor?.chain().focus().undo().run()">↺</button>
          <button type="button" :disabled="!editor" title="Redo" @click="editor?.chain().focus().redo().run()">↻</button>
          <span class="toolbar-sep"></span>
          <select class="toolbar-select" :disabled="!editor" title="Gaya Paragraf" :value="currentBlockType" @change="onHeadingChange">
            <option value="paragraph">Paragraf</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" title="Tebal" :class="{ 'is-active': editor?.isActive('bold') }" @click="editor?.chain().focus().toggleBold().run()"><b>B</b></button>
          <button type="button" :disabled="!editor" title="Miring" :class="{ 'is-active': editor?.isActive('italic') }" @click="editor?.chain().focus().toggleItalic().run()"><i>I</i></button>
          <button type="button" :disabled="!editor" title="Garis Bawah" :class="{ 'is-active': editor?.isActive('underline') }" @click="editor?.chain().focus().toggleUnderline().run()"><u>U</u></button>
          <button type="button" :disabled="!editor" title="Coret" :class="{ 'is-active': editor?.isActive('strike') }" @click="editor?.chain().focus().toggleStrike().run()"><s>S</s></button>
          <button type="button" :disabled="!editor" title="Sorot (Highlight)" :class="{ 'is-active': editor?.isActive('highlight') }" @click="editor?.chain().focus().toggleHighlight().run()">🖍</button>
          <span class="toolbar-sep"></span>
          <select class="toolbar-select" :disabled="!editor" title="Perataan Teks" :value="currentAlign" @change="onAlignChange">
            <option value="left">Rata Kiri</option>
            <option value="center">Rata Tengah</option>
            <option value="right">Rata Kanan</option>
            <option value="justify">Rata Kiri-Kanan</option>
          </select>
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" title="Daftar Bullet" :class="{ 'is-active': editor?.isActive('bulletList') }" @click="editor?.chain().focus().toggleBulletList().run()">List</button>
          <button type="button" :disabled="!editor" title="Daftar Bernomor" :class="{ 'is-active': editor?.isActive('orderedList') }" @click="editor?.chain().focus().toggleOrderedList().run()">1. List</button>
          <button type="button" :disabled="!editor" title="Kutipan" :class="{ 'is-active': editor?.isActive('blockquote') }" @click="editor?.chain().focus().toggleBlockquote().run()">Quote</button>
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" title="Sisipkan Link" @click="setLink">🔗 Link</button>
          <button type="button" :disabled="!editor" title="Sisipkan Gambar" @click="triggerImagePick">🖼 Gambar</button>
          <input ref="imageInputEl" type="file" accept="image/*" style="display:none" @change="handleImagePick" />
          <button
            type="button"
            v-if="editor?.isActive('image')"
            class="btn-delete-img"
            @click="deleteSelectedImage"
          >
            Hapus Gambar
          </button>
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" title="Sisipkan Tabel" @click="insertTable">▦ Tabel</button>
          <button type="button" :disabled="!editor" title="Blok Kode" :class="{ 'is-active': editor?.isActive('codeBlock') }" @click="editor?.chain().focus().toggleCodeBlock().run()">&lt;/&gt;</button>
          <button type="button" :disabled="!editor" title="Garis Pemisah" @click="editor?.chain().focus().setHorizontalRule().run()">― HR</button>
          <button type="button" :disabled="!editor" title="Bersihkan Format" @click="editor?.chain().focus().unsetAllMarks().clearNodes().run()">Clear</button>
          <span class="toolbar-sep"></span>
          <button type="button" :disabled="!editor" title="Lihat/Edit HTML mentah" :class="{ 'is-active': showHtmlSource }" @click="toggleHtmlSource">&lt;&gt; HTML</button>
        </div>

        <div v-if="showHtmlSource" class="html-source-panel">
          <textarea v-model="htmlSource" class="html-source-textarea" spellcheck="false"></textarea>
          <div class="html-source-actions">
            <button type="button" class="btn-import" @click="applyHtmlSource">Terapkan HTML</button>
            <button type="button" class="btn-cancel" @click="showHtmlSource = false">Batal</button>
          </div>
        </div>

        <div v-if="editor?.isActive('table') && !showHtmlSource" class="toolbar table-toolbar">
          <span class="toolbar-label">Tabel:</span>
          <button type="button" @click="addRowBefore">+ Baris Atas</button>
          <button type="button" @click="addRowAfter">+ Baris Bawah</button>
          <button type="button" @click="deleteRow">Hapus Baris</button>
          <span class="toolbar-sep"></span>
          <button type="button" @click="addColumnBefore">+ Kolom Kiri</button>
          <button type="button" @click="addColumnAfter">+ Kolom Kanan</button>
          <button type="button" @click="deleteColumn">Hapus Kolom</button>
          <span class="toolbar-sep"></span>
          <button type="button" @click="mergeOrSplitCells">Gabung/Pisah Sel</button>
          <button type="button" :class="{ 'is-active': editor?.isActive('tableHeader') }" @click="toggleHeaderRow">Header Baris</button>
          <button type="button" @click="toggleHeaderColumn">Header Kolom</button>
          <span class="toolbar-sep"></span>
          <button type="button" class="btn-delete-img" @click="deleteTable">Hapus Tabel</button>
        </div>

        <div ref="editorEl" class="tiptap-editor" v-show="!showHtmlSource"></div>
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
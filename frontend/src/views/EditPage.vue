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

import {
  Undo, Redo, Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Highlighter, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon,
  Table, Code, Minus, Eraser, Code2, Trash2, FileUp, Save, X, Plus
} from 'lucide-vue-next'

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
      console.error('EditPage: Tiptap Editor failed to initialize:', editorErr)
      errorMessage.value = 'Gagal memuat editor konten: ' + editorErr.message
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
    errorMessage.value = 'Gagal import: ' + (data?.error || data?.message || err.message)
  } finally {
    importing.value = false
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})

// --- Table controls ---
function insertTable() {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}
function addColumnBefore() { editor.value?.chain().focus().addColumnBefore().run() }
function addColumnAfter() { editor.value?.chain().focus().addColumnAfter().run() }
function deleteColumn() { editor.value?.chain().focus().deleteColumn().run() }
function addRowBefore() { editor.value?.chain().focus().addRowBefore().run() }
function addRowAfter() { editor.value?.chain().focus().addRowAfter().run() }
function deleteRow() { editor.value?.chain().focus().deleteRow().run() }
function deleteTable() {
  if (!window.confirm('Hapus seluruh tabel ini?')) return
  editor.value?.chain().focus().deleteTable().run()
}
function mergeOrSplitCells() { editor.value?.chain().focus().mergeOrSplit().run() }
function toggleHeaderRow() { editor.value?.chain().focus().toggleHeaderRow().run() }

// --- Dropdowns ---
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

// --- HTML View ---
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

<template>
  <div class="edit-wrap">
    <div class="page-header">
      <h2>Edit Halaman Dokumen</h2>
      <p class="sub-title">Kelola isi dan tata letak konten dokumen dengan mudah.</p>
    </div>

    <div v-if="loading" class="loading-state">Memuat data halaman...</div>
    <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

    <template v-if="!loading && !errorMessage">
      <div class="form-grid">
        <div class="field title-field">
          <label>Judul Halaman</label>
          <input type="text" v-model="title" placeholder="Masukkan judul halaman..." />
        </div>

        <div class="field status-field">
          <label>Status Publikasi</label>
          <select v-model="status">
            <option value="draft">Draft (Konsep)</option>
            <option value="published">Published (Terbit)</option>
          </select>
        </div>
      </div>

      <div class="import-card">
        <div class="import-info">
          <strong>Impor dari Microsoft Word</strong>
          <span>Ganti konten halaman secara otomatis dari berkas .docx</span>
        </div>
        <button type="button" class="btn-secondary" :disabled="importing" @click="triggerDocxPick">
          <FileUp :size="16" />
          {{ importing ? 'Mengimpor...' : 'Pilih Berkas Word' }}
        </button>
        <input ref="docxInputEl" type="file" accept=".docx" style="display:none" @change="handleDocxPick" />
      </div>

      <div class="editor-container">
        <div class="toolbar">
          <span style="display:none">{{ editorVersion }}</span>

          <!-- Riwayat -->
          <div class="toolbar-group">
            <button type="button" class="btn-icon" :disabled="!editor" title="Batal (Undo)" @click="editor?.chain().focus().undo().run()"><Undo :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Ulangi (Redo)" @click="editor?.chain().focus().redo().run()"><Redo :size="16" /></button>
          </div>

          <div class="toolbar-divider"></div>

          <!-- Format Paragraf & Teks -->
          <div class="toolbar-group">
            <select class="toolbar-select" :disabled="!editor" title="Gaya Teks" :value="currentBlockType" @change="onHeadingChange">
              <option value="paragraph">Teks Normal</option>
              <option value="1">Judul Utama (H1)</option>
              <option value="2">Sub Judul (H2)</option>
              <option value="3">Sub-sub Judul (H3)</option>
            </select>
          </div>

          <div class="toolbar-divider"></div>

          <!-- Styling -->
          <div class="toolbar-group">
            <button type="button" class="btn-icon" :disabled="!editor" title="Cetak Tebal" :class="{ 'is-active': editor?.isActive('bold') }" @click="editor?.chain().focus().toggleBold().run()"><Bold :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Cetak Miring" :class="{ 'is-active': editor?.isActive('italic') }" @click="editor?.chain().focus().toggleItalic().run()"><Italic :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Garis Bawah" :class="{ 'is-active': editor?.isActive('underline') }" @click="editor?.chain().focus().toggleUnderline().run()"><UnderlineIcon :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Coret Teks" :class="{ 'is-active': editor?.isActive('strike') }" @click="editor?.chain().focus().toggleStrike().run()"><Strikethrough :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Sorot Warna" :class="{ 'is-active': editor?.isActive('highlight') }" @click="editor?.chain().focus().toggleHighlight().run()"><Highlighter :size="16" /></button>
          </div>

          <div class="toolbar-divider"></div>

          <!-- Perataan -->
          <div class="toolbar-group">
            <button type="button" class="btn-icon" :disabled="!editor" title="Rata Kiri" :class="{ 'is-active': currentAlign === 'left' }" @click="editor?.chain().focus().setTextAlign('left').run()"><AlignLeft :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Rata Tengah" :class="{ 'is-active': currentAlign === 'center' }" @click="editor?.chain().focus().setTextAlign('center').run()"><AlignCenter :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Rata Kanan" :class="{ 'is-active': currentAlign === 'right' }" @click="editor?.chain().focus().setTextAlign('right').run()"><AlignRight :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Rata Kiri-Kanan" :class="{ 'is-active': currentAlign === 'justify' }" @click="editor?.chain().focus().setTextAlign('justify').run()"><AlignJustify :size="16" /></button>
          </div>

          <div class="toolbar-divider"></div>

          <!-- Daftar & Elemen -->
          <div class="toolbar-group">
            <button type="button" class="btn-icon" :disabled="!editor" title="Daftar Simbol" :class="{ 'is-active': editor?.isActive('bulletList') }" @click="editor?.chain().focus().toggleBulletList().run()"><List :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Daftar Angka" :class="{ 'is-active': editor?.isActive('orderedList') }" @click="editor?.chain().focus().toggleOrderedList().run()"><ListOrdered :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Kutipan" :class="{ 'is-active': editor?.isActive('blockquote') }" @click="editor?.chain().focus().toggleBlockquote().run()"><Quote :size="16" /></button>
          </div>

          <div class="toolbar-divider"></div>

          <!-- Media & Elemen Lanjutan -->
          <div class="toolbar-group">
            <button type="button" class="btn-icon" :disabled="!editor" title="Sisipkan Link" @click="setLink"><LinkIcon :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Sisipkan Gambar" @click="triggerImagePick"><ImageIcon :size="16" /></button>
            <input ref="imageInputEl" type="file" accept="image/*" style="display:none" @change="handleImagePick" />
            <button type="button" class="btn-icon" :disabled="!editor" title="Sisipkan Tabel" @click="insertTable"><Table :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Blok Kode" :class="{ 'is-active': editor?.isActive('codeBlock') }" @click="editor?.chain().focus().toggleCodeBlock().run()"><Code :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Garis Pemisah" @click="editor?.chain().focus().setHorizontalRule().run()"><Minus :size="16" /></button>
          </div>

          <div class="toolbar-divider"></div>

          <!-- Alat Bantu -->
          <div class="toolbar-group">
            <button type="button" class="btn-icon" :disabled="!editor" title="Bersihkan Format Teks" @click="editor?.chain().focus().unsetAllMarks().clearNodes().run()"><Eraser :size="16" /></button>
            <button type="button" class="btn-icon" :disabled="!editor" title="Kode Sumber HTML" :class="{ 'is-active': showHtmlSource }" @click="toggleHtmlSource"><Code2 :size="16" /></button>
            <button v-if="editor?.isActive('image')" type="button" class="btn-icon btn-danger" title="Hapus Gambar Terpilih" @click="deleteSelectedImage"><Trash2 :size="16" /></button>
          </div>
        </div>

        <!-- Toolbar Tambahan jika Tabel Aktif -->
        <div v-if="editor?.isActive('table') && !showHtmlSource" class="table-toolbar">
          <span class="table-title"><Table :size="14" /> Pengaturan Tabel:</span>
          <div class="table-actions">
            <button type="button" @click="addRowBefore"><Plus :size="12" /> Baris Atas</button>
            <button type="button" @click="addRowAfter"><Plus :size="12" /> Baris Bawah</button>
            <button type="button" class="btn-text-danger" @click="deleteRow">Hapus Baris</button>
            <span class="sub-divider"></span>
            <button type="button" @click="addColumnBefore"><Plus :size="12" /> Kolom Kiri</button>
            <button type="button" @click="addColumnAfter"><Plus :size="12" /> Kolom Kanan</button>
            <button type="button" class="btn-text-danger" @click="deleteColumn">Hapus Kolom</button>
            <span class="sub-divider"></span>
            <button type="button" @click="mergeOrSplitCells">Gabung/Pisah Sel</button>
            <button type="button" :class="{ 'is-active': editor?.isActive('tableHeader') }" @click="toggleHeaderRow">Baris Header</button>
            <button type="button" class="btn-text-danger" @click="deleteTable"><Trash2 :size="12" /> Hapus Tabel</button>
          </div>
        </div>

        <!-- Mode Edit HTML Mentah -->
        <div v-if="showHtmlSource" class="html-source-panel">
          <div class="panel-header">Kode HTML Mentah</div>
          <textarea v-model="htmlSource" class="html-source-textarea" spellcheck="false"></textarea>
          <div class="html-source-actions">
            <button type="button" class="btn-primary-sm" @click="applyHtmlSource">Terapkan Perubahan</button>
            <button type="button" class="btn-secondary-sm" @click="showHtmlSource = false">Batal</button>
          </div>
        </div>

        <!-- Area Kanvas Tiptap Editor -->
        <div ref="editorEl" class="tiptap-editor" v-show="!showHtmlSource"></div>
      </div>

      <!-- Tombol Aksi Bawah -->
      <div class="actions">
        <button class="btn-save" :disabled="saving" @click="handleSave">
          <Save :size="18" />
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
        <button class="btn-cancel" @click="handleCancel">
          <X :size="18" />
          Batal
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.edit-wrap {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1.5rem;
  font-family: inherit;
  color: #334155;
}

.page-header {
  margin-bottom: 1.5rem;
}
.page-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
}
.sub-title {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

.loading-state {
  padding: 2rem;
  text-align: center;
  color: #64748b;
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
  color: #475569;
}

.field input[type="text"],
.field select {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #0f172a;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field input[type="text"]:focus,
.field select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.import-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
}

.import-info strong {
  display: block;
  font-size: 0.875rem;
  color: #1e293b;
}

.import-info span {
  font-size: 0.75rem;
  color: #64748b;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
}

.editor-container {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  background: #ffffff;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #cbd5e1;
  margin: 0 0.25rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-icon:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-icon.is-active {
  background: #eff6ff;
  color: #2563eb;
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-danger {
  color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: #fef2f2;
  color: #dc2626;
}

.toolbar-select {
  padding: 0.3rem 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #ffffff;
  color: #334155;
  font-size: 0.8125rem;
  outline: none;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: #f0f9ff;
  border-bottom: 1px solid #bae6fd;
  font-size: 0.8125rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  color: #0369a1;
  white-space: nowrap;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.table-actions button {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #93c5fd;
  border-radius: 4px;
  background: #ffffff;
  color: #1e40af;
  font-size: 0.75rem;
  cursor: pointer;
}

.table-actions button:hover {
  background: #dbeafe;
}

.table-actions button.is-active {
  background: #2563eb;
  color: #ffffff;
}

.sub-divider {
  width: 1px;
  height: 14px;
  background: #93c5fd;
  margin: 0 0.15rem;
}

.btn-text-danger {
  border-color: #fca5a5 !important;
  color: #b91c1c !important;
}

.btn-text-danger:hover {
  background: #fee2e2 !important;
}

.html-source-panel {
  padding: 0.75rem;
  background: #0f172a;
}

.panel-header {
  color: #94a3b8;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.html-source-textarea {
  width: 100%;
  min-height: 250px;
  font-family: monospace;
  font-size: 0.8125rem;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 0.75rem;
  background: #1e293b;
  color: #f1f5f9;
  resize: vertical;
  outline: none;
}

.html-source-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn-primary-sm {
  padding: 0.35rem 0.75rem;
  background: #2563eb;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  font-size: 0.8125rem;
  cursor: pointer;
}

.btn-secondary-sm {
  padding: 0.35rem 0.75rem;
  background: transparent;
  color: #94a3b8;
  border: 1px solid #475569;
  border-radius: 4px;
  font-size: 0.8125rem;
  cursor: pointer;
}

.tiptap-editor {
  min-height: 350px;
  padding: 1.25rem;
}

.tiptap-editor :deep(.ProseMirror) {
  outline: none;
  min-height: 320px;
}

.tiptap-editor :deep(table) {
  border-collapse: collapse;
  margin: 1rem 0;
  width: 100%;
}

.tiptap-editor :deep(td),
.tiptap-editor :deep(th) {
  border: 1px solid #cbd5e1;
  padding: 8px 10px;
  vertical-align: top;
}

.tiptap-editor :deep(th) {
  background-color: #f8fafc;
  font-weight: 600;
}

.tiptap-editor :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #f1f5f9;
}
</style>
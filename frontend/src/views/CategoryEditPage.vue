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

// Editor ini mengikuti tampilan & fitur EditPage.vue (yang mengedit sebuah
// Page), tapi mengedit `content`/`content_html` milik sebuah Category.
// Field di form sengaja DIBEDAKAN dari EditPage.vue supaya sesuai konsep
// kategori: tidak ada "Judul Halaman"/"Status Publikasi" (itu milik Page),
// yang ada Nama Kategori, Deskripsi Singkat, Icon, dan Urutan tampil.
const props = defineProps({
  category: { type: String, required: true },
  // Router juga mengoper slugs: [] di route ini (mengikuti pola props
  // factory yang sama dengan edit-page); category edit tidak butuh ini,
  // tapi tetap dideklarasikan supaya tidak nyasar jadi atribut HTML liar
  // di root <div>.
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

    // /categories (index) hanya mengembalikan kategori top-level, jadi
    // kalau ini kategori nested, ambil langsung by id supaya aman.
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
          // StarterKit v3 sudah membundel Link & Underline secara bawaan.
          // Dinonaktifkan di sini karena kita mendaftarkan versi kita
          // sendiri (dengan config openOnClick: false) di bawah — tanpa
          // ini, Tiptap akan warning "Duplicate extension names".
          StarterKit.configure({ link: false, underline: false }),
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
    // Pakai lagi endpoint upload-image generik milik page; fungsinya cuma
    // simpan file & balikin URL, tidak ada yang spesifik ke page.
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

// --- Daftar berpenomoran: angka (1,2,3) / huruf besar (A,B,C) / huruf
// kecil (a,b,c) — ordered-list Tiptap sudah mendukung atribut "type"
// bawaan (dipetakan langsung ke atribut HTML <ol type="...">), jadi
// tinggal set/reset atribut itu di node orderedList yang aktif.
// Kalau kursor belum ada di dalam ordered-list sama sekali, list-nya
// dibuat dulu (toggleOrderedList) baru tipenya diset dalam 1 transaksi
// yang sama supaya tidak ada "kedipan" state di antaranya.
function setOrderedListType(type) {
  if (!editor.value) return
  const alreadyThisType = editor.value.isActive('orderedList', { type })
  const chain = editor.value.chain().focus()
  if (!editor.value.isActive('orderedList')) {
    chain.toggleOrderedList()
  }
  // Klik lagi tombol yang sama saat sudah aktif = kembali ke angka desimal biasa
  chain.updateAttributes('orderedList', { type: alreadyThisType ? null : type }).run()
}

// --- Kontrol Tabel ---
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

// --- Dropdown gaya teks & perataan ---
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

// --- Mode HTML mentah ---
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

<template>
  <div class="edit-wrap">
    <div class="page-header">
      <h2>Ubah Materi Kategori</h2>
      <p class="sub-title">Kelola nama, deskripsi, dan konten materi kategori ini.</p>
    </div>

    <div v-if="loading" class="loading-state">Memuat data kategori...</div>
    <div v-if="loadErrorMessage" class="error-banner">{{ loadErrorMessage }}</div>

    <template v-if="!loading && !loadErrorMessage">
      <div v-if="actionErrorMessage" class="error-banner">{{ actionErrorMessage }}</div>

      <div class="form-grid">
        <div class="field title-field">
          <label>Nama Kategori</label>
          <input type="text" v-model="name" placeholder="Masukkan nama kategori..." />
        </div>

        <div class="field status-field">
          <label>Urutan Tampil</label>
          <input type="number" v-model.number="order" />
        </div>
      </div>

      <div class="field">
        <label>Deskripsi Singkat</label>
        <textarea v-model="description" rows="2" placeholder="Deskripsi singkat kategori ini..."></textarea>
      </div>

      <div class="field">
        <label>Icon (opsional)</label>
        <input type="text" v-model="icon" placeholder="mis. book, folder, dll" />
      </div>

      <div class="import-card">
        <div class="import-info">
          <strong>Impor dari Microsoft Word</strong>
          <span>Ganti konten materi kategori secara otomatis dari berkas .docx</span>
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
            <button type="button" class="btn-icon btn-text-icon" :disabled="!editor" title="Daftar Huruf Besar (A, B, C...)" :class="{ 'is-active': editor?.isActive('orderedList', { type: 'A' }) }" @click="setOrderedListType('A')">A</button>
            <button type="button" class="btn-icon btn-text-icon" :disabled="!editor" title="Daftar Huruf Kecil (a, b, c...)" :class="{ 'is-active': editor?.isActive('orderedList', { type: 'a' }) }" @click="setOrderedListType('a')">a</button>
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
  margin: 1rem auto 2rem;
  padding: 2rem;
  font-family: inherit;
  color: var(--color-ink);
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.page-header {
  margin-bottom: 1.5rem;
}
.page-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-ink);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.03em;
}
.sub-title {
  font-size: 0.875rem;
  color: var(--color-ink-soft);
  margin: 0;
}

.loading-state {
  padding: 2rem;
  text-align: center;
  color: var(--color-ink-soft);
}

.error-banner {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #ef4444;
  padding: 0.75rem 1rem;
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.field { margin-bottom: 1rem; }

.field label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.375rem;
  color: var(--color-ink-soft);
}

.field input[type="text"],
.field input[type="number"],
.field select,
.field textarea {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--input-bg);
  color: var(--color-ink);
  font-size: 0.875rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field textarea { resize: vertical; min-height: 60px; }

.field input[type="text"]:focus,
.field input[type="number"]:focus,
.field select:focus,
.field textarea:focus {
  border-color: var(--color-accent-border);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.import-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-accent-soft);
  border: 1px dashed var(--color-accent-border);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.import-info strong {
  display: block;
  font-size: 0.875rem;
  color: var(--color-ink);
}

.import-info span {
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.85rem;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: var(--glass-bg);
  color: var(--color-ink);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-accent-soft);
  border-color: var(--color-accent-border);
  color: var(--color-accent);
}

.editor-container {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  background: var(--color-surface);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: var(--well-bg);
  border-bottom: 1px solid var(--color-border);
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
  background: var(--color-border);
  margin: 0 0.25rem;
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.btn-icon:hover:not(:disabled) {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.btn-icon.is-active {
  background: var(--color-accent-soft);
  color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-accent-border);
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon.btn-text-icon {
  font-family: inherit;
  font-weight: 700;
  font-size: 0.8125rem;
  line-height: 1;
}

.btn-danger {
  color: #ef4444;
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.toolbar-select {
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--input-bg);
  color: var(--color-ink);
  font-size: 0.8125rem;
  outline: none;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: var(--color-accent-soft);
  border-bottom: 1px solid var(--color-accent-border);
  font-size: 0.8125rem;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  color: var(--color-accent);
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
  border: 1px solid var(--color-accent-border);
  border-radius: 6px;
  background: var(--glass-bg);
  color: var(--color-accent);
  font-size: 0.75rem;
  cursor: pointer;
}

.table-actions button:hover {
  background: var(--color-accent-soft);
}

.table-actions button.is-active {
  background: #0284c7;
  color: #ffffff;
}

.sub-divider {
  width: 1px;
  height: 14px;
  background: var(--color-accent-border);
  margin: 0 0.15rem;
}

.btn-text-danger {
  border-color: rgba(239, 68, 68, 0.5) !important;
  color: #ef4444 !important;
}

.btn-text-danger:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

.html-source-panel {
  padding: 0.75rem;
  background: var(--color-code-bg);
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
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 999px;
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
  /* Solusi baru untuk "toolbar tidak terjangkau saat teks panjang":
     BUKAN position:sticky (sempat menimbulkan editor jadi tidak
     responsif terhadap klik/ketik di beberapa kondisi) — area teks
     ini sendiri yang dibatasi tingginya dan discroll di dalam
     kotaknya sendiri. Toolbar & seluruh editor-container jadi selalu
     ada dalam batas tinggi yang wajar, tidak pernah ikut kescroll
     jauh oleh halaman. */
  max-height: 60vh;
  overflow-y: auto;
  color: var(--color-ink);
  caret-color: var(--color-accent);
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
  border: 1px solid var(--color-border);
  padding: 8px 10px;
  vertical-align: top;
}

.tiptap-editor :deep(th) {
  background-color: var(--color-accent-soft);
  font-weight: 600;
}

.tiptap-editor :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 0;
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
  border-radius: var(--radius);
  background: linear-gradient(90deg, #0284c7, #0ea5e9);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: var(--btn-glow);
}

.btn-save:hover:not(:disabled) {
  background: linear-gradient(90deg, #0369a1, #0284c7);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-cancel {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.25rem;
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  background: var(--glass-bg);
  color: var(--color-ink);
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: var(--color-accent-soft);
  color: var(--color-accent);
}
</style>
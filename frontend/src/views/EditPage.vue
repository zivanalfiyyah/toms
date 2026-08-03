<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Editor } from '@tiptap/core'
import { StarterKit } from '@tiptap/starter-kit'
import { TableKit } from '@tiptap/extension-table'
import { Image } from '@tiptap/extension-image'
import api from '../api'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  category: { type: String, required: true },
  page: { type: String, required: true },
  child: { type: String, default: null }
})

const router = useRouter()
const auth = useAuthStore()

// Kalau ada child -> lagi edit konten child. Kalau tidak -> lagi edit halaman "page" itu sendiri.
const backTo = props.child
  ? `/docs/${props.category}/${props.page}/${props.child}`
  : `/docs/${props.category}/${props.page}`

const pageId = ref(null)
const title = ref('')
const status = ref('draft')
const editorEl = ref(null)
const loading = ref(true)
const saving = ref(false)
const errorMessage = ref('')
const editorVersion = ref(0) 

let editor = null

onMounted(async () => {
  if (!auth.canEdit) {
    router.push(backTo)
    return
  }

  try {
    // Cari id halaman dari struktur kategori (category > page > child).
    const catRes = await api.get('/categories')
    const cat = catRes.data.find((c) => c.slug === props.category)
    const parentPage = cat?.pages?.find((p) => p.slug === props.page)
    // Kalau ada child slug, target-nya child. Kalau tidak, target-nya page itu sendiri.
    const target = props.child
      ? parentPage?.children?.find((c) => c.slug === props.child)
      : parentPage

    if (!target) {
      errorMessage.value = 'Halaman tidak ditemukan.'
      loading.value = false
      return
    }

    // Ambil isi lengkap (termasuk konten Tiptap JSON) lewat id halaman.
    const detailRes = await api.get(`/pages/${target.id}`)
    const detail = detailRes.data

    pageId.value = detail.id
    title.value = detail.title
    status.value = detail.status ?? 'draft'

    editor = new Editor({
      element: editorEl.value,
      extensions: [
        StarterKit,
        TableKit.configure({ table: { resizable: true } }),
        Image,
      ],
      content: detail.content ?? '',
      onTransaction: () => {
        editorVersion.value++
      },
    })
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Gagal memuat halaman.'
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  editor?.destroy()
})

async function handleSave() {
  if (!editor) return
  saving.value = true
  errorMessage.value = ''
  try {
    await api.put(`/pages/${pageId.value}`, {
      title: title.value,
      status: status.value,
      content: editor.getJSON(),
    })
    router.push(backTo)
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

.tiptap-editor {
  border: 1px solid var(--color-border); border-radius: 0 0 var(--radius) var(--radius);
  min-height: 300px; padding: 1rem; background: var(--color-bg);
}
.tiptap-editor :deep(.ProseMirror) { outline: none; min-height: 280px; }
.tiptap-editor :deep(table) { border-collapse: collapse; width: 100%; margin: 1rem 0; }
.tiptap-editor :deep(td), .tiptap-editor :deep(th) {
  border: 1px solid var(--color-border); padding: 0.4rem 0.6rem; min-width: 60px;
}
.tiptap-editor :deep(th) { background: var(--color-surface); font-weight: 600; }
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
          <button type="button" :class="{ 'is-active': editor?.isActive('bold') }" @click="editor.chain().focus().toggleBold().run()">Bold</button>
          <button type="button" :class="{ 'is-active': editor?.isActive('italic') }" @click="editor.chain().focus().toggleItalic().run()">Italic</button>
          <button type="button" :class="{ 'is-active': editor?.isActive('heading', { level: 2 }) }" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">H2</button>
          <button type="button" :class="{ 'is-active': editor?.isActive('bulletList') }" @click="editor.chain().focus().toggleBulletList().run()">List</button>
          <button type="button" :class="{ 'is-active': editor?.isActive('orderedList') }" @click="editor.chain().focus().toggleOrderedList().run()">1. List</button>
          <button type="button" :class="{ 'is-active': editor?.isActive('blockquote') }" @click="editor.chain().focus().toggleBlockquote().run()">Quote</button>
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
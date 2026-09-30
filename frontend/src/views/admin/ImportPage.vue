<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()

onMounted(() => {
  admin.error = null
  if (!admin.categories.length) admin.fetchCategories()
})

const mode = ref('create')

const form = reactive({
  categoryId: '',
  parentId: '',
  pageId: '',
  title: '',
  file: null,
})

const fileInputRef = ref(null)
const submitting = computed(() => admin.importSubmitting)
const errorMsg = ref('')
const result = ref(null) // { message, page }
const loadingPageTree = ref(false)

const topLevelPagesInSelectedCategory = computed(() => {
  const cat = admin.categories.find((c) => c.id === Number(form.categoryId))
  return cat?.pages || []
})

async function ensureChildrenLoaded(pages) {
  for (const p of pages || []) {
    if (p.children === undefined) {
      await admin.loadPageChildren(p)
    }
    if (p.children?.length) {
      await ensureChildrenLoaded(p.children)
    }
  }
}

watch(
  () => [form.categoryId, mode.value],
  async ([categoryId, currentMode]) => {
    if (currentMode === 'update' && categoryId) {
      loadingPageTree.value = true
      await ensureChildrenLoaded(topLevelPagesInSelectedCategory.value)
      loadingPageTree.value = false
    }
  }
)

function flattenPages(pages, depth = 0) {
  const flat = []
  for (const p of pages || []) {
    flat.push(depth === 0 ? p : { ...p, title: `${'— '.repeat(depth)}${p.title}` })
    flat.push(...flattenPages(p.children, depth + 1))
  }
  return flat
}

const pagesInSelectedCategory = computed(() => flattenPages(topLevelPagesInSelectedCategory.value))

function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function onFileChange(e) {
  const file = e.target.files?.[0] || null
  errorMsg.value = ''
  if (file && !file.name.toLowerCase().endsWith('.docx')) {
    errorMsg.value = 'File harus berformat .docx'
    form.file = null
    e.target.value = ''
    return
  }
  form.file = file
}

function switchMode(next) {
  mode.value = next
  form.pageId = ''
  errorMsg.value = ''
  result.value = null
}

function resetForm() {
  form.categoryId = ''
  form.parentId = ''
  form.pageId = ''
  form.title = ''
  form.file = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

async function submit() {
  errorMsg.value = ''
  result.value = null

  if (!form.file) {
    errorMsg.value = 'Pilih file .docx terlebih dahulu.'
    return
  }
  if (mode.value === 'create' && (!form.categoryId || !form.title)) {
    errorMsg.value = 'Kategori dan judul halaman wajib diisi.'
    return
  }
  if (mode.value === 'update' && !form.pageId) {
    errorMsg.value = 'Pilih halaman yang ingin diperbarui.'
    return
  }
  if (mode.value === 'category' && !form.categoryId) {
    errorMsg.value = 'Pilih kategori yang ingin diperbarui.'
    return
  }

  try {
    if (mode.value === 'create') {
      const data = await admin.importDocx({
        file: form.file,
        categoryId: form.categoryId,
        title: form.title,
        slug: slugify(form.title),
        parentId: form.parentId || null,
      })
      result.value = data
    } else if (mode.value === 'update') {
      const data = await admin.reimportDocx(form.pageId, {
        file: form.file,
        title: form.title || undefined,
        slug: form.title ? slugify(form.title) : undefined,
      })
      result.value = data
    } else {
      const data = await admin.importDocxToCategory(form.categoryId, {
        file: form.file,
      })
      result.value = data
    }
    resetForm()
  } catch (err) {
    errorMsg.value = err.response?.data?.error || err.response?.data?.message || 'Gagal mengimpor dokumen.'
  }
}
</script>

<template>
  <div class="import-page">
    <div class="page-head">
      <h2>Import Word</h2>
    </div>

    <div class="mode-tabs">
      <button
        type="button"
        class="tab"
        :class="{ active: mode === 'create' }"
        @click="switchMode('create')"
      >
        Buat Halaman Baru
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: mode === 'update' }"
        @click="switchMode('update')"
      >
        Update Halaman yang Ada
      </button>
      <button
        type="button"
        class="tab"
        :class="{ active: mode === 'category' }"
        @click="switchMode('category')"
      >
        Import ke Kategori
      </button>
    </div>

    <p v-if="admin.error" class="error">{{ admin.error }}</p>
    <p v-if="admin.categoriesLoading">Memuat kategori...</p>

    <form class="import-form" @submit.prevent="submit">
      <template v-if="mode === 'create'">
        <label>Kategori</label>
        <select v-model="form.categoryId" @change="form.parentId = ''" required>
          <option value="" disabled>Pilih kategori</option>
          <option v-for="cat in admin.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <label>Jadi Sub Halaman dari (opsional)</label>
        <select v-model="form.parentId" :disabled="!form.categoryId">
          <option value="">Tidak — halaman tingkat utama</option>
          <option v-for="p in topLevelPagesInSelectedCategory" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>

        <label>Judul Halaman</label>
        <input v-model="form.title" type="text" placeholder="Judul halaman baru" required />
      </template>

      <template v-else-if="mode === 'update'">
        <label>Kategori</label>
        <select v-model="form.categoryId" @change="form.pageId = ''">
          <option value="" disabled>Pilih kategori</option>
          <option v-for="cat in admin.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <label>Halaman yang akan diperbarui</label>
        <select v-model="form.pageId" :disabled="!form.categoryId || loadingPageTree" required>
          <option value="" disabled>{{ loadingPageTree ? 'Memuat daftar halaman...' : 'Pilih halaman' }}</option>
          <option v-for="p in pagesInSelectedCategory" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
        <p v-if="form.categoryId && !loadingPageTree && !pagesInSelectedCategory.length" class="hint">
          Belum ada halaman di kategori ini.
        </p>

        <label>Judul Baru (opsional, kosongkan jika tidak berubah)</label>
        <input v-model="form.title" type="text" placeholder="Judul halaman" />
      </template>

      <template v-else>
        <label>Kategori yang akan diperbarui</label>
        <select v-model="form.categoryId" required>
          <option value="" disabled>Pilih kategori</option>
          <option v-for="cat in admin.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
        <p class="hint">
          Dokumen akan diimpor sebagai konten kategori ini, bukan sebagai halaman terpisah.
        </p>
      </template>

      <label>File Word (.docx, maks 10MB)</label>
      <input ref="fileInputRef" type="file" accept=".docx" @change="onFileChange" required />

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-if="result" class="success">
        {{ result.message }}<span v-if="result.page"> — "{{ result.page.title }}"</span>
      </p>

      <button type="submit" class="btn-primary" :disabled="submitting">
        {{
          submitting
            ? 'Mengimpor...'
            : mode === 'create'
              ? 'Import sebagai Halaman Baru'
              : mode === 'update'
                ? 'Update Halaman'
                : 'Import ke Kategori'
        }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
.page-head h2 { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; margin: 0; }

.btn-primary {
  background: linear-gradient(90deg, #0284c7, #0ea5e9); color: #fff; border: none; border-radius: var(--radius);
  box-shadow: var(--btn-glow); font-weight: 700; cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease;
  padding: 0.6rem 1.15rem; font-size: 0.82rem;
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.btn-secondary {
  background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius);
  padding: 0.6rem 1.1rem; font-size: 0.82rem; font-weight: 600; cursor: pointer; color: var(--color-ink);
  transition: background 0.15s ease, color 0.15s ease;
}
.btn-secondary:hover { background: var(--color-accent-soft); color: var(--color-accent); }
.btn-link { background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: 0.8rem; font-weight: 600; padding: 0; }
.btn-link:hover:not(:disabled) { text-decoration: underline; }
.btn-link:disabled { opacity: 0.35; cursor: not-allowed; }
.btn-link.danger { color: #ef4444; }

.mode-tabs {
  display: inline-flex; flex-wrap: wrap; gap: 4px; padding: 4px; margin-bottom: 1.25rem;
  background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: 999px;
}
.tab {
  background: none; border: 1px solid transparent; border-radius: 999px;
  padding: 0.5rem 1.1rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: var(--color-ink-soft);
  transition: background 0.15s ease, color 0.15s ease;
}
.tab:hover { color: var(--color-ink); }
.tab.active {
  background: var(--color-accent-soft); color: var(--color-accent);
  border-color: var(--color-accent-border); box-shadow: var(--glow-active);
}

.import-form {
  background: var(--glass-bg); border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-card); padding: 1.6rem; max-width: 520px;
}
.import-form label { display: block; font-size: 0.78rem; font-weight: 600; color: var(--color-ink-soft); margin: 0 0 0.35rem; }
.import-form input, .import-form select {
  width: 100%; padding: 0.6rem 0.8rem; margin-bottom: 1rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  background: var(--input-bg); color: var(--color-ink); font-size: 0.87rem; font-family: inherit;
}
.import-form input[type='file'] { padding: 0.45rem 0.55rem; }
.import-form input[type='file']::file-selector-button {
  margin-right: 0.75rem; padding: 0.35rem 0.85rem; border: 1px solid var(--color-accent-border);
  border-radius: 999px; background: var(--color-accent-soft); color: var(--color-accent);
  font-size: 0.78rem; font-weight: 600; cursor: pointer; font-family: inherit;
}

.hint { color: var(--color-ink-soft); font-size: 0.78rem; margin: -0.5rem 0 0.9rem; }
.success {
  color: #10b981; background: rgba(16, 185, 129, 0.09); border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: var(--radius); padding: 0.65rem 0.85rem; font-size: 0.82rem; margin-bottom: 0.9rem;
}

input:focus, select:focus, textarea:focus {
  outline: none; border-color: var(--color-accent-border); box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.error {
  color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: var(--radius); padding: 0.65rem 0.85rem; font-size: 0.82rem; margin-bottom: 0.9rem;
}
</style>
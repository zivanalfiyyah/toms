<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useAdminStore } from '../../stores/admin'

const admin = useAdminStore()

onMounted(() => {
  admin.error = null
  if (!admin.categories.length) admin.fetchCategories()
})

// 'create' = import jadi halaman baru, 'update' = re-import ke halaman yang sudah ada
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

const topLevelPagesInSelectedCategory = computed(() => {
  const cat = admin.categories.find((c) => c.id === Number(form.categoryId))
  return cat?.pages || []
})

const pagesInSelectedCategory = computed(() => {
  const pages = topLevelPagesInSelectedCategory.value
  const flat = []
  for (const p of pages) {
    flat.push(p)
    for (const child of p.children || []) {
      flat.push({ ...child, title: `— ${child.title}` })
    }
  }
  return flat
})

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
    } else {
      const data = await admin.reimportDocx(form.pageId, {
        file: form.file,
        title: form.title || undefined,
        slug: form.title ? slugify(form.title) : undefined,
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

      <template v-else>
        <label>Kategori</label>
        <select v-model="form.categoryId" @change="form.pageId = ''">
          <option value="" disabled>Pilih kategori</option>
          <option v-for="cat in admin.categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>

        <label>Halaman yang akan diperbarui</label>
        <select v-model="form.pageId" :disabled="!form.categoryId" required>
          <option value="" disabled>Pilih halaman</option>
          <option v-for="p in pagesInSelectedCategory" :key="p.id" :value="p.id">{{ p.title }}</option>
        </select>
        <p v-if="form.categoryId && !pagesInSelectedCategory.length" class="hint">
          Belum ada halaman di kategori ini.
        </p>

        <label>Judul Baru (opsional, kosongkan jika tidak berubah)</label>
        <input v-model="form.title" type="text" placeholder="Judul halaman" />
      </template>

      <label>File Word (.docx, maks 10MB)</label>
      <input ref="fileInputRef" type="file" accept=".docx" @change="onFileChange" required />

      <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
      <p v-if="result" class="success">
        {{ result.message }}<span v-if="result.page"> — "{{ result.page.title }}"</span>
      </p>

      <button type="submit" class="btn-primary" :disabled="submitting">
        {{ submitting ? 'Mengimpor...' : mode === 'create' ? 'Import sebagai Halaman Baru' : 'Update Halaman' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-head h2 { font-size: 1.1rem; margin: 0; }

.mode-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
.tab {
  background: none; border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 0.5rem 1rem; font-size: 0.85rem; cursor: pointer; color: var(--color-ink-soft);
}
.tab.active { background: var(--color-accent-soft); color: var(--color-accent); font-weight: 600; border-color: var(--color-accent); }

.import-form {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 1.25rem; max-width: 480px;
}
.import-form label { display: block; font-size: 0.82rem; color: var(--color-ink-soft); margin: 0 0 0.3rem; }
.import-form input,
.import-form select {
  width: 100%; padding: 0.5rem 0.65rem; margin-bottom: 0.9rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  background: var(--color-bg); color: var(--color-ink); font-size: 0.87rem;
}
.import-form input[type='file'] { padding: 0.4rem 0.5rem; }

.hint { color: var(--color-ink-soft); font-size: 0.78rem; margin: -0.5rem 0 0.9rem; }

.btn-primary {
  background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius);
  padding: 0.55rem 1.1rem; font-weight: 600; font-size: 0.85rem; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.error {
  color: #d33; background: rgba(211,51,51,0.06); border: 1px solid #d33;
  border-radius: var(--radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 0.9rem;
}
.success {
  color: #1a7f37; background: rgba(26,127,55,0.07); border: 1px solid #1a7f37;
  border-radius: var(--radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 0.9rem;
}
</style>
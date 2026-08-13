<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useAdminStore } from '../../stores/admin'
import AdminPageTreeItem from '../../components/admin/AdminPageTreeItem.vue'

const admin = useAdminStore()

onMounted(() => {
  admin.fetchCategories()
})

// ---- Category form ----
const showCatForm = ref(false)
const editingCatId = ref(null)
const catForm = reactive({ name: '', slug: '', icon: '', insertBeforeId: '' })
const catSaving = ref(false)
const catError = ref('')

function openCreateCategory() {
  editingCatId.value = null
  catForm.name = ''
  catForm.slug = ''
  catForm.icon = ''
  catForm.insertBeforeId = ''
  catError.value = ''
  showCatForm.value = true
}

function openEditCategory(cat) {
  editingCatId.value = cat.id
  catForm.name = cat.name || ''
  catForm.slug = cat.slug || ''
  catForm.icon = cat.icon || ''
  catForm.insertBeforeId = ''
  catError.value = ''
  showCatForm.value = true
}

async function submitCategory() {
  catSaving.value = true
  catError.value = ''
  try {
    if (editingCatId.value) {
      await admin.updateCategory(editingCatId.value, {
        name: catForm.name,
        slug: catForm.slug,
        icon: catForm.icon,
      })
      if (catForm.insertBeforeId) {
        await admin.moveCategoryTo(editingCatId.value, catForm.insertBeforeId)
      }
    } else {
      await admin.createCategory(
        { name: catForm.name, slug: catForm.slug, icon: catForm.icon },
        catForm.insertBeforeId || null
      )
    }
    showCatForm.value = false
  } catch (err) {
    catError.value = err.response?.data?.message || err.message || 'Gagal menyimpan kategori.'
  } finally {
    catSaving.value = false
  }
}

async function removeCategory(cat) {
  if (!confirm(`Hapus kategori "${cat.name}"? Semua halaman di dalamnya juga akan terhapus.`)) return
  try {
    await admin.deleteCategory(cat.id)
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus kategori.')
  }
}

async function moveCategory(cat, direction) {
  try {
    await admin.reorderCategory(cat.id, direction)
  } catch (err) {
    alert(err.response?.data?.message || err.message || 'Gagal mengubah urutan kategori.')
  }
}

// ---- Page form (juga dipakai untuk anak halaman) ----
const showPageForm = ref(false)
const editingPage = ref(null)
const activeCategoryForPage = ref(null)
const activeParentForPage = ref(null)
const pageForm = reactive({ title: '', slug: '', description: '' })
const pageSaving = ref(false)
const pageError = ref('')

function openCreatePage(cat) {
  activeCategoryForPage.value = cat
  activeParentForPage.value = null
  editingPage.value = null
  pageForm.title = ''
  pageForm.slug = ''
  pageForm.description = ''
  pageError.value = ''
  showPageForm.value = true
}

function openCreateChildPage(cat, page) {
  activeCategoryForPage.value = cat
  activeParentForPage.value = page
  editingPage.value = null
  pageForm.title = ''
  pageForm.slug = ''
  pageForm.description = ''
  pageError.value = ''
  showPageForm.value = true
}

function openEditPage(cat, page) {
  activeCategoryForPage.value = cat
  activeParentForPage.value = null
  editingPage.value = page
  pageForm.title = page.title || ''
  pageForm.slug = page.slug || ''
  pageForm.description = page.description || ''
  pageError.value = ''
  showPageForm.value = true
}

async function submitPage() {
  pageSaving.value = true
  pageError.value = ''
  try {
    if (editingPage.value) {
      await admin.updatePage(editingPage.value.id, { ...pageForm })
    } else {
      await admin.createPage(activeCategoryForPage.value.id, {
        ...pageForm,
        parent_id: activeParentForPage.value?.id ?? null,
      })
    }
    showPageForm.value = false
  } catch (err) {
    pageError.value = err.response?.data?.message || 'Gagal menyimpan halaman.'
  } finally {
    pageSaving.value = false
  }
}

async function removePage(page) {
  if (!confirm(`Hapus halaman "${page.title}"?`)) return
  try {
    await admin.deletePage(page.id)
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus halaman.')
  }
}
</script>

<template>
  <div class="categories-page">
    <div class="page-head">
      <h2>Kategori & Halaman</h2>
      <button class="btn-primary" @click="openCreateCategory">+ Tambah Kategori</button>
    </div>

    <p v-if="admin.error" class="error">{{ admin.error }}</p>
    <p v-if="admin.categoriesLoading">Memuat...</p>

    <div v-for="(cat, catIdx) in admin.categories" :key="cat.id" class="category-block">
      <div class="category-head">
        <h3>{{ cat.name }} <span class="slug">/{{ cat.slug }}</span></h3>
        <div class="actions">
          <button
            class="btn-link"
            title="Naikkan urutan"
            :disabled="catIdx === 0"
            @click="moveCategory(cat, 'up')"
          >↑</button>
          <button
            class="btn-link"
            title="Turunkan urutan"
            :disabled="catIdx === admin.categories.length - 1"
            @click="moveCategory(cat, 'down')"
          >↓</button>
          <button class="btn-link" @click="openCreatePage(cat)">+ Halaman</button>
          <button class="btn-link" @click="openEditCategory(cat)">Edit</button>
          <button class="btn-link danger" @click="removeCategory(cat)">Hapus</button>
        </div>
      </div>

      <ul v-if="cat.pages?.length" class="page-list">
        <AdminPageTreeItem
          v-for="page in cat.pages"
          :key="page.id"
          :cat="cat"
          :page="page"
          @add-child="openCreateChildPage"
          @edit="openEditPage"
          @remove="removePage"
        />
      </ul>
      <p v-else class="empty">Belum ada halaman di kategori ini.</p>
    </div>

    <p v-if="!admin.categoriesLoading && !admin.categories.length" class="empty">Belum ada kategori.</p>

    <!-- Category modal -->
    <div v-if="showCatForm" class="modal-overlay" @click.self="showCatForm = false">
      <div class="modal">
        <h3>{{ editingCatId ? 'Edit Kategori' : 'Tambah Kategori' }}</h3>
        <form @submit.prevent="submitCategory">
          <label>Nama Kategori</label>
          <input v-model="catForm.name" type="text" required />
          <label>Slug</label>
          <input v-model="catForm.slug" type="text" required />
          <label>Icon (opsional, nama key dari icons/index.js)</label>
          <input v-model="catForm.icon" type="text" />
          <label>{{ editingCatId ? 'Pindahkan sebelum (opsional)' : 'Sisipkan sebelum (opsional)' }}</label>
          <select v-model="catForm.insertBeforeId">
            <option value="">{{ editingCatId ? 'Tidak — biarkan posisi sekarang' : 'Tidak — taruh di paling bawah' }}</option>
            <option
              v-for="c in admin.categories.filter((c) => c.id !== editingCatId)"
              :key="c.id"
              :value="c.id"
            >{{ c.name }}</option>
          </select>
          <p v-if="catError" class="error">{{ catError }}</p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showCatForm = false">Batal</button>
            <button type="submit" class="btn-primary" :disabled="catSaving">
              {{ catSaving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Page modal -->
    <div v-if="showPageForm" class="modal-overlay" @click.self="showPageForm = false">
      <div class="modal">
        <h3>
          {{ editingPage ? 'Edit Halaman' : (activeParentForPage ? `Tambah Sub Halaman — ${activeParentForPage.title}` : 'Tambah Halaman') }}
          <template v-if="!editingPage && !activeParentForPage"> — {{ activeCategoryForPage?.name }}</template>
        </h3>
        <form @submit.prevent="submitPage">
          <label>Judul Halaman</label>
          <input v-model="pageForm.title" type="text" required />
          <label>Slug</label>
          <input v-model="pageForm.slug" type="text" required />
          <label>Deskripsi (opsional)</label>
          <input v-model="pageForm.description" type="text" />
          <p v-if="pageError" class="error">{{ pageError }}</p>
          <div class="modal-actions">
            <button type="button" class="btn-secondary" @click="showPageForm = false">Batal</button>
            <button type="submit" class="btn-primary" :disabled="pageSaving">
              {{ pageSaving ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.page-head h2 { font-size: 1.1rem; margin: 0; }

.btn-primary {
  background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius);
  padding: 0.5rem 1rem; font-weight: 600; font-size: 0.85rem; cursor: pointer;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary {
  background: none; border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 0.5rem 1rem; font-size: 0.85rem; cursor: pointer; color: var(--color-ink);
}
.btn-link { background: none; border: none; color: var(--color-accent); cursor: pointer; font-size: 0.8rem; padding: 0; margin-left: 0.75rem; }
.btn-link.danger { color: #d33; }

.category-block {
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); padding: 1rem 1.25rem; margin-bottom: 1rem;
}
.category-head { display: flex; align-items: center; justify-content: space-between; }
.category-head h3 { margin: 0; font-size: 0.98rem; }
.slug { color: var(--color-ink-soft); font-size: 0.78rem; font-weight: 400; }

.page-list { list-style: none; margin: 0.75rem 0 0; padding: 0; }
.page-list > li { padding: 0.4rem 0; border-top: 1px dashed var(--color-border); }
.page-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; }

.child-list { list-style: none; margin: 0.35rem 0 0.15rem; padding: 0 0 0 1.25rem; }
.child-list li {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.3rem 0; font-size: 0.8rem; color: var(--color-ink-soft);
  border-top: 1px dotted var(--color-border);
}

.empty { color: var(--color-ink-soft); font-size: 0.85rem; margin-top: 0.75rem; }

.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal {
  background: var(--color-surface); border-radius: var(--radius);
  padding: 1.5rem; width: 100%; max-width: 420px; border: 1px solid var(--color-border);
}
.modal h3 { margin: 0 0 1rem; font-size: 1rem; }
.modal label { display: block; font-size: 0.82rem; color: var(--color-ink-soft); margin: 0 0 0.3rem; }
.modal input,
.modal select {
  width: 100%; padding: 0.5rem 0.65rem; margin-bottom: 0.9rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  background: var(--color-bg); color: var(--color-ink); font-size: 0.87rem;
}
.modal-actions { display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.5rem; }

.error {
  color: #d33; background: rgba(211,51,51,0.06); border: 1px solid #d33;
  border-radius: var(--radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 0.9rem;
}
</style>
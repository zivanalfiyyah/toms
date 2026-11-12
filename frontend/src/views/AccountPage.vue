<script setup>
import { computed, onMounted, reactive, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useLikesStore } from '../stores/likes'

const auth = useAuthStore()
const likes = useLikesStore()
const route = useRoute()
const router = useRouter()

const editing = ref(false)
const saving = ref(false)
const msg = ref('')
const err = ref('')
const f = reactive({ name: '', current: '', password: '', confirm: '' })

const initials = computed(() =>
  (auth.user?.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
)
const roleLabel = computed(() => ({ admin: 'Admin', editor: 'Editor', viewer: 'Viewer' }[auth.roleNames[0]] || 'Viewer'))

onMounted(async () => {
  try { await likes.fetch() } catch (e) { /* tampil kosong */ }
  if (route.name === 'account-likes') {
    await nextTick()
    document.getElementById('disukai')?.scrollIntoView({ behavior: 'smooth' })
  }
})

function startEdit() {
  Object.assign(f, { name: auth.user?.name || '', current: '', password: '', confirm: '' })
  err.value = ''
  msg.value = ''
  editing.value = true
}

async function save() {
  err.value = ''
  msg.value = ''
  saving.value = true
  try {
    if (f.name && f.name !== auth.user?.name) await auth.updateProfile(f.name)
    if (f.password) {
      if (f.password !== f.confirm) throw { local: 'Konfirmasi password baru tidak sama.' }
      await auth.updatePassword(f.current, f.password, f.confirm)
    }
    msg.value = 'Perubahan disimpan.'
    editing.value = false
  } catch (e) {
    const errs = e.response?.data?.errors
    err.value = e.local || (errs ? Object.values(errs)[0][0] : (e.response?.data?.message || 'Gagal menyimpan.'))
  } finally {
    saving.value = false
  }
}

const docPath = (it) => `/docs/${it.category?.slug}/${it.slug}`
async function remove(it) { try { await likes.unlike(it.id) } catch (e) { /* abaikan */ } }
</script>

<template>
  <div class="dz">
    <main class="acct-page">
      <div class="shell acct">
        <div class="acct-head">
          <span class="acct-av">{{ initials }}</span>
          <div class="acct-info">
            <h1>{{ auth.user?.name }}<em>{{ roleLabel }}</em></h1>
            <p>{{ auth.user?.email }}</p>
            <div class="acct-stats"><b>{{ likes.count }}</b> Disukai</div>
            <div class="acct-btns">
              <button type="button" class="outline-btn" @click="startEdit">Edit profil</button>
              <button v-if="auth.canEdit" type="button" class="outline-btn" @click="router.push('/admin')">Panel Admin</button>
            </div>
          </div>
        </div>

        <p v-if="msg" class="acct-msg">{{ msg }}</p>

        <form v-if="editing" class="acct-form" @submit.prevent="save">
          <label>Nama lengkap<input v-model="f.name" required /></label>
          <label>Email<input :value="auth.user?.email" type="email" disabled /></label>
          <label>Password saat ini (jika mengganti password)<input v-model="f.current" type="password" autocomplete="current-password" /></label>
          <label>Password baru (opsional)<input v-model="f.password" type="password" minlength="8" autocomplete="new-password" /></label>
          <label>Ulangi password baru<input v-model="f.confirm" type="password" autocomplete="new-password" /></label>
          <p v-if="err" class="login-error">{{ err }}</p>
          <div class="acct-btns">
            <button type="submit" class="annex-link" :disabled="saving">{{ saving ? 'Menyimpan…' : 'Simpan' }}</button>
            <button type="button" class="link-btn" @click="editing = false">Batal</button>
          </div>
        </form>

        <h2 id="disukai" class="acct-tab">Disukai ({{ likes.count }})</h2>
        <p v-if="!likes.count" class="docs-empty">Belum ada dokumen yang disukai. Buka halaman dokumentasi lalu tekan “Suka”.</p>
        <ol v-else class="annex-list">
          <li v-for="it in likes.items" :key="it.id" class="like-row">
            <button type="button" class="annex-row" @click="router.push(docPath(it))">
              <span>{{ it.title }}<small>{{ it.category?.name }}</small></span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5"></path></svg>
            </button>
            <button type="button" class="link-btn" @click="remove(it)">Hapus</button>
          </li>
        </ol>
      </div>
    </main>
  </div>
</template>

<style>
.dz .acct-msg { margin: 14px 0 0; color: #15803d; font-size: 14px; }
.dz .acct-form input:disabled { opacity: .6; cursor: not-allowed; }
</style>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const f = reactive({ name: '', email: '', company_code: '', password: '', password_confirmation: '' })
const loading = ref(false)
const error = ref('')
const done = ref(false)

async function submit() {
  error.value = ''
  if (f.password !== f.password_confirmation) {
    error.value = 'Konfirmasi password tidak sama.'
    return
  }
  loading.value = true
  try {
    await auth.register({ ...f })
    done.value = true
  } catch (e) {
    const errs = e.response?.data?.errors
    error.value = errs ? Object.values(errs)[0][0] : (e.response?.data?.message || 'Pendaftaran gagal. Coba lagi.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="dz">
    <main class="login-page">
      <div class="login-card">
        <template v-if="done">
          <span class="eyebrow">PENDAFTARAN</span>
          <h1>Pendaftaran terkirim</h1>
          <p>Akun <b>{{ f.email }}</b> akan aktif setelah disetujui admin. Anda bisa masuk setelah persetujuan diberikan.</p>
          <button type="button" class="login-submit" @click="router.push('/login')">Ke halaman masuk</button>
        </template>
        <template v-else>
          <span class="eyebrow">PENDAFTARAN</span>
          <h1>Daftar akun</h1>
          <p>Akun baru berperan Viewer dan aktif setelah disetujui admin.</p>
          <form @submit.prevent="submit">
            <label>Nama lengkap<input v-model="f.name" required autocomplete="name" /></label>
            <label>Email<input v-model="f.email" type="email" required autocomplete="username" /></label>
            <label>Kode perusahaan<input v-model="f.company_code" required autocomplete="off" placeholder="Diberikan oleh admin / HR" /></label>
            <label>Password (min. 8 karakter)<input v-model="f.password" type="password" minlength="8" required autocomplete="new-password" /></label>
            <label>Ulangi password<input v-model="f.password_confirmation" type="password" minlength="8" required autocomplete="new-password" /></label>
            <p v-if="error" class="login-error">{{ error }}</p>
            <button type="submit" class="login-submit" :disabled="loading">{{ loading ? 'Memproses...' : 'Daftar' }}</button>
          </form>
          <p class="login-alt">Sudah punya akun? <button type="button" class="link-btn" @click="router.push('/login')">Masuk</button></p>
        </template>
      </div>
    </main>
  </div>
</template>

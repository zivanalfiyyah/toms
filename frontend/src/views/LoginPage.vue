<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const showPass = ref(false)

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const noticeMessage = route.query.reason === 'login-required'
  ? 'Kamu harus login dulu untuk mengubah halaman ini.'
  : ''

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirectTo = route.query.redirect || (auth.roleNames.includes('admin') ? '/admin' : '/')
    router.push(redirectTo)
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Email atau password salah.'
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="dz">
    <main class="login-page">
      <div class="login-card">
        <span class="eyebrow">AKSES PENGGUNA</span>
        <h1>Masuk ke TOMS</h1>
        <p>Gunakan akun TOMS Anda untuk mengakses fitur sesuai peran.</p>
        <p v-if="noticeMessage" class="login-notice">{{ noticeMessage }}</p>
        <form @submit.prevent="handleSubmit">
          <label>Email
            <input v-model="email" type="email" required autocomplete="username" />
          </label>
          <label>Password
            <span class="login-pass">
              <input v-model="password" :type="showPass ? 'text' : 'password'" required autocomplete="current-password" />
              <button type="button" @click="showPass = !showPass">{{ showPass ? 'Sembunyikan' : 'Tampilkan' }}</button>
            </span>
          </label>
          <p v-if="errorMessage" class="login-error">{{ errorMessage }}</p>
          <button type="submit" class="login-submit" :disabled="loading">{{ loading ? 'Memproses...' : 'Masuk' }}</button>
        </form>
        <p class="login-alt">Belum punya akun? <button type="button" class="link-btn" @click="router.push('/daftar')">Daftar</button></p>
      </div>
    </main>
  </div>
</template>

<style>
.dz .login-notice { margin: 0 0 16px !important; padding: 10px 14px; border-radius: 12px; background: var(--gold-soft); color: var(--gold-ink) !important; font-size: 13px !important; }
.dz .login-error { margin: 0; padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(239, 68, 68, .4); background: rgba(239, 68, 68, .08); color: #dc2626; font-size: 13px; }
.dz .login-submit:hover:not(:disabled) { background: var(--gold-2); }
.dz .login-submit:disabled { opacity: .6; cursor: not-allowed; }
</style>

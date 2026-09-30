<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

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

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; /* glow latar dari main.css tampil */
  padding: 1.5rem;
}
.login-wrap {
  width: 100%;
  max-width: 400px;
  padding: 2.25rem 2rem 2rem;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
}
[data-theme='dark'] .login-wrap { border-color: var(--color-accent-border); }
h1 { font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; text-align: center; margin: 0 0 1.6rem; }
label { display: block; font-size: 0.78rem; font-weight: 600; margin: 0 0 0.35rem; color: var(--color-ink-soft); }
input {
  width: 100%; padding: 0.7rem 0.9rem; margin-bottom: 1rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  background: var(--input-bg); color: var(--color-ink); font-size: 0.9rem; font-family: inherit;
}
input:focus { outline: none; border-color: var(--color-accent-border); box-shadow: 0 0 0 3px var(--color-accent-soft); }
button {
  width: 100%; padding: 0.75rem; background: linear-gradient(90deg, #0284c7, #0ea5e9); color: #fff; border: none; border-radius: var(--radius);
  box-shadow: var(--btn-glow); font-weight: 700; cursor: pointer; transition: transform 0.15s ease, filter 0.15s ease; font-size: 0.88rem; margin-top: 0.25rem;
}
button:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
button:disabled { opacity: 0.6; cursor: not-allowed; box-shadow: none; }
.error {
  color: #ef4444; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: var(--radius); padding: 0.6rem 0.8rem; font-size: 0.82rem; margin-bottom: 1rem;
}
.notice {
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border: 1px solid var(--color-accent-border);
  border-radius: var(--radius);
  font-size: 0.82rem;
  padding: 0.65rem 0.85rem;
  margin-bottom: 1.1rem;
}
.request-access-link {
  text-align: center;
  font-size: 0.82rem;
  color: var(--color-ink-soft);
  margin: 1.4rem 0 0;
}
.request-access-link a { color: var(--color-accent); font-weight: 700; }
</style>

<template>
  <div class="login-page">
    <div class="login-wrap">
      <img src="/toms-logo-header.png" alt="TOMS" class="auth-logo" />
      <h1>Login TOMS</h1>
      <p v-if="noticeMessage" class="notice">{{ noticeMessage }}</p>
      <form @submit.prevent="handleSubmit">
        <label for="email">Email</label>
        <input id="email" v-model="email" type="email" required autocomplete="username" />

        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" required autocomplete="current-password" />

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>

      <p class="request-access-link">
        Belum punya akses? <router-link to="/request-access">Minta akses di sini</router-link>
      </p>
    </div>
  </div>
</template>
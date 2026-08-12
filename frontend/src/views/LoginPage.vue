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
  background: var(--color-bg);
  padding: 1.5rem;
}
.login-wrap {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  background: var(--color-surface);
}
h1 { font-size: 1.3rem; margin: 0 0 1.5rem; }
label { display: block; font-size: 0.85rem; margin: 0 0 0.3rem; color: var(--color-ink-soft); }
input {
  width: 100%; padding: 0.55rem 0.7rem; margin-bottom: 1rem;
  border: 1px solid var(--color-border); border-radius: var(--radius);
  background: var(--color-bg); color: var(--color-ink); font-size: 0.9rem;
}
button {
  width: 100%; padding: 0.6rem; border: none; border-radius: var(--radius);
  background: var(--color-accent); color: #fff; font-weight: 600; cursor: pointer;
}
button:disabled { opacity: 0.6; cursor: not-allowed; }
.error { color: #d33; font-size: 0.85rem; margin-bottom: 1rem; }
.notice {
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border-radius: var(--radius);
  font-size: 0.85rem;
  padding: 0.6rem 0.8rem;
  margin-bottom: 1rem;
}
.request-access-link {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  margin-top: 1.2rem;
}
.request-access-link a {
  color: var(--color-accent);
  font-weight: 600;
}
</style>

<template>
  <div class="login-page">
    <div class="login-wrap">
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
import { defineStore } from 'pinia'

// Pop-up global "Anda harus login terlebih dahulu".
export const useUiStore = defineStore('ui', {
  state: () => ({ loginPrompt: false, redirect: '' }),
  actions: {
    promptLogin(redirect = '') { this.redirect = redirect; this.loginPrompt = true },
    close() { this.loginPrompt = false }
  }
})

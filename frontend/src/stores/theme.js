import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        dark: false
    }),
    actions: {
        init() {
            const saved = localStorage.getItem('toms-theme')
            this.dark =  saved === 'dark'
        },
        
        toggle() {
            this.dark = !this.dark
            localStorage.setItem('toms-theme', this.dark ? 'dark' : 'light')
            this.apply()
        },
        apply() {
            document.documentElement.setAttribute('data-theme', this.dark ? 'dark' : 'light')
        }
    }
})
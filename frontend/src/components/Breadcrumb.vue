<script setup>
defineProps({ segments: { type: Array, required: true } })
</script>

<style scoped>
.breadcrumb { font-family: var(--font-body); font-size: 0.75rem; color: var(--color-ink-soft); margin: 0 0 1rem; }
.breadcrumb a { color: var(--color-ink-soft); }
.breadcrumb .sep { margin: 0 0.35rem; color: var(--color-border); }
.breadcrumb .current { color: var(--color-accent); font-weight: 600; }
</style>

<template>
    <p class="breadcrumb">
        <router-link to="/">docs</router-link>
        <span v-for="(seg, i) in segments" :key="i">
            <span class="sep">/</span>
            <span :class="{ current:i === segments.length - 1 }">{{ seg }}</span>
        </span>
    </p>
</template>
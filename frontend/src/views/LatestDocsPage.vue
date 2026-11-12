<script setup>
import LatestDocs from '../components/LatestDocs.vue'
</script>

<template>
  <div class="dz">
    <section class="page-hero">
      <div class="shell">
        <div>
          <span class="eyebrow light">AUDIT DOKUMEN</span>
          <h1>Dokumen Terbaru</h1>
          <p>Setiap kategori atau halaman yang ditambahkan maupun diperbarui tercatat di sini lengkap dengan nomor revisinya.</p>
        </div>
      </div>
    </section>
    <section class="section shell"><LatestDocs :limit="12" paginate /></section>
  </div>
</template>

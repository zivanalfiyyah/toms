// Isi halaman "Panduan Penggunaan TOMS" (sumber: PANDUAN PENGGUNA TOMS.docx).
export const guide = {
  title: 'Panduan Pengguna TOMS',
  subtitle: 'Transport Operational Management System',
  sections: [
    {
      title: '1. Tujuan',
      paragraphs: [
        'Panduan ini membantu pengguna mengakses dan memanfaatkan TOMS sebagai pusat informasi kebijakan, SOP, KPI, SLA, formulir, dan standar operasional perusahaan.',
      ],
    },
    {
      title: '2. Panduan Penggunaan',
      terms: [
        ['Beranda', 'Akses kategori dokumen, dokumen terbaru, dan fitur akses cepat.'],
        ['Dokumentasi', 'Cari, baca, dan unduh SOP, kebijakan, formulir, serta dokumen resmi sesuai kebutuhan kerja.'],
        ['Dashboard', 'Pantau indikator kinerja, kepatuhan, keselamatan, dan operasional sesuai hak akses.'],
        ['Informasi', 'Baca pengumuman, pembaruan SOP, jadwal pelatihan, dan informasi perusahaan.'],
        ['Bantuan', 'Gunakan Pusat FAQ atau hubungi administrator apabila mengalami kendala.'],
        ['Pencarian', 'Masukkan judul, kata kunci, kategori, atau nomor dokumen untuk menemukan informasi dengan cepat.'],
      ],
    },
    {
      title: '3. Ketentuan Penggunaan',
      bullets: [
        'Gunakan dokumen resmi dengan status dan revisi yang masih berlaku.',
        'Patuhi SOP sesuai tugas dan tanggung jawab masing-masing.',
        'Jaga kerahasiaan akun serta informasi perusahaan.',
        'Laporkan kendala teknis, ketidaksesuaian, atau kebutuhan klarifikasi melalui kanal resmi.',
      ],
    },
    {
      title: '4. Prinsip Utama',
      paragraphs: [
        'Pahami standar, laksanakan prosedur, ukur kinerja, dan lakukan perbaikan berkelanjutan.',
        'TOMS mendukung terciptanya operasional transportasi yang aman, profesional, konsisten, dan terpercaya.',
      ],
    },
  ],
}

// Isi kartu "Jenis kendala" & "Informasi yang perlu disampaikan" di Pusat Bantuan
// (sumber: LAPORKAN KENDALA TEKNIS TOMS.docx).
export const reportGuide = {
  kinds: [
    ['Akses Akun', 'gagal login atau akun tidak dapat diakses.'],
    ['Dokumentasi', 'dokumen tidak ditemukan, gagal dibuka, atau tidak dapat diunduh.'],
    ['Dashboard', 'data tidak tampil atau informasi tidak sesuai.'],
    ['Fungsi Sistem', 'tombol, pencarian, atau menu tidak berfungsi.'],
    ['Gangguan Lainnya', 'portal lambat, mengalami error, atau tidak dapat diakses.'],
  ],
  required: [
    'Nama pelapor dan unit kerja.',
    'Tanggal dan waktu kejadian.',
    'Menu atau fitur yang mengalami kendala.',
    'Uraian kendala dan langkah yang telah dilakukan.',
    'Pesan kesalahan atau tangkapan layar, jika tersedia.',
  ],
}

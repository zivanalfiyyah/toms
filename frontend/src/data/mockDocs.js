export const categories = [
  {
    id: 1,
    title: 'Pengenalan TOMS',
    slug: 'pengenalan-toms',
    icon: 'book',
    description: 'Fondasi, filosofi, visi, misi...',
    order: 0,
    pages: [
      {
        id: 101,
        title: 'Filosofi TOMS',
        slug: 'filosofi-toms',
        description: 'Prinsip dasar TOMS...',
        children: [
          { id: 1011, title: 'Prinsip Dasar', slug: 'prinsip-dasar', description: 'Prinsip dasar operasional TOMS' },
          { id: 1012, title: 'Nilai-Nilai TOMS', slug: 'nilai-nilai-toms', description: 'Nilai utama yang diusung TOMS' }
        ]
      },
      {
        id: 102,
        title: 'Visi & Misi',
        slug: 'visi-misi',
        description: 'Arah dan tujuan jangka panjang TOMS',
        children: [
          { id: 1021, title: 'Visi TOMS', slug: 'visi-toms', description: 'Gambaran besar tujuan TOMS' },
          { id: 1022, title: 'Misi TOMS', slug: 'misi-toms', description: 'Langkah-langkah mencapai visi' }
        ]
      },
      {
        id: 103,
        title: 'Struktur Organisasi',
        slug: 'struktur-organisasi',
        description: 'Susunan tim dan tanggung jawab di TOMS',
        children: [
          { id: 1031, title: 'Manajemen Puncak', slug: 'manajemen-puncak', description: 'Peran dan tanggung jawab level manajemen' },
          { id: 1032, title: 'Tim Operasional', slug: 'tim-operasional', description: 'Peran tim yang menjalankan operasional harian' }
        ]
      }
    ]
  },
  {
    id: 2,
    title: 'Panduan Operasional',
    slug: 'panduan-operasional',
    icon: 'compass',
    description: 'Panduan penggunaan fitur dasar dan alur sistem',
    order: 1,
    pages: [
      {
        id: 201,
        title: 'Manajemen Pengiriman',
        slug: 'manajemen-pengiriman',
        description: 'Pengelolaan resi dan data kurir',
        children: [
          { id: 2011, title: 'Input Resi', slug: 'input-resi', description: 'Cara membuat resi baru' },
          { id: 2012, title: 'Lacak Pengiriman', slug: 'lacak-pengiriman', description: 'Status lacak posisi barang' },
          { id: 2013, title: 'Update Status Pengiriman', slug: 'update-status-pengiriman', description: 'Mengubah status resi secara manual' }
        ]
      },
      {
        id: 202,
        title: 'Manajemen Gudang',
        slug: 'manajemen-gudang',
        description: 'Pengelolaan stok dan mutasi barang di gudang',
        children: [
          { id: 2021, title: 'Input Stok Barang', slug: 'input-stok-barang', description: 'Cara mencatat stok barang masuk' },
          { id: 2022, title: 'Mutasi Gudang', slug: 'mutasi-gudang', description: 'Memindahkan stok antar gudang' }
        ]
      },
      {
        id: 203,
        title: 'Manajemen Pengguna',
        slug: 'manajemen-pengguna',
        description: 'Pengelolaan akun dan hak akses pengguna',
        children: [
          { id: 2031, title: 'Tambah Pengguna', slug: 'tambah-pengguna', description: 'Cara menambahkan akun pengguna baru' },
          { id: 2032, title: 'Atur Hak Akses', slug: 'atur-hak-akses', description: 'Mengatur peran dan izin pengguna' }
        ]
      }
    ]
  },
  {
    id: 3,
    title: 'Integrasi API',
    slug: 'integrasi-api',
    icon: 'code',
    description: 'Dokumentasi teknis API dan Payment Gateway',
    order: 2,
    pages: [
      {
        id: 301,
        title: 'Payment Gateway',
        slug: 'payment-gateway',
        description: 'Konfigurasi transaksi dan webhook',
        children: [
          { id: 3011, title: 'Metode Pembayaran', slug: 'metode-pembayaran', description: 'Setup integrasi pembayaran' },
          { id: 3012, title: 'Webhook Notifikasi', slug: 'webhook-notifikasi', description: 'Menerima notifikasi status transaksi' }
        ]
      },
      {
        id: 302,
        title: 'API Autentikasi',
        slug: 'api-autentikasi',
        description: 'Pengelolaan akses dan keamanan API',
        children: [
          { id: 3021, title: 'Generate API Key', slug: 'generate-api-key', description: 'Cara membuat API key baru' },
          { id: 3022, title: 'Refresh Token', slug: 'refresh-token', description: 'Memperbarui token akses yang kedaluwarsa' }
        ]
      },
      {
        id: 303,
        title: 'Webhook Umum',
        slug: 'webhook-umum',
        description: 'Standar format dan keamanan webhook',
        children: [
          { id: 3031, title: 'Format Payload', slug: 'format-payload', description: 'Struktur data yang dikirim webhook' },
          { id: 3032, title: 'Verifikasi Signature', slug: 'verifikasi-signature', description: 'Cara memvalidasi keaslian webhook' }
        ]
      }
    ]
  }
];

export const pageContents = {
  'pengenalan-toms/filosofi-toms/prinsip-dasar': {
    title: 'Prinsip Dasar',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'TOMS (Tracking & Operations Management System) dibangun di atas beberapa prinsip dasar yang menjadi acuan dalam setiap pengambilan keputusan operasional, mulai dari pengelolaan pengiriman hingga integrasi pembayaran.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Transparansi Proses' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Setiap perubahan status—baik pengiriman, stok, maupun transaksi—harus dapat ditelusuri kembali (' }, { type: 'text', text: 'traceable', marks: [{ type: 'italic' }] }, { type: 'text', text: ') oleh tim terkait maupun pelanggan.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Efisiensi Operasional' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Alur kerja dirancang agar setiap tim dapat menyelesaikan tugas dengan langkah seminimal mungkin. Beberapa penerapannya:' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Otomatisasi notifikasi status pengiriman' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Sinkronisasi stok real-time antar gudang' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Rekonsiliasi pembayaran otomatis lewat webhook' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Prinsip ini berlaku untuk seluruh modul TOMS, termasuk saat menambahkan fitur baru di masa depan.' }] }] }
      ]
    }
  },
  'pengenalan-toms/filosofi-toms/nilai-nilai-toms': {
    title: 'Nilai-Nilai TOMS',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Nilai-nilai berikut menjadi budaya kerja tim yang membangun dan mengoperasikan TOMS sehari-hari.' }] },
        { type: 'orderedList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Akurasi Data', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — data pengiriman dan stok harus selalu mencerminkan kondisi aktual di lapangan.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Kecepatan Respons', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — kendala operasional ditangani secepat mungkin agar tidak berdampak ke pelanggan.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Kolaborasi Lintas Tim', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — tim gudang, kurir, dan teknis bekerja dari satu sumber data yang sama.' }] }] }
        ]},
        { type: 'paragraph', content: [{ type: 'text', text: 'Nilai-nilai ini yang mendasari desain fitur seperti pelacakan pengiriman real-time dan manajemen hak akses berjenjang.' }] }
      ]
    }
  },
  'pengenalan-toms/visi-misi/visi-toms': {
    title: 'Visi TOMS',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Visi' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Menjadi sistem manajemen operasional dan pengiriman yang menjadi tulang punggung bisnis logistik skala kecil hingga menengah di Indonesia.' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Visi ini diterjemahkan menjadi fokus pengembangan pada tiga area utama: kemudahan integrasi, keandalan sistem, dan kejelasan data bagi pengguna akhir.' }] }
      ]
    }
  },
  'pengenalan-toms/visi-misi/misi-toms': {
    title: 'Misi TOMS',
    content: {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Misi' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Menyederhanakan proses input dan pelacakan pengiriman bagi tim operasional.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Menyediakan integrasi API yang mudah dipasang oleh tim teknis internal maupun mitra.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Menjaga akurasi data stok dan transaksi lintas gudang dan kanal pembayaran.' }] }] }
        ]}
      ]
    }
  },
  'pengenalan-toms/struktur-organisasi/manajemen-puncak': {
    title: 'Manajemen Puncak',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Manajemen puncak bertanggung jawab menetapkan arah strategis penggunaan TOMS di seluruh unit bisnis.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Tanggung Jawab Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Menyetujui kebijakan hak akses lintas divisi' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Meninjau laporan performa operasional bulanan' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Menentukan prioritas pengembangan fitur baru' }] }] }
        ]}
      ]
    }
  },
  'pengenalan-toms/struktur-organisasi/tim-operasional': {
    title: 'Tim Operasional',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Tim operasional adalah pengguna harian TOMS yang berinteraksi langsung dengan modul pengiriman, gudang, dan pengguna.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Pembagian Peran' }] },
        { type: 'orderedList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Admin Gudang — mengelola stok dan mutasi barang.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Admin Pengiriman — menginput resi dan memantau status kurir.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Support — menindaklanjuti kendala pelanggan terkait pesanan.' }] }] }
        ]}
      ]
    }
  },
  'panduan-operasional/manajemen-pengiriman/input-resi': {
    title: 'Input Resi',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Halaman ini menjelaskan langkah membuat resi pengiriman baru di TOMS.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Langkah-Langkah' }] },
        { type: 'orderedList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Buka menu Manajemen Pengiriman, lalu klik tombol Buat Resi Baru.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Isi data penerima, alamat, dan pilih jasa kurir.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Klik Simpan — sistem akan otomatis membuat nomor resi.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nomor resi yang sudah dibuat tidak dapat diubah, hanya dapat dibatalkan lalu dibuat ulang.' }] }] }
      ]
    }
  },
  'panduan-operasional/manajemen-pengiriman/lacak-pengiriman': {
    title: 'Lacak Pengiriman',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Fitur pelacakan menampilkan posisi dan status terkini dari setiap resi yang aktif.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Status Pengiriman' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diproses — resi baru dibuat, menunggu diambil kurir.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Dalam Perjalanan — paket sedang menuju alamat tujuan.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Terkirim — paket telah diterima penerima.' }] }] }
        ]}
      ]
    }
  },
  'panduan-operasional/manajemen-pengiriman/update-status-pengiriman': {
    title: 'Update Status Pengiriman',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Status pengiriman umumnya diperbarui otomatis lewat integrasi kurir, namun admin juga dapat mengubahnya secara manual bila diperlukan.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Kapan Update Manual Dibutuhkan' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Integrasi kurir sedang mengalami gangguan.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ada koreksi status yang dilaporkan pelanggan.' }] }] }
        ]}
      ]
    }
  },
  'panduan-operasional/manajemen-gudang/input-stok-barang': {
    title: 'Input Stok Barang',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Setiap barang masuk ke gudang wajib dicatat agar jumlah stok di sistem selalu akurat.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Langkah-Langkah' }] },
        { type: 'orderedList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Buka menu Manajemen Gudang > Input Stok.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pilih gudang tujuan dan jenis barang.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Masukkan jumlah dan simpan — stok akan terupdate secara real-time.' }] }] }
        ]}
      ]
    }
  },
  'panduan-operasional/manajemen-gudang/mutasi-gudang': {
    title: 'Mutasi Gudang',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Mutasi gudang digunakan saat memindahkan stok barang dari satu gudang ke gudang lain.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Alur Persetujuan' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Permintaan mutasi harus disetujui oleh admin gudang tujuan sebelum stok berpindah secara resmi di sistem.' }] }
      ]
    }
  },
  'panduan-operasional/manajemen-pengguna/tambah-pengguna': {
    title: 'Tambah Pengguna',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Admin dapat menambahkan akun baru untuk anggota tim yang akan menggunakan TOMS.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Langkah-Langkah' }] },
        { type: 'orderedList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Masuk ke menu Manajemen Pengguna > Tambah Pengguna.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Isi nama, email, dan peran (role) pengguna.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pengguna baru akan menerima email undangan untuk mengatur kata sandi.' }] }] }
        ]}
      ]
    }
  },
  'panduan-operasional/manajemen-pengguna/atur-hak-akses': {
    title: 'Atur Hak Akses',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hak akses menentukan modul apa saja yang bisa dilihat dan diubah oleh seorang pengguna.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Contoh Peran' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Super Admin', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — akses penuh ke seluruh modul.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Admin Gudang', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — hanya akses modul gudang dan stok.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Staf Pengiriman', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — hanya akses modul resi dan pelacakan.' }] }] }
        ]}
      ]
    }
  },
  'integrasi-api/payment-gateway/metode-pembayaran': {
    title: 'Metode Pembayaran',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'TOMS mendukung beberapa metode pembayaran yang dapat diaktifkan sesuai kebutuhan bisnis.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Metode yang Didukung' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Transfer Bank & Virtual Account' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'E-Wallet (QRIS)' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Kartu Kredit/Debit' }] }] }
        ]},
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Contoh Konfigurasi' }] },
        { type: 'codeBlock', attrs: { language: 'json' }, content: [{ type: 'text', text: '{\n  "payment_method": "qris",\n  "amount": 150000,\n  "currency": "IDR"\n}' }] }
      ]
    }
  },
  'integrasi-api/payment-gateway/webhook-notifikasi': {
    title: 'Webhook Notifikasi',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Webhook digunakan agar sistem eksternal menerima notifikasi otomatis saat status transaksi berubah.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Contoh Payload' }] },
        { type: 'codeBlock', attrs: { language: 'json' }, content: [{ type: 'text', text: '{\n  "event": "payment.success",\n  "transaction_id": "TRX12345",\n  "status": "paid"\n}' }] },
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pastikan endpoint webhook Anda merespons dengan status 200 agar tidak dikirim ulang berkali-kali.' }] }] }
      ]
    }
  },
  'integrasi-api/api-autentikasi/generate-api-key': {
    title: 'Generate API Key',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'API key diperlukan untuk mengautentikasi setiap permintaan ke API TOMS.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Langkah-Langkah' }] },
        { type: 'orderedList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Buka menu Integrasi API > API Key.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Klik Buat Key Baru dan beri nama sesuai penggunaannya.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Simpan key tersebut, karena hanya ditampilkan satu kali.' }] }] }
        ]},
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Contoh Request' }] },
        { type: 'codeBlock', attrs: { language: 'bash' }, content: [{ type: 'text', text: 'curl -H "Authorization: Bearer <API_KEY>" \\\n  https://api.toms.id/v1/shipments' }] }
      ]
    }
  },
  'integrasi-api/api-autentikasi/refresh-token': {
    title: 'Refresh Token',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Token akses memiliki masa berlaku terbatas. Gunakan refresh token untuk mendapatkan token akses baru tanpa perlu login ulang.' }] },
        { type: 'codeBlock', attrs: { language: 'json' }, content: [{ type: 'text', text: '{\n  "grant_type": "refresh_token",\n  "refresh_token": "eyJhbGciOi..."\n}' }] }
      ]
    }
  },
  'integrasi-api/webhook-umum/format-payload': {
    title: 'Format Payload',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Seluruh webhook TOMS menggunakan format payload JSON yang konsisten agar mudah diproses sistem penerima.' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'event', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — jenis kejadian yang memicu webhook.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'data', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — detail objek terkait (transaksi, resi, dsb).' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'timestamp', marks: [{ type: 'bold' }] }, { type: 'text', text: ' — waktu kejadian dalam format ISO 8601.' }] }] }
        ]}
      ]
    }
  },
  'integrasi-api/webhook-umum/verifikasi-signature': {
    title: 'Verifikasi Signature',
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Setiap webhook disertai signature pada header untuk memastikan permintaan benar-benar berasal dari TOMS.' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Cara Verifikasi' }] },
        { type: 'codeBlock', attrs: { language: 'javascript' }, content: [{ type: 'text', text: 'const crypto = require("crypto")\n\nconst expected = crypto\n  .createHmac("sha256", secretKey)\n  .update(rawBody)\n  .digest("hex")\n\nif (expected !== signatureHeader) {\n  throw new Error("Signature tidak valid")\n}' }] }
      ]
    }
  }
};
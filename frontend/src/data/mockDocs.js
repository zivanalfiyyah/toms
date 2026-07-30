export const categories = [
  {
    id: 1,
    name: 'Pengenalan TOMS',
    slug: 'pengenalan-toms',
    icon: 'book',
    description: 'Fondasi, filosofi, visi, misi, dan ruang lingkup penyelenggaraan TOMS.',
    order: 0,
    pages: [
      { id: 101, title: 'Filosofi TOMS', slug: 'filosofi-toms', description: 'Prinsip dasar Transport Operational Management System sebagai pedoman operasional terpadu.' },
      { id: 102, title: 'Visi, Misi, dan Ruang Lingkup', slug: 'visi-misi-dan-ruang-lingkup', description: 'Tujuan penyelenggaraan, ruang lingkup, dan keluaran utama dokumen TOMS.' }
    ]
  },
  {
    id: 2,
    title: 'Operasional',
    slug: 'operasional',
    icon: 'settings',
    description: 'Standar kerja operasional harian untuk pramudi dan alur perjalanan.',
    order: 1,
    pages: [
      { id: 201, title: 'Standar Operasional Pramudi', slug: 'standar-operasional-pramudi', description: 'Alur kerja pramudi dari persiapan, keberangkatan, perjalanan, darurat, sampai penutupan operasi.' },
      { id: 202, title: 'Alur Pelayanan Operasional', slug: 'alur-pelayanan-operasional', description: 'Tahapan pelayanan pelanggan dan koordinasi perjalanan dari outlet sampai post-service.' },
      { id: 203, title: 'Panduan Pengoperasian Kendaraan', slug: 'panduan-pengoperasian-kendaraan', description: 'Ketentuan pengoperasian kendaraan, larangan, dan output yang diharapkan.' }
    ]
  },
  {
    id: 3,
    title: 'Keselamatan',
    slug: 'keselamatan',
    icon: 'shield',
    description: 'Prosedur keselamatan kerja, mitigasi risiko kecelakaan, dan tanggap darurat.',
    order: 2,
    pages: [
      { id: 301, title: 'Standar Keselamatan Kerja', slug: 'standar-keselamatan-kerja', description: 'Pedoman norma K3 dan proteksi pengemudi serta penumpang.' },
      { id: 302, title: 'Prosedur Tanggap Darurat', slug: 'prosedur-tanggap-darurat', description: 'Penanganan insiden, kecelakaan jalan, dan insiden teknis darurat.' }
    ]
  },
  {
    id: 4,
    title: 'Pelayanan',
    slug: 'pelayanan',
    icon: 'headphones',
    description: 'Standar kualitas pelayanan, komunikasi pelanggan, dan keramahan pramudi.',
    order: 3,
    pages: [
      { id: 401, title: 'Standar Service Excellence', slug: 'standar-service-excellence', description: 'Sikap, penampilan, dan etika komunikasi dengan penumpang.' }
    ]
  },
  {
    id: 5,
    title: 'Armada',
    slug: 'armada',
    icon: 'bus',
    description: 'Pemeliharaan, inspeksi kelayakan jalan (KIR), dan manajemen unit.',
    order: 4,
    pages: [
      { id: 501, title: 'Inspeksi Kesiapan Armada', slug: 'inspeksi-kesiapan-armada', description: 'Pemeriksaan harian P2K sebelum kendaraan diizinkan keluar pool.' }
    ]
  },
  {
    id: 6,
    title: 'Risiko & KPI',
    slug: 'risiko-dan-kpi',
    icon: 'chart',
    description: 'Indikator kinerja utama, evaluasi pengemudi, dan analisis risiko.',
    order: 5,
    pages: [
      { id: 601, title: 'Matriks KPI Pramudi', slug: 'matriks-kpi-pramudi', description: 'Penilaian kinerja harian dan bulanan berbasis indikator keselamatan.' }
    ]
  },
  {
    id: 7,
    title: 'Digital & Evaluasi',
    slug: 'digital-dan-evaluasi',
    icon: 'monitor',
    description: 'Pemanfaatan aplikasi telematika, GPS tracking, dan audit berkala.',
    order: 6,
    pages: [
      { id: 701, title: 'Integrasi Telematika GPS', slug: 'integrasi-telematika-gps', description: 'Monitoring kecerdasan buatan untuk mengawasi perilaku berkendara.' }
    ]
  },
  {
    id: 8,
    title: 'Penutup',
    slug: 'penutup',
    icon: 'checkCircle',
    description: 'Rangkuman akhir dan lembar komitmen implementasi SOP.',
    order: 7,
    pages: [
      { id: 801, title: 'Komitmen & Penutup', slug: 'komitmen-dan-penutup', description: 'Pernyataan komitmen bersama seluruh jajaran manajemen dan pramudi.' }
    ]
  }
]

export const pageContents = {
  // ── BAB 1: PENGENALAN TOMS ──
  'pengenalan-toms/filosofi-toms': {
    title: 'Filosofi TOMS',
    description: 'Prinsip dasar Transport Operational Management System sebagai pedoman operasional terpadu.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'THE PHILOSOPHY OF TOMS' }]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'BUILDING TRUST THROUGH SAFE, SMART, AND SUSTAINABLE MOBILITY' }]
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'TOMS (' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'Transportation Operational Management System' },
            { type: 'text', text: ') dibangun atas keyakinan bahwa bisnis transportasi bukan sekadar memindahkan penumpang dari satu tempat ke tempat lain. Transportasi adalah ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'bisnis kepercayaan (Transport is Trust)' },
            { type: 'text', text: '). Setiap perjalanan adalah amanah, sehingga Safety is Our Promise menjadi komitmen utama dalam setiap keputusan, proses, dan tindakan.' }
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'VISI TOMS' }]
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  marks: [{ type: 'bold' }],
                  text: 'Menjadi kerangka kerja (framework) manajemen transportasi yang terpercaya, adaptif, dan berstandar internasional dalam membangun organisasi transportasi yang aman, profesional, serta berorientasi pada pelanggan.'
                }
              ]
            }
          ]
        }
      ]
    }
  },

  'pengenalan-toms/visi-misi-dan-ruang-lingkup': {
    title: 'Visi, Misi, dan Ruang Lingkup',
    description: 'Tujuan penyelenggaraan, ruang lingkup, dan keluaran utama dokumen TOMS.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'MAKSUD DAN TUJUAN' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Menetapkan acuan baku penyelenggaraan operasional transportasi yang terstandarisasi untuk menjamin keselamatan penumpang, pengemudi, dan pengguna jalan lainnya.' }]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'MISI UTAMA' }]
        },
        {
          type: 'orderedList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Membangun standar operasional yang konsisten di seluruh unit armada.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Menjamin keselamatan penumpang dan pengemudi sebagai prioritas tak tergantikan.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Mendorong adopsi teknologi telematika untuk efisiensi dan transparansi operasional.' }] }]}
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'RUANG LINGKUP SISTEM' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Dokumen TOMS mencakup seluruh aspek operasional: kesiapan armada, prosedur keselamatan, standar pelayanan pramudi, pemantauan GPS, hingga evaluasi risiko dan KPI operasional.' }]
        }
      ]
    }
  },

  // ── BAB 2: OPERASIONAL ──
  'operasional/standar-operasional-pramudi': {
    title: 'Standar Operasional Pramudi',
    description: 'Alur kerja pramudi dari persiapan, keberangkatan, perjalanan, darurat, sampai penutupan operasi.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'MAKSUD DAN TUJUAN' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Menetapkan standar operasional bagi pramudi dalam menjalankan tugasnya guna memastikan keselamatan, kenyamanan, serta kualitas layanan transportasi yang konsisten dan profesional.' }]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'RUANG LINGKUP' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Pedoman ini mencakup seluruh tahapan aktivitas pramudi mulai dari persiapan sebelum bertugas hingga penutupan jam operasional.' }]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'PERAN PRAMUDI' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Pramudi bertanggung jawab atas aspek teknis kendaraan, keselamatan penumpang, serta representasi citra positif perusahaan di jalan raya.' }]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'STANDAR OPERASIONAL KERJA' }]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'PERSIAPAN SEBELUM KEBERANGKATAN' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Pramudi wajib melakukan pemeriksaan kondisi fisik mandiri, memastikan kelengkapan seragam dan atribut resmi, serta melakukan inspeksi P2K kendaraan.' }]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'PROSES KEBERANGKATAN' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Memastikan manifes penumpang sesuai, menyapa penumpang dengan ramah, dan memastikan seluruh sabuk pengaman telah terpasang.' }]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'PELAKSANAAN PERJALANAN' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Mengemudikan armada dengan prinsip Defensive Driving, mematuhi rambu lalu lintas, dan menjaga jarak aman antar kendaraan.' }]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'PENANGANAN KONDISI DARURAT' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Jika terjadi kendala teknis atau kecelakaan, prioritaskan keselamatan penumpang, pasang segitiga pengaman, dan hubungi OCC.' }]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'PROSES TIBA & SERAH TERIMA' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Memeriksa barang penumpang yang tertinggal dan memarkirkan armada di area yang telah ditentukan.' }]
        },
        {
          type: 'heading',
          attrs: { level: 3 },
          content: [{ type: 'text', text: 'SETELAH OPERASIONAL SELESAI' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Mengisi buku laporan harian, mengunci kendaraan, dan menyerahkan kunci ke pengelola pool.' }]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'STANDAR PERILAKU DAN ETIKA' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Menjaga tutur kata yang sopan, tidak mudah terpancing emosi oleh pengguna jalan lain, dan mengutamakan pelayanan prima.' }]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'LARANGAN' }]
        },
        {
          type: 'orderedList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Dilarang menggunakan ponsel saat menyetir.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Dilarang merokok di dalam kabin kendaraan.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Dilarang berkendara dalam kondisi mengantuk atau di bawah pengaruh obat.' }] }]}
          ]
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'PENGAWASAN & EVALUASI' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Pramudi akan dievaluasi secara periodik berdasarkan pencatatan telematika GPS dan umpan balik penumpang.' }]
        }
      ]
    }
  },

  'operasional/alur-pelayanan-operasional': {
    title: 'Alur Pelayanan Operasional',
    description: 'Tahapan pelayanan pelanggan dan koordinasi perjalanan dari outlet sampai post-service.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'TAHAPAN PELAYANAN' }]
        },
        {
          type: 'orderedList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pre-Service: Kesiapan armada dan verifikasi tiket/manifes.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'In-Service: Penanganan bagasi, pengondisian kabin, dan pengantaran.' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Post-Service: Pemeriksaan barang tertinggal dan pemberian feedback.' }] }]}
          ]
        }
      ]
    }
  },

  'operasional/panduan-pengoperasian-kendaraan': {
    title: 'Panduan Pengoperasian Kendaraan',
    description: 'Ketentuan pengoperasian kendaraan, larangan, dan output yang diharapkan.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'PEDOMAN UMUM KENDARAAN' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Setiap pengemudi wajib memahami karakteristik kendaraan yang dioperasikan, termasuk batas muatan maksimum dan sistem keselamatan elektronik.' }]
        }
      ]
    }
  },

  'keselamatan/standar-keselamatan-kerja': {
    title: 'Standar Keselamatan Kerja',
    description: 'Pedoman norma K3 dan proteksi pengemudi serta penumpang.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'PRINSIP UTAMA K3' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Menerapkan budaya keselamatan kerja dengan menyediakan APD baku dan lingkungan kerja yang ergonomis bagi pramudi.' }]
        }
      ]
    }
  },

  'keselamatan/prosedur-tanggap-darurat': {
    title: 'Prosedur Tanggap Darurat',
    description: 'Penanganan insiden, kecelakaan jalan, dan insiden teknis darurat.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'ALUR ESKALASI DARURAT' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Langkah taktis yang wajib diambil ketika terjadi kecelakaan lalu lintas atau keadaaan darurat medis di perjalanan.' }]
        }
      ]
    }
  },

  'pelayanan/standar-service-excellence': {
    title: 'Standar Service Excellence',
    description: 'Sikap, penampilan, dan etika komunikasi dengan penumpang.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: '5 PILLAR SERVICE EXCELLENCE' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Senyum, Salam, Sapa, Sopan, dan Sigap dalam melayani seluruh penumpang TOMS.' }]
        }
      ]
    }
  },

  'armada/inspeksi-kesiapan-armada': {
    title: 'Inspeksi Kesiapan Armada',
    description: 'Pemeriksaan harian P2K sebelum kendaraan diizinkan keluar pool.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'CHECKLIST INSPEKSI HARIAN' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Pemeriksaan mesin, tekanan angin ban, sistem rem, APAR, dan kebersihan kabin kendaraan.' }]
        }
      ]
    }
  },

  'risiko-dan-kpi/matriks-kpi-pramudi': {
    title: 'Matriks KPI Pramudi',
    description: 'Penilaian kinerja harian dan bulanan berbasis indikator keselamatan.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'INDIKATOR PENILAIAN' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Poin kedisiplinan rute, kebersihan armada, rating kepuasan penumpang, serta skor mengemudi aman.' }]
        }
      ]
    }
  },

  'digital-dan-evaluasi/integrasi-telematika-gps': {
    title: 'Integrasi Telematika GPS',
    description: 'Monitoring kecerdasan buatan untuk mengawasi perilaku berkendara.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'MONITORING REAL-TIME' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Penggunaan sensor IoT untuk mendeteksi overspeeding, pengereman mendadak, dan penyimpangan rute.' }]
        }
      ]
    }
  },

  'penutup/komitmen-dan-penutup': {
    title: 'Komitmen & Penutup',
    description: 'Pernyataan komitmen bersama seluruh jajaran manajemen dan pramudi.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'LEMBAR KOMITMEN IMPLEMENTASI' }]
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Seluruh insan TOMS berkomitmen menjalankan pedoman ini secara konsisten demi terciptanya moda transportasi yang aman dan terpercaya.' }]
        }
      ]
    }
  }
}
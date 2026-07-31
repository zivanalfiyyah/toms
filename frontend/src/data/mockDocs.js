export const categories = [
{
    id: 4,
    title: "Dasar Hukum",
    slug: "dasar-hukum",
    icon: "dasarHukum",
    description: "Landasan regulasi dan standar acuan penyelenggaraan TOMS",
    order: 0,
    pages: [
      {
        id: 401,
        title: "Landasan Regulasi",
        slug: "landasan-regulasi",
        description: "Dasar hukum dan regulasi yang menjadi acuan",
        children: [
          { id: 4011, title: "Peraturan Perundangan", slug: "peraturan-perundangan", description: "Peraturan dan perundangan terkait" },
          { id: 4012, title: "Standar Acuan Industri", slug: "standar-acuan-industri", description: "Standar industri yang dijadikan referensi" }
        ]
      }
    ]
  },
{
    id: 5,
    title: "Executive Summary",
    slug: "executive-summary",
    icon: "executiveSummary",
    description: "Ringkasan eksekutif program dan capaian utama",
    order: 1,
    pages: [
      {
        id: 501,
        title: "Ringkasan Program",
        slug: "ringkasan-program",
        description: "Ringkasan menyeluruh program secara eksekutif",
        children: [
          { id: 5011, title: "Latar Belakang", slug: "latar-belakang", description: "Latar belakang dibentuknya program" },
          { id: 5012, title: "Highlight Capaian", slug: "highlight-capaian", description: "Capaian-capaian utama program" }
        ]
      }
    ]
  },
{
    id: 6,
    title: "Tujuan",
    slug: "tujuan",
    icon: "tujuan",
    description: "Tujuan umum dan khusus penyelenggaraan sistem",
    order: 2,
    pages: [
      {
        id: 601,
        title: "Tujuan Umum & Khusus",
        slug: "tujuan-umum-khusus",
        description: "Uraian tujuan program secara umum dan khusus",
        children: [
          { id: 6011, title: "Tujuan Umum", slug: "tujuan-umum", description: "Tujuan besar yang ingin dicapai" },
          { id: 6012, title: "Tujuan Khusus", slug: "tujuan-khusus", description: "Tujuan spesifik dan terukur" }
        ]
      }
    ]
  },
{
    id: 7,
    title: "Ruang Lingkup",
    slug: "ruang-lingkup",
    icon: "ruangLingkup",
    description: "Batasan dan cakupan implementasi TOMS",
    order: 3,
    pages: [
      {
        id: 701,
        title: "Batasan Implementasi",
        slug: "batasan-implementasi",
        description: "Cakupan dan batasan implementasi program",
        children: [
          { id: 7011, title: "Ruang Lingkup Layanan", slug: "ruang-lingkup-layanan", description: "Layanan yang tercakup dalam program" },
          { id: 7012, title: "Batasan & Pengecualian", slug: "batasan-pengecualian", description: "Hal-hal yang tidak tercakup dalam program" }
        ]
      }
    ]
  },
{
    id: 8,
    title: "Kerangka Penyelenggaraan",
    slug: "kerangka-penyelenggaraan",
    icon: "kerangkaPenyelenggaraan",
    description: "Struktur dan tahapan penyelenggaraan program",
    order: 4,
    pages: [
      {
        id: 801,
        title: "Struktur Kerangka Kerja",
        slug: "struktur-kerangka-kerja",
        description: "Struktur dan tahapan penyelenggaraan",
        children: [
          { id: 8011, title: "Tahapan Penyelenggaraan", slug: "tahapan-penyelenggaraan", description: "Tahapan pelaksanaan program" },
          { id: 8012, title: "Pihak Terlibat", slug: "pihak-terlibat", description: "Pemangku kepentingan yang terlibat" }
        ]
      }
    ]
  },
{
    id: 9,
    title: "Standar Pelayanan & Keselamatan",
    slug: "standar-pelayanan-keselamatan",
    icon: "standarKeselamatan",
    description: "Standar pelayanan minimal dan prosedur keselamatan penumpang",
    order: 5,
    pages: [
      {
        id: 901,
        title: "Standar Layanan Penumpang",
        slug: "standar-layanan-penumpang",
        description: "Standar layanan dan keselamatan bagi penumpang",
        children: [
          { id: 9011, title: "Standar Pelayanan Minimal", slug: "standar-pelayanan-minimal", description: "Indikator layanan minimal yang wajib dipenuhi" },
          { id: 9012, title: "Prosedur Keselamatan", slug: "prosedur-keselamatan", description: "Prosedur menjaga keselamatan penumpang" }
        ]
      }
    ]
  },
{
    id: 10,
    title: "Marketing and Demand Creation",
    slug: "marketing-demand-creation",
    icon: "marketing",
    description: "Strategi pemasaran & penciptaan permintaan penumpang",
    order: 6,
    pages: [
      {
        id: 1001,
        title: "Strategi Pemasaran",
        slug: "strategi-pemasaran",
        description: "Strategi pemasaran dan penciptaan permintaan",
        children: [
          { id: 10011, title: "Segmentasi Penumpang", slug: "segmentasi-penumpang", description: "Pembagian segmen target penumpang" },
          { id: 10012, title: "Kampanye Penciptaan Permintaan", slug: "kampanye-penciptaan-permintaan", description: "Program kampanye untuk mendorong permintaan" }
        ]
      }
    ]
  },
{
    id: 11,
    title: "Manajemen Resiko Operasional",
    slug: "manajemen-resiko-operasional",
    icon: "manajemenResiko",
    description: "Identifikasi dan mitigasi risiko operasional",
    order: 7,
    pages: [
      {
        id: 1101,
        title: "Identifikasi & Mitigasi Risiko",
        slug: "identifikasi-mitigasi-risiko",
        description: "Proses identifikasi dan mitigasi risiko operasional",
        children: [
          { id: 11011, title: "Identifikasi Risiko", slug: "identifikasi-risiko", description: "Cara mengidentifikasi potensi risiko" },
          { id: 11012, title: "Rencana Mitigasi", slug: "rencana-mitigasi", description: "Rencana tindak lanjut mitigasi risiko" }
        ]
      }
    ]
  },
{
    id: 12,
    title: "Go Live dan Monitoring Operasional",
    slug: "go-live-monitoring-operasional",
    icon: "goLiveMonitoring",
    description: "Persiapan peluncuran dan pemantauan operasional",
    order: 8,
    pages: [
      {
        id: 1201,
        title: "Persiapan & Pemantauan Go Live",
        slug: "persiapan-pemantauan-go-live",
        description: "Persiapan peluncuran dan pemantauan operasional",
        children: [
          { id: 12011, title: "Checklist Go Live", slug: "checklist-go-live", description: "Daftar periksa sebelum peluncuran" },
          { id: 12012, title: "Monitoring Pasca Go Live", slug: "monitoring-pasca-go-live", description: "Pemantauan kinerja setelah peluncuran" }
        ]
      }
    ]
  },
{
    id: 13,
    title: "Evaluasi dan Pengembangan",
    slug: "evaluasi-pengembangan",
    icon: "evaluasiPengembangan",
    description: "Evaluasi & perbaikan berkelanjutan program",
    order: 9,
    pages: [
      {
        id: 1301,
        title: "Evaluasi & Perbaikan Berkelanjutan",
        slug: "evaluasi-perbaikan-berkelanjutan",
        description: "Proses evaluasi dan perbaikan berkelanjutan",
        children: [
          { id: 13011, title: "Metode Evaluasi", slug: "metode-evaluasi", description: "Metode yang digunakan dalam evaluasi program" },
          { id: 13012, title: "Rencana Perbaikan", slug: "rencana-perbaikan", description: "Rencana tindak lanjut hasil evaluasi" }
        ]
      }
    ]
  },
{
    id: 14,
    title: "Lampiran",
    slug: "lampiran",
    icon: "lampiran",
    description: "Appendix / dokumen pendukung",
    order: 10,
    pages: [
      {
        id: 1401,
        title: "Dokumen Pendukung",
        slug: "dokumen-pendukung",
        description: "Dokumen dan formulir pendukung program",
        children: [
          { id: 14011, title: "Daftar Lampiran", slug: "daftar-lampiran", description: "Daftar seluruh dokumen lampiran" },
          { id: 14012, title: "Template & Formulir", slug: "template-formulir", description: "Template dan formulir yang dapat digunakan" }
        ]
      }
    ]
  },
{
    id: 15,
    title: "Human Behavior Implementation Framework (HBIF)",
    slug: "hbif",
    icon: "hbif",
    description: "Mengelola perubahan perilaku manusia",
    order: 11,
    pages: [
      {
        id: 1501,
        title: "Mengelola Perubahan Perilaku Manusia",
        slug: "mengelola-perubahan-perilaku-manusia",
        description: "Kerangka kerja pengelolaan perubahan perilaku manusia",
        children: [
          { id: 15011, title: "Prinsip Perubahan Perilaku", slug: "prinsip-perubahan-perilaku", description: "Prinsip dasar dalam mengubah perilaku" },
          { id: 15012, title: "Strategi Intervensi", slug: "strategi-intervensi", description: "Strategi intervensi untuk mendorong perubahan" }
        ]
      }
    ]
  },
{
    id: 16,
    title: "Change Management Implementation Framework (CMIF)",
    slug: "cmif",
    icon: "cmif",
    description: "Mengelola perubahan organisasi",
    order: 12,
    pages: [
      {
        id: 1601,
        title: "Mengelola Perubahan Organisasi",
        slug: "mengelola-perubahan-organisasi",
        description: "Kerangka kerja pengelolaan perubahan organisasi",
        children: [
          { id: 16011, title: "Tahapan Change Management", slug: "tahapan-change-management", description: "Tahapan dalam proses change management" },
          { id: 16012, title: "Peran Change Agent", slug: "peran-change-agent", description: "Peran agen perubahan dalam organisasi" }
        ]
      }
    ]
  },
{
    id: 17,
    title: "Sustainability & ESG Implementation Framework",
    slug: "sustainability-esg",
    icon: "sustainabilityEsg",
    description: "Kerangka kerja keberlanjutan dan ESG",
    order: 13,
    pages: [
      {
        id: 1701,
        title: "Kerangka Kerja ESG",
        slug: "kerangka-kerja-esg",
        description: "Kerangka kerja keberlanjutan dan ESG",
        children: [
          { id: 17011, title: "Pilar Sustainability", slug: "pilar-sustainability", description: "Pilar-pilar utama keberlanjutan" },
          { id: 17012, title: "Indikator ESG", slug: "indikator-esg", description: "Indikator pengukuran capaian ESG" }
        ]
      }
    ]
  },
{
    id: 18,
    title: "Operasional Disruption Management (ODM)",
    slug: "odm",
    icon: "odm",
    description: "Penanganan gangguan operasional",
    order: 14,
    pages: [
      {
        id: 1801,
        title: "Penanganan Gangguan Operasional",
        slug: "penanganan-gangguan-operasional",
        description: "Prosedur penanganan gangguan operasional",
        children: [
          { id: 18011, title: "Klasifikasi Gangguan", slug: "klasifikasi-gangguan", description: "Kategori tingkat keparahan gangguan" },
          { id: 18012, title: "Prosedur Tanggap Darurat", slug: "prosedur-tanggap-darurat", description: "Langkah tanggap darurat saat terjadi gangguan" }
        ]
      }
    ]
  },
{
    id: 19,
    title: "TOMS Framework Dictionary",
    slug: "toms-framework-dictionary",
    icon: "dictionary",
    description: "Daftar istilah dan definisi dalam kerangka kerja TOMS",
    order: 15,
    pages: [
      {
        id: 1901,
        title: "Daftar Istilah",
        slug: "daftar-istilah",
        description: "Daftar istilah dan definisi dalam kerangka kerja TOMS",
        children: [
          { id: 19011, title: "Istilah Umum", slug: "istilah-umum", description: "Definisi istilah umum yang sering digunakan" },
          { id: 19012, title: "Singkatan & Akronim", slug: "singkatan-akronim", description: "Daftar singkatan dan akronim" }
        ]
      }
    ]
  },
{
    id: 20,
    title: "Penutupan",
    slug: "penutupan",
    icon: "penutupan",
    description: "Penutup dokumen dan informasi kontak",
    order: 16,
    pages: [
      {
        id: 2001,
        title: "Kata Penutup",
        slug: "kata-penutup",
        description: "Penutup dokumen",
        children: [
          { id: 20011, title: "Ucapan Terima Kasih", slug: "ucapan-terima-kasih", description: "Apresiasi kepada seluruh pihak terkait" },
          { id: 20012, title: "Kontak & Dukungan", slug: "kontak-dukungan", description: "Informasi kontak untuk pertanyaan lebih lanjut" }
        ]
      }
    ]
  }
];

export const pageContents = {
"dasar-hukum/landasan-regulasi/peraturan-perundangan": {
    title: "Peraturan Perundangan",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Peraturan Perundangan membahas bagian penting dari Dasar Hukum dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Peraturan dan perundangan terkait" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Dasar Hukum." }] }] }
      ]
    }
  },
  "dasar-hukum/landasan-regulasi/standar-acuan-industri": {
    title: "Standar Acuan Industri",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Standar Acuan Industri membahas bagian penting dari Dasar Hukum dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Standar industri yang dijadikan referensi" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Dasar Hukum." }] }] }
      ]
    }
  },
  "executive-summary/ringkasan-program/latar-belakang": {
    title: "Latar Belakang",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Latar Belakang membahas bagian penting dari Executive Summary dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Latar belakang dibentuknya program" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Executive Summary." }] }] }
      ]
    }
  },
  "executive-summary/ringkasan-program/highlight-capaian": {
    title: "Highlight Capaian",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Highlight Capaian membahas bagian penting dari Executive Summary dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Capaian-capaian utama program" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Executive Summary." }] }] }
      ]
    }
  },
  "tujuan/tujuan-umum-khusus/tujuan-umum": {
    title: "Tujuan Umum",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Tujuan Umum membahas bagian penting dari Tujuan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Tujuan besar yang ingin dicapai" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Tujuan." }] }] }
      ]
    }
  },
  "tujuan/tujuan-umum-khusus/tujuan-khusus": {
    title: "Tujuan Khusus",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Tujuan Khusus membahas bagian penting dari Tujuan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Tujuan spesifik dan terukur" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Tujuan." }] }] }
      ]
    }
  },
  "ruang-lingkup/batasan-implementasi/ruang-lingkup-layanan": {
    title: "Ruang Lingkup Layanan",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Ruang Lingkup Layanan membahas bagian penting dari Ruang Lingkup dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Layanan yang tercakup dalam program" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Ruang Lingkup." }] }] }
      ]
    }
  },
  "ruang-lingkup/batasan-implementasi/batasan-pengecualian": {
    title: "Batasan & Pengecualian",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Batasan & Pengecualian membahas bagian penting dari Ruang Lingkup dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Hal-hal yang tidak tercakup dalam program" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Ruang Lingkup." }] }] }
      ]
    }
  },
  "kerangka-penyelenggaraan/struktur-kerangka-kerja/tahapan-penyelenggaraan": {
    title: "Tahapan Penyelenggaraan",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Tahapan Penyelenggaraan membahas bagian penting dari Kerangka Penyelenggaraan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Tahapan pelaksanaan program" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Kerangka Penyelenggaraan." }] }] }
      ]
    }
  },
  "kerangka-penyelenggaraan/struktur-kerangka-kerja/pihak-terlibat": {
    title: "Pihak Terlibat",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Pihak Terlibat membahas bagian penting dari Kerangka Penyelenggaraan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Pemangku kepentingan yang terlibat" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Kerangka Penyelenggaraan." }] }] }
      ]
    }
  },
  "standar-pelayanan-keselamatan/standar-layanan-penumpang/standar-pelayanan-minimal": {
    title: "Standar Pelayanan Minimal",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Standar Pelayanan Minimal membahas bagian penting dari Standar Pelayanan & Keselamatan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Indikator layanan minimal yang wajib dipenuhi" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Standar Pelayanan & Keselamatan." }] }] }
      ]
    }
  },
  "standar-pelayanan-keselamatan/standar-layanan-penumpang/prosedur-keselamatan": {
    title: "Prosedur Keselamatan",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Prosedur Keselamatan membahas bagian penting dari Standar Pelayanan & Keselamatan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Prosedur menjaga keselamatan penumpang" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Standar Pelayanan & Keselamatan." }] }] }
      ]
    }
  },
  "marketing-demand-creation/strategi-pemasaran/segmentasi-penumpang": {
    title: "Segmentasi Penumpang",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Segmentasi Penumpang membahas bagian penting dari Marketing and Demand Creation dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Pembagian segmen target penumpang" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Marketing and Demand Creation." }] }] }
      ]
    }
  },
  "marketing-demand-creation/strategi-pemasaran/kampanye-penciptaan-permintaan": {
    title: "Kampanye Penciptaan Permintaan",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Kampanye Penciptaan Permintaan membahas bagian penting dari Marketing and Demand Creation dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Program kampanye untuk mendorong permintaan" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Marketing and Demand Creation." }] }] }
      ]
    }
  },
  "manajemen-resiko-operasional/identifikasi-mitigasi-risiko/identifikasi-risiko": {
    title: "Identifikasi Risiko",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Identifikasi Risiko membahas bagian penting dari Manajemen Resiko Operasional dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Cara mengidentifikasi potensi risiko" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Manajemen Resiko Operasional." }] }] }
      ]
    }
  },
  "manajemen-resiko-operasional/identifikasi-mitigasi-risiko/rencana-mitigasi": {
    title: "Rencana Mitigasi",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Rencana Mitigasi membahas bagian penting dari Manajemen Resiko Operasional dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Rencana tindak lanjut mitigasi risiko" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Manajemen Resiko Operasional." }] }] }
      ]
    }
  },
  "go-live-monitoring-operasional/persiapan-pemantauan-go-live/checklist-go-live": {
    title: "Checklist Go Live",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Checklist Go Live membahas bagian penting dari Go Live dan Monitoring Operasional dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Daftar periksa sebelum peluncuran" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Go Live dan Monitoring Operasional." }] }] }
      ]
    }
  },
  "go-live-monitoring-operasional/persiapan-pemantauan-go-live/monitoring-pasca-go-live": {
    title: "Monitoring Pasca Go Live",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Monitoring Pasca Go Live membahas bagian penting dari Go Live dan Monitoring Operasional dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Pemantauan kinerja setelah peluncuran" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Go Live dan Monitoring Operasional." }] }] }
      ]
    }
  },
  "evaluasi-pengembangan/evaluasi-perbaikan-berkelanjutan/metode-evaluasi": {
    title: "Metode Evaluasi",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Metode Evaluasi membahas bagian penting dari Evaluasi dan Pengembangan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Metode yang digunakan dalam evaluasi program" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Evaluasi dan Pengembangan." }] }] }
      ]
    }
  },
  "evaluasi-pengembangan/evaluasi-perbaikan-berkelanjutan/rencana-perbaikan": {
    title: "Rencana Perbaikan",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Rencana Perbaikan membahas bagian penting dari Evaluasi dan Pengembangan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Rencana tindak lanjut hasil evaluasi" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Evaluasi dan Pengembangan." }] }] }
      ]
    }
  },
  "lampiran/dokumen-pendukung/daftar-lampiran": {
    title: "Daftar Lampiran",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Daftar Lampiran membahas bagian penting dari Lampiran dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Daftar seluruh dokumen lampiran" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Lampiran." }] }] }
      ]
    }
  },
  "lampiran/dokumen-pendukung/template-formulir": {
    title: "Template & Formulir",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Template & Formulir membahas bagian penting dari Lampiran dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Template dan formulir yang dapat digunakan" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Lampiran." }] }] }
      ]
    }
  },
  "hbif/mengelola-perubahan-perilaku-manusia/prinsip-perubahan-perilaku": {
    title: "Prinsip Perubahan Perilaku",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Prinsip Perubahan Perilaku membahas bagian penting dari Human Behavior Implementation Framework dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Prinsip dasar dalam mengubah perilaku" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Human Behavior Implementation Framework." }] }] }
      ]
    }
  },
  "hbif/mengelola-perubahan-perilaku-manusia/strategi-intervensi": {
    title: "Strategi Intervensi",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Strategi Intervensi membahas bagian penting dari Human Behavior Implementation Framework dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Strategi intervensi untuk mendorong perubahan" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Human Behavior Implementation Framework." }] }] }
      ]
    }
  },
  "cmif/mengelola-perubahan-organisasi/tahapan-change-management": {
    title: "Tahapan Change Management",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Tahapan Change Management membahas bagian penting dari Change Management Implementation Framework dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Tahapan dalam proses change management" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Change Management Implementation Framework." }] }] }
      ]
    }
  },
  "cmif/mengelola-perubahan-organisasi/peran-change-agent": {
    title: "Peran Change Agent",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Peran Change Agent membahas bagian penting dari Change Management Implementation Framework dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Peran agen perubahan dalam organisasi" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Change Management Implementation Framework." }] }] }
      ]
    }
  },
  "sustainability-esg/kerangka-kerja-esg/pilar-sustainability": {
    title: "Pilar Sustainability",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Pilar Sustainability membahas bagian penting dari Sustainability & ESG Implementation Framework dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Pilar-pilar utama keberlanjutan" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Sustainability & ESG Implementation Framework." }] }] }
      ]
    }
  },
  "sustainability-esg/kerangka-kerja-esg/indikator-esg": {
    title: "Indikator ESG",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Indikator ESG membahas bagian penting dari Sustainability & ESG Implementation Framework dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Indikator pengukuran capaian ESG" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Sustainability & ESG Implementation Framework." }] }] }
      ]
    }
  },
  "odm/penanganan-gangguan-operasional/klasifikasi-gangguan": {
    title: "Klasifikasi Gangguan",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Klasifikasi Gangguan membahas bagian penting dari Operasional Disruption Management dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Kategori tingkat keparahan gangguan" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Operasional Disruption Management." }] }] }
      ]
    }
  },
  "odm/penanganan-gangguan-operasional/prosedur-tanggap-darurat": {
    title: "Prosedur Tanggap Darurat",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Prosedur Tanggap Darurat membahas bagian penting dari Operasional Disruption Management dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Langkah tanggap darurat saat terjadi gangguan" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Operasional Disruption Management." }] }] }
      ]
    }
  },
  "toms-framework-dictionary/daftar-istilah/istilah-umum": {
    title: "Istilah Umum",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Istilah Umum membahas bagian penting dari TOMS Framework Dictionary dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Definisi istilah umum yang sering digunakan" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori TOMS Framework Dictionary." }] }] }
      ]
    }
  },
  "toms-framework-dictionary/daftar-istilah/singkatan-akronim": {
    title: "Singkatan & Akronim",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Singkatan & Akronim membahas bagian penting dari TOMS Framework Dictionary dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Daftar singkatan dan akronim" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori TOMS Framework Dictionary." }] }] }
      ]
    }
  },
  "penutupan/kata-penutup/ucapan-terima-kasih": {
    title: "Ucapan Terima Kasih",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Ucapan Terima Kasih membahas bagian penting dari Penutupan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Apresiasi kepada seluruh pihak terkait" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Penutupan." }] }] }
      ]
    }
  },
  "penutupan/kata-penutup/kontak-dukungan": {
    title: "Kontak & Dukungan",
    content: {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: "Kontak & Dukungan membahas bagian penting dari Penutupan dalam dokumentasi TOMS, sebagai acuan bagi tim dalam menjalankan proses terkait." }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Poin Utama' }] },
        { type: 'bulletList', content: [
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Informasi kontak untuk pertanyaan lebih lanjut" }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Diselaraskan dengan kebijakan dan standar TOMS secara menyeluruh.' }] }] },
          { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ditinjau secara berkala agar tetap relevan dengan kondisi operasional.' }] }] }
        ]},
        { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: "Konten ini masih berupa data dummy untuk keperluan simulasi tampilan kategori Penutupan." }] }] }
      ]
    }
  }
};
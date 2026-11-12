<?php

namespace Database\Seeders;

use App\Models\Announcement;
use Illuminate\Database\Seeder;

/**
 * Isi halaman Informasi (pengumuman). Aman dijalankan berulang: judul yang sama diperbarui, bukan digandakan.
 * Jalankan: php artisan db:seed --class=AnnouncementSeeder
 */
class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'tag' => 'Pengumuman Resmi', 'badge' => 'UTAMA', 'title' => 'Penguatan Standar Layanan Operasional Semester II 2025',
                'is_lead' => true, 'days_ago' => 3,
                'excerpt' => 'Manajemen menetapkan fokus baru pada konsistensi layanan, ketepatan jadwal, dan penguatan budaya keselamatan di seluruh area operasional.',
                'body' => 'Manajemen menetapkan tiga fokus utama operasional untuk Semester II: konsistensi layanan kepada penumpang, ketepatan jadwal keberangkatan, dan penguatan budaya keselamatan di seluruh area operasional.

Mulai periode ini, seluruh unit operasional diminta menggunakan Panduan TOMS sebagai satu-satunya rujukan resmi. Dokumen lama yang masih beredar di luar portal ini dinyatakan tidak berlaku apabila bertentangan dengan isi panduan.

Ruang lingkup penguatan:
1. Standar pelayanan di terminal, halte, dan di dalam armada.
2. Disiplin jadwal: toleransi keterlambatan keberangkatan dan prosedur pelaporannya.
3. Pemeriksaan kendaraan harian (pre-trip inspection) yang tercatat dan dapat diaudit.
4. Pelaporan insiden dan near miss maksimal 1x24 jam melalui jalur resmi.

Koordinator area bertanggung jawab menyosialisasikan pembaruan ini kepada seluruh pengemudi, kru, dan petugas lapangan paling lambat dua minggu setelah pengumuman diterbitkan. Pertanyaan teknis dapat disampaikan melalui menu Bantuan pada portal ini.',
            ],
            [
                'tag' => 'Safety Alert', 'badge' => 'URGENT', 'title' => 'Pemeriksaan Sistem Pengereman Menjelang Musim Hujan',
                'is_lead' => false, 'days_ago' => 6,
                'excerpt' => 'Seluruh area operasional wajib melakukan pemeriksaan tambahan terhadap sistem pengereman dan kondisi ban sebelum musim hujan.',
                'body' => 'Menjelang musim hujan, risiko tergelincir dan jarak pengereman yang memanjang meningkat. Karena itu seluruh area operasional wajib melakukan pemeriksaan tambahan pada sistem pengereman dan kondisi ban armada.

Poin pemeriksaan minimum:
1. Ketebalan kampas rem dan kondisi cakram/tromol.
2. Tekanan angin sistem rem dan kebocoran pada selang.
3. Kedalaman alur ban (tidak melewati batas aus) serta tekanan angin sesuai spesifikasi.
4. Fungsi wiper, lampu, dan lampu rem.

Armada yang tidak lolos pemeriksaan tidak boleh dioperasikan sampai perbaikan selesai dan diverifikasi oleh petugas workshop. Hasil pemeriksaan dicatat pada formulir pemeriksaan harian dan dilaporkan kepada koordinator area.

Pengemudi diingatkan untuk menambah jarak aman, menurunkan kecepatan di jalan basah, dan segera melapor apabila merasakan perubahan respons pedal rem.',
            ],
            [
                'tag' => 'Update Kebijakan', 'badge' => 'BARU', 'title' => 'Revisi SOP Pengendalian Perjalanan Jarak Jauh',
                'is_lead' => false, 'days_ago' => 10,
                'excerpt' => 'Pembaruan batas waktu mengemudi, prosedur pergantian pengemudi, dan titik istirahat wajib pada rute jarak jauh.',
                'body' => 'SOP Pengendalian Perjalanan Jarak Jauh telah direvisi untuk menurunkan risiko kelelahan pengemudi. Revisi berlaku untuk seluruh rute dengan waktu tempuh lebih dari empat jam.

Perubahan utama:
1. Batas waktu mengemudi berkelanjutan dan waktu istirahat minimum ditetapkan ulang.
2. Pergantian pengemudi wajib dilakukan di titik yang telah ditentukan dan dicatat pada lembar perjalanan.
3. Koordinator perjalanan wajib melakukan kontak berkala dengan pengemudi selama perjalanan berlangsung.
4. Pengemudi yang melaporkan kelelahan berhak menghentikan perjalanan tanpa dikenai sanksi, dan segera dilaporkan agar ada pengganti.

Versi lengkap SOP tersedia pada bagian Dokumentasi di portal ini. Seluruh pengemudi dan koordinator wajib membaca versi terbaru dan mengonfirmasi pemahaman kepada atasan langsung.',
            ],
            [
                'tag' => 'Pelatihan SDM', 'badge' => 'PENDAFTARAN', 'title' => 'Jadwal Defensive Driving Training Batch 06',
                'is_lead' => false, 'days_ago' => 14,
                'excerpt' => 'Pendaftaran pelatihan bagi pengemudi dan koordinator area telah dibuka. Kuota terbatas.',
                'body' => 'Pendaftaran Defensive Driving Training Batch 06 telah dibuka untuk pengemudi dan koordinator area. Pelatihan ini bertujuan membangun kebiasaan mengemudi aman, antisipatif, dan konsisten.

Materi pelatihan:
1. Prinsip defensive driving dan manajemen jarak aman.
2. Mengenali bahaya di jalan dan kondisi cuaca ekstrem.
3. Penanganan situasi darurat dan evakuasi penumpang.
4. Pengelolaan kelelahan dan kondisi fisik pengemudi.

Peserta dipilih berdasarkan rekomendasi koordinator area dan hasil evaluasi kinerja keselamatan. Pendaftaran dilakukan melalui koordinator masing-masing, dan peserta yang telah terdaftar akan menerima konfirmasi jadwal. Kehadiran penuh diperlukan untuk memperoleh sertifikat pelatihan.',
            ],
            [
                'tag' => 'Agenda Audit', 'badge' => 'AGENDA', 'title' => 'Audit Kepatuhan Operasional Semester I',
                'is_lead' => false, 'days_ago' => 18,
                'excerpt' => 'Persiapkan dokumen dan bukti implementasi untuk agenda audit kepatuhan operasional.',
                'body' => 'Tim audit internal akan melaksanakan audit kepatuhan operasional untuk Semester I. Seluruh area diminta menyiapkan dokumen dan bukti implementasi sesuai Panduan TOMS.

Dokumen yang perlu disiapkan:
1. Catatan pemeriksaan kendaraan harian dan perawatan berkala.
2. Daftar hadir dan sertifikat pelatihan pengemudi/kru.
3. Laporan insiden, near miss, dan tindak lanjutnya.
4. Bukti sosialisasi SOP terbaru kepada personel lapangan.

Temuan audit akan diklasifikasikan menjadi temuan mayor, minor, dan observasi, disertai batas waktu tindak lanjut. Area dengan temuan mayor wajib menyampaikan rencana perbaikan dalam waktu 7 hari kerja.',
            ],
            [
                'tag' => 'Pengumuman Resmi', 'badge' => null, 'title' => 'Portal Panduan TOMS Resmi Digunakan',
                'is_lead' => false, 'days_ago' => 22,
                'excerpt' => 'Panduan TOMS kini tersedia dalam bentuk portal digital yang dapat diakses kapan saja oleh seluruh karyawan.',
                'body' => 'Panduan TOMS kini tersedia dalam bentuk portal digital. Seluruh karyawan dapat mengakses bab dan topik yang relevan kapan saja, mencari dokumen lewat kolom pencarian, serta menyimpan topik favorit setelah masuk ke akun.

Fitur yang tersedia:
1. Daftar Isi bertingkat untuk menelusuri bab, sub-bab, dan topik.
2. Pencarian cepat (Ctrl + K) berdasarkan judul bab dan topik.
3. Tombol Suka untuk menyimpan topik yang sering dibuka; daftarnya ada pada menu Akun Saya.
4. Pusat Bantuan untuk melaporkan kendala teknis, lengkap dengan lampiran screenshot.

Akun baru dibuat melalui halaman Daftar menggunakan kode perusahaan, kemudian diaktifkan oleh admin. Apabila akun belum aktif, mohon menunggu persetujuan atau menghubungi admin.',
            ],
            [
                'tag' => 'Safety Alert', 'badge' => 'PENTING', 'title' => 'Pengingat Penggunaan Sabuk Keselamatan dan APD',
                'is_lead' => false, 'days_ago' => 27,
                'excerpt' => 'Kepatuhan terhadap sabuk keselamatan dan alat pelindung diri tetap menjadi syarat mutlak bagi seluruh personel operasional.',
                'body' => 'Hasil inspeksi lapangan menunjukkan masih ada ketidakpatuhan pada penggunaan sabuk keselamatan dan alat pelindung diri (APD), terutama di area workshop dan terminal. Hal ini diingatkan kembali kepada seluruh personel.

Ketentuan:
1. Pengemudi dan kru wajib menggunakan sabuk keselamatan selama kendaraan bergerak.
2. Petugas workshop wajib menggunakan APD sesuai jenis pekerjaan: sepatu keselamatan, sarung tangan, kacamata, dan rompi.
3. Pelanggaran dicatat dan ditindaklanjuti sesuai tata tertib yang berlaku.

Koordinator area diminta melakukan pengecekan acak secara berkala dan menyampaikan hasilnya pada rapat keselamatan bulanan.',
            ],
            [
                'tag' => 'Update Kebijakan', 'badge' => null, 'title' => 'Pembaruan Prosedur Pelaporan Insiden dan Near Miss',
                'is_lead' => false, 'days_ago' => 33,
                'excerpt' => 'Setiap insiden dan near miss wajib dilaporkan maksimal 1x24 jam melalui jalur pelaporan resmi.',
                'body' => 'Prosedur pelaporan insiden dan near miss diperbarui agar penanganan lebih cepat dan pembelajaran dapat dibagikan ke seluruh area.

Alur pelaporan:
1. Pastikan keselamatan penumpang dan personel terlebih dahulu; hubungi layanan darurat bila diperlukan.
2. Laporkan kepada koordinator area segera setelah situasi aman.
3. Lengkapi formulir laporan dalam 1x24 jam: waktu, lokasi, kronologi singkat, dan dokumentasi pendukung.
4. Tim keselamatan melakukan investigasi dan menetapkan tindakan korektif.

Laporan near miss tidak dimaksudkan untuk mencari kesalahan individu, melainkan untuk mencegah kejadian serupa. Pelapor akan dilindungi dari tindakan yang merugikan.',
            ],
            [
                'tag' => 'Pelatihan SDM', 'badge' => null, 'title' => 'Sosialisasi Standar Pelayanan Pelanggan',
                'is_lead' => false, 'days_ago' => 40,
                'excerpt' => 'Sosialisasi standar pelayanan bagi petugas terminal, kru, dan pengemudi dilaksanakan bertahap di seluruh area.',
                'body' => 'Sosialisasi Standar Pelayanan Pelanggan dilaksanakan bertahap di seluruh area operasional. Materi mencakup sikap pelayanan, penanganan keluhan, serta informasi yang wajib disampaikan kepada penumpang.

Fokus sosialisasi:
1. Sapaan, sikap, dan penampilan petugas.
2. Penanganan keluhan: dengarkan, catat, tindak lanjuti, dan konfirmasi kepada pelanggan.
3. Informasi keberangkatan, keterlambatan, dan perubahan rute yang jelas dan tepat waktu.
4. Pelayanan prioritas bagi penumpang lansia, ibu hamil, dan penyandang disabilitas.

Jadwal sosialisasi diinformasikan oleh koordinator area. Materi lengkap dapat dibaca pada bagian Standar Pelayanan di Dokumentasi.',
            ],
        ];

        foreach ($rows as $r) {
            $days = $r['days_ago'];
            unset($r['days_ago']);

            Announcement::updateOrCreate(
                ['title' => $r['title']],
                $r + ['is_published' => true, 'published_at' => now()->subDays($days)]
            );
        }
    }
}

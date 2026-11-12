<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\DashboardSnapshot;
use Illuminate\Database\Seeder;

/**
 * Data CONTOH agar halaman Informasi & Dashboard tidak kosong saat pertama kali dicoba.
 * Jalankan manual:  php artisan db:seed --class=PortalSampleSeeder
 * Ganti dengan data nyata lewat panel admin.
 */
class PortalSampleSeeder extends Seeder
{
    public function run(): void
    {
        if (Announcement::count() === 0) {
            $rows = [
                ['tag' => 'Pengumuman Resmi', 'title' => 'Penguatan Standar Layanan Operasional Semester II 2025', 'excerpt' => 'Manajemen menetapkan fokus baru pada konsistensi layanan, ketepatan jadwal, serta penguatan budaya keselamatan di seluruh wilayah operasi.', 'is_lead' => true, 'published_at' => '2025-06-14'],
                ['tag' => 'Safety Alert', 'badge' => 'URGENT', 'title' => 'Pemeriksaan Sistem Pengereman Menjelang Musim Hujan', 'excerpt' => 'Seluruh area operasional diwajibkan melakukan pemeriksaan tambahan terhadap sistem pengereman dan kondisi ban.', 'published_at' => '2025-06-12'],
                ['tag' => 'Update Kebijakan', 'badge' => 'BARU', 'title' => 'Revisi SOP Pengendalian Perjalanan Jarak Jauh', 'excerpt' => 'Pembaruan batas waktu mengemudi dan prosedur pergantian pengemudi.', 'published_at' => '2025-06-10'],
                ['tag' => 'Pelatihan SDM', 'badge' => 'PENDAFTARAN', 'title' => 'Jadwal Defensive Driving Training Batch 06', 'excerpt' => 'Pendaftaran pelatihan bagi pengemudi dan koordinator area telah dibuka.', 'published_at' => '2025-06-08'],
                ['tag' => 'Agenda Audit', 'badge' => 'AGENDA', 'title' => 'Audit Kepatuhan Operasional Semester I', 'excerpt' => 'Persiapkan dokumen dan bukti implementasi untuk agenda audit bulan Juli.', 'published_at' => '2025-06-04'],
            ];
            foreach ($rows as $r) {
                Announcement::create($r + ['is_published' => true]);
            }
        }

        DashboardSnapshot::firstOrCreate(['period' => '2025-06'], ['data' => [
            'kpis' => [
                ['label' => 'Ketepatan Jadwal', 'value' => '98.7%', 'delta' => '+1.4%', 'up' => true],
                ['label' => 'Safety Index', 'value' => '96.2', 'delta' => '+0.8', 'up' => true],
                ['label' => 'Kepatuhan SOP', 'value' => '94.8%', 'delta' => '+2.1%', 'up' => true],
                ['label' => 'Load Factor', 'value' => '81.4%', 'delta' => '-0.6%', 'up' => false],
            ],
            'trend' => ['title' => 'Ketepatan jadwal armada', 'months' => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul'],
                'actual' => [95.1, 95.8, 96.4, 97.0, 97.6, 98.7, 98.7], 'target' => [96, 96, 96, 97, 97, 97, 97]],
            'fleet' => ['total' => 184, 'ready' => 156, 'maintenance' => 18, 'unfit' => 10],
            'safety' => ['major' => 0, 'minor' => 4, 'near_miss' => 12, 'investigation_pct' => 100],
            'actions_open' => 3,
        ]]);
    }
}

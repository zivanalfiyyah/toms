<?php

namespace App\Observers;

use App\Models\User;
use App\Support\Audit;
use Illuminate\Database\Eloquent\Model;

/** Audit generik: Pengumuman, Pengguna, Pengaturan, Dashboard, Tiket bantuan. */
class AuditObserver
{
    private const NAMES = [
        'announcement' => ['informasi', 'announcement'],
        'user' => ['pengguna', 'user'],
        'sitesetting' => ['konten portal', 'setting'],
        'dashboardsnapshot' => ['data dashboard kinerja', 'dashboard'],
        'helpticket' => ['laporan kendala', 'ticket'],
    ];

    private const IGNORE_USER_KEYS = ['status', 'approved_at', 'approved_by', 'updated_at', 'remember_token', 'password'];

    public function created(Model $m): void
    {
        [$name, $key] = $this->n($m);
        Audit::log("$key.created", 'Menambahkan '.$name.' “'.Audit::labelOf($m).'”', $m);
    }

    public function updated(Model $m): void
    {
        [$name, $key] = $this->n($m);
        $changed = array_keys($m->getChanges());
        $changed = array_values(array_diff($changed, ['updated_at']));

        if ($m instanceof User) {
            $changed = array_values(array_diff($changed, self::IGNORE_USER_KEYS));
        }
        if (! $changed) {
            return;
        }
        Audit::log("$key.updated", 'Mengubah '.$name.' “'.Audit::labelOf($m).'”', $m, ['bagian_berubah' => $changed]);
    }

    public function deleted(Model $m): void
    {
        [$name, $key] = $this->n($m);
        Audit::log("$key.deleted", 'Menghapus '.$name.' “'.Audit::labelOf($m).'”', $m);
    }

    private function n(Model $m): array
    {
        return self::NAMES[strtolower(class_basename($m))] ?? [strtolower(class_basename($m)), strtolower(class_basename($m))];
    }
}

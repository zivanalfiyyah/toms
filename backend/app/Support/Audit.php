<?php

namespace App\Support;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Audit
{
    /**
     * Catat satu aktivitas. Tidak pernah melempar error (log tidak boleh menggagalkan aksi utama).
     */
    public static function log(string $action, string $description, ?Model $subject = null, array $meta = [], $user = null, ?string $label = null): void
    {
        try {
            $user ??= Auth::user();
            $request = request();

            AuditLog::create([
                'user_id' => $user?->id,
                'user_name' => $user?->name ?? 'Sistem',
                'user_email' => $user?->email,
                'action' => $action,
                'subject_type' => $subject ? strtolower(class_basename($subject)) : null,
                'subject_id' => $subject?->getKey(),
                'subject_label' => $label ?? ($subject ? self::labelOf($subject) : null),
                'description' => $description,
                'ip' => app()->runningInConsole() ? null : $request?->ip(),
                'meta' => $meta ?: null,
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    public static function labelOf(Model $m): ?string
    {
        foreach (['title', 'name', 'email', 'key', 'period', 'subject'] as $f) {
            if (! empty($m->{$f})) {
                return mb_substr((string) $m->{$f}, 0, 200);
            }
        }

        return '#'.$m->getKey();
    }

    /** Jenis dokumen untuk label di daftar "Dokumen Terbaru". */
    public static function docType(string $title): string
    {
        $t = mb_strtolower($title);

        return match (true) {
            (bool) preg_match('/\bsop\b/', $t) => 'SOP',
            (bool) preg_match('/\b(kpi|sla)\b/', $t) => 'KPI',
            (bool) preg_match('/^(form|from|formulir)\b|checklist|\bdraft\b/', $t) => 'Formulir',
            (bool) preg_match('/panduan|pedoman|training|standar/', $t) => 'Panduan',
            (bool) preg_match('/kebijakan|peraturan|ad\/rt|legal/', $t) => 'Kebijakan',
            default => 'Dokumen',
        };
    }
}

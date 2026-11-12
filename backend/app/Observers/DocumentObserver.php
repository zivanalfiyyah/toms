<?php

namespace App\Observers;

use App\Models\Category;
use App\Models\DocumentVersion;
use App\Models\Page;
use App\Support\Audit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/** Versi dokumen + audit untuk Kategori & Halaman. */
class DocumentObserver
{
    private const RELEVANT = ['title', 'name', 'slug', 'description', 'content', 'content_html', 'status', 'parent_id', 'category_id', 'icon'];

    public function updating(Model $m): void
    {
        if (collect(self::RELEVANT)->contains(fn ($f) => $m->isDirty($f))) {
            $m->revision = ((int) $m->getOriginal('revision') ?: 1) + 1;
        }
    }

    public function created(Model $m): void
    {
        $this->version($m, 'created');
        Audit::log('document.created', ($m instanceof Page ? 'Membuat halaman' : 'Membuat kategori').' “'.$this->title($m).'”', $m);
    }

    public function updated(Model $m): void
    {
        if (! $m->wasChanged('revision')) {
            return;
        }
        $this->version($m, 'updated');
        $changed = collect(self::RELEVANT)->filter(fn ($f) => $m->wasChanged($f))->values()->all();
        Audit::log('document.updated', ($m instanceof Page ? 'Memperbarui halaman' : 'Memperbarui kategori').' “'.$this->title($m).'” (Rev. 1.'.($m->revision - 1).')', $m, ['bagian_berubah' => $changed]);
    }

    public function deleted(Model $m): void
    {
        Audit::log('document.deleted', ($m instanceof Page ? 'Menghapus halaman' : 'Menghapus kategori').' “'.$this->title($m).'”', $m);
    }

    private function title(Model $m): string
    {
        return (string) ($m->title ?? $m->name);
    }

    private function version(Model $m, string $action): void
    {
        try {
            $user = Auth::user();
            $title = $this->title($m);
            if ($m instanceof Page) {
                $slugs = [$m->slug];
                $p = $m;
                while ($p->parent_id && ($p = Page::find($p->parent_id))) {
                    array_unshift($slugs, $p->slug);
                }
                $cat = Category::find($m->category_id);
                $path = ($cat?->slug ?? '').'/'.implode('/', $slugs);
                $catName = $cat?->name;
            } else {
                $path = $m->slug;
                $catName = null;
            }

            DocumentVersion::create([
                'kind' => $m instanceof Page ? 'page' : 'category',
                'subject_id' => $m->getKey(),
                'title' => $title,
                'category_name' => $catName,
                'path' => $path,
                'doc_type' => Audit::docType($title),
                'revision' => (int) $m->revision ?: 1,
                'action' => $action,
                'user_id' => $user?->id,
                'user_name' => $user?->name ?? 'Sistem',
                'created_at' => now(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}

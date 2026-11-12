<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\DocumentVersion;
use App\Models\Page;
use App\Services\DocumentPdf;
use App\Support\Audit;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    /** Dokumen terbaru (publik): satu baris per dokumen, versi terakhir. */
    public function latest(Request $request)
    {
        $limit = min(max((int) $request->query('limit', 6), 1), 50);
        $perPage = $limit;

        $latestIds = DocumentVersion::selectRaw('MAX(id) as id')->groupBy('kind', 'subject_id');
        $q = DocumentVersion::whereIn('id', $latestIds)->orderByDesc('created_at')->orderByDesc('id');

        if ($request->boolean('paginate')) {
            $res = $q->paginate($perPage);

            return response()->json($res->through(fn ($v) => $this->row($v))->toArray());
        }

        return response()->json($q->limit($limit)->get()->map(fn ($v) => $this->row($v))->values());
    }

    /** Riwayat versi (khusus admin/editor). */
    public function versions(Request $request)
    {
        $q = DocumentVersion::query()->orderByDesc('id');
        if ($s = trim((string) $request->query('q'))) {
            $q->where('title', 'like', "%$s%");
        }
        if ($a = $request->query('action')) {
            $q->where('action', $a);
        }

        return response()->json($q->paginate(min((int) $request->query('per_page', 20), 100)));
    }

    public function pagePdf(Request $request, Page $page)
    {
        $page->load('category');

        return $this->pdf($request, $page, $page->title);
    }

    public function categoryPdf(Request $request, Category $category)
    {
        return $this->pdf($request, $category, $category->name);
    }

    private function pdf(Request $request, $doc, string $title)
    {
        if (! DocumentPdf::available()) {
            return response()->json(['message' => 'Fitur PDF belum aktif di server (jalankan: composer require dompdf/dompdf).'], 501);
        }

        $user = $request->user();
        $bin = app(DocumentPdf::class)->render($doc, $user);
        Audit::log('document.download', 'Mengunduh PDF “'.$title.'”', $doc);

        return response($bin, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.DocumentPdf::filename($title).'"',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }

    private function row(DocumentVersion $v): array
    {
        return [
            'id' => $v->id,
            'kind' => $v->kind,
            'subject_id' => $v->subject_id,
            'title' => $v->title,
            'category_name' => $v->category_name,
            'doc_type' => $v->doc_type,
            'action' => $v->action,
            'revision' => $v->revision,
            'revision_label' => $v->revision_label,
            'to' => '/docs/'.ltrim((string) $v->path, '/'),
            'user_name' => $v->user_name,
            'created_at' => $v->created_at,
        ];
    }
}

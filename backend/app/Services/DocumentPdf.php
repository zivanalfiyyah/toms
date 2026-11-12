<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Page;
use App\Support\Audit;
use Dompdf\Dompdf;
use Dompdf\Options;

/** Membuat PDF dokumen dengan watermark di latar belakang (dompdf). */
class DocumentPdf
{
    public static function available(): bool
    {
        return class_exists(Dompdf::class);
    }

    public function render(Page|Category $doc, $user): string
    {
        $isPage = $doc instanceof Page;
        $title = $isPage ? $doc->title : $doc->name;
        $body = $isPage ? ($doc->content_html ?: nl2br(e((string) $doc->content_text))) : ($doc->content_html ?: nl2br(e((string) $doc->description)));
        $catName = $isPage ? $doc->category?->name : null;
        $rev = 'Rev. 1.'.max(0, ((int) $doc->revision ?: 1) - 1);
        $updated = ($doc->updated_at ?? now())->copy()->timezone(config('app.timezone'))->locale('id')->translatedFormat('d F Y');
        $company = config('portal.company_name', 'PT Trans Berjaya Khatulistiwa');
        $wmText = config('portal.pdf_watermark', 'TOMS • '.$company);

        $body = $this->localiseImages($body);

        // Watermark memenuhi seluruh halaman: baris-baris miring berselang-seling.
        $marks = '';
        $row = 0;
        for ($top = -20; $top <= 1000; $top += 78) {
            $left = $row % 2 ? 250 : -60;
            foreach ([$left, $left + 520] as $x) {
                $marks .= '<span style="left:'.$x.'px;top:'.$top.'px">'.e($wmText).'</span>';
            }
            $row++;
        }

        $logoToms = resource_path('pdf/logo-toms.png');
        $logoTbk = resource_path('pdf/logo-tbk.png');
        $footer = '<table class="ft"><tr><td class="l">'.(extension_loaded('gd') && is_file($logoToms) ? '<img src="'.$logoToms.'" style="height:26px">' : '').'</td><td class="r">'.(extension_loaded('gd') && is_file($logoTbk) ? '<img src="'.$logoTbk.'" style="height:28px">' : '').'</td></tr></table>';

        $html = '<html><head><meta charset="utf-8"><style>
@page{margin:48px 48px 84px 48px}
body{font-family:DejaVu Sans,sans-serif;font-size:11.5px;color:#1f2a44;line-height:1.6}
.wm{position:fixed;left:0;top:0;width:100%;height:100%;z-index:-1}
.wm span{position:absolute;font-size:19px;font-weight:bold;color:#e9eef8;transform:rotate(-30deg);white-space:nowrap}
table.ft{position:fixed;bottom:-32px;left:0;right:0;width:100%;border:0;border-collapse:collapse}
table.ft td{border:0;padding:0;vertical-align:middle}
table.ft td.l{text-align:left}table.ft td.r{text-align:right}
h1{font-size:22px;color:#14315f;margin:0 0 4px}h2{font-size:16px;color:#14315f}h3{font-size:13.5px;color:#14315f}
.meta{color:#7a8499;font-size:10.5px;margin-bottom:16px;padding-bottom:10px;border-bottom:1px solid #e3e8f2}
table{border-collapse:collapse;width:100%;margin:8px 0}td,th{border:1px solid #b9c2d6;padding:5px 7px;font-size:10.5px}th{background:#eef2fa}
img{max-width:100%}
</style></head><body>
<div class="wm">'.$marks.'</div>
'.$footer.'
<h1>'.e($title).'</h1>
<div class="meta">'.($catName ? e($catName).' • ' : '').e($rev).' • Diperbarui '.e($updated).'</div>
'.$body.'</body></html>';

        $o = new Options();
        $o->set('isRemoteEnabled', false);
        $o->set('defaultFont', 'DejaVu Sans');
        $o->set('chroot', [base_path(), public_path(), storage_path()]);
        $dompdf = new Dompdf($o);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4');
        $dompdf->render();

        return $dompdf->output();
    }

    /** Ubah URL gambar /storage/... menjadi path file lokal agar bisa dimuat dompdf. */
    private function localiseImages(string $html): string
    {
        return preg_replace_callback('/(<img[^>]+src=["\'])([^"\']+)(["\'])/i', function ($m) {
            $src = $m[2];
            if (preg_match('#/storage/(.+)$#', parse_url($src, PHP_URL_PATH) ?: '', $mm)) {
                $file = public_path('storage/'.$mm[1]);
                if (is_file($file)) {
                    return $m[1].$file.$m[3];
                }
            }

            return $m[0];
        }, $html);
    }

    public static function filename(string $title): string
    {
        $slug = \Illuminate\Support\Str::slug($title) ?: 'dokumen';

        return 'TOMS-'.$slug.'.pdf';
    }
}

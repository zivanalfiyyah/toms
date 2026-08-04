<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentImport;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpWord\IOFactory; 

class ImportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|mimes:docx|max:10240',
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
        ]);

        $file = $request->file('file');
        $path = $file->store('imports');

        $documentImport = DocumentImport::create([
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'imported_by' => $request->user()->id ?? null,
            'status' => 'pending',
        ]);

        try {
            $bodyHtml = $this->extractHtmlFromDocx($path);
            $bodyHtml = $this->cleanWordHtml($bodyHtml);

            $bodyHtml = $this->extractAndSaveImages($bodyHtml, $documentImport->id);
            $tiptapJson = $this->htmlToTiptapJson($bodyHtml);

            $page = Page::create([
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'slug' => Str::slug($validated['title']),
                'content' => $tiptapJson,
                'content_html' => $bodyHtml,
                'content_text' => strip_tags($bodyHtml),
                'status' => 'draft',
                'created_by' => $request->user()->id ?? null,
            ]);

            $documentImport->update([
                'page_id' => $page->id,
                'status' => 'success',
            ]);

            return response()->json([
                'message' => 'Import success',
                'page' => $page,
            ], 201);

        } catch (\Exception $e) {
            $documentImport->update([
                'status' => 'failed',
                'error_message' => $e->getMessage() . ' on line ' . $e->getLine(),
            ]);

            return response()->json([
                'message' => 'Import Failed',
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 422);
        }
    }

    public function update(Request $request, $page)
    {
        $pageModel = $page instanceof Page ? $page : Page::findOrFail($page);

        $validated = $request->validate([
            'file' => 'required|file|mimes:docx|max:10240',
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:255',
        ]);

        $file = $request->file('file');
        $path = $file->store('imports');

        $documentImport = DocumentImport::create([
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $path,
            'imported_by' => $request->user()->id ?? null,
            'status' => 'pending',
            'page_id' => $pageModel->id,
        ]);

        try {
            $bodyHtml = $this->extractHtmlFromDocx($path);
            $bodyHtml = $this->cleanWordHtml($bodyHtml);
            $bodyHtml = $this->extractAndSaveImages($bodyHtml, $documentImport->id);
            $tiptapJson = $this->htmlToTiptapJson($bodyHtml);

            $pageModel->update([
                'content' => $tiptapJson,
                'content_html' => $bodyHtml,
                'content_text' => strip_tags($bodyHtml),
                'updated_by' => $request->user()->id ?? null,
            ]);

            $documentImport->update([
                'status' => 'success',
            ]);

            return response()->json([
                'message' => 'Re-import/Update success',
                'page' => $pageModel,
            ], 200);

        } catch (\Exception $e) {
            $documentImport->update([
                'status' => 'failed',
                'error_message' => $e->getMessage() . ' on line ' . $e->getLine(),
            ]);

            return response()->json([
                'message' => 'Update Import Failed',
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 422);
        }
    }

    private function extractHtmlFromDocx(string $filePath): string
    {
        $fullPath = storage_path('app/private/' . $filePath);
        if (!file_exists($fullPath)) {
            $fullPath = storage_path('app/' . $filePath);
        }

        $phpWord = IOFactory::load($fullPath);

        foreach ($phpWord->getSections() as $section) {
            $this->injectBulletsToPhpWord($section);
        }

        $htmlWriter = IOFactory::createWriter($phpWord, 'HTML');

        ob_start();
        $htmlWriter->save('php://output');
        $fullHtml = ob_get_clean();

        if (preg_match('/<body[^>]*>(.*?)<\/body>/is', $fullHtml, $matches)) {
            return $matches[1];
        }

        return $fullHtml;
    }

    private function injectBulletsToPhpWord($container): void
    {
        if (!method_exists($container, 'getElements')) {
            return;
        }

        foreach ($container->getElements() as $element) {
            if ($element instanceof \PhpOffice\PhpWord\Element\Table) {
                foreach ($element->getRows() as $row) {
                    foreach ($row->getCells() as $cell) {
                        $this->injectBulletsToPhpWord($cell);
                    }
                }
            } elseif ($element instanceof \PhpOffice\PhpWord\Element\ListItem) {
                $text = $element->getText();
                if ($text !== '' && !str_starts_with(trim($text), '•')) {
                    $element->setText('• ' . $text);
                }
            } elseif ($element instanceof \PhpOffice\PhpWord\Element\ListItemRun) {
                $children = $element->getElements();
                if (!empty($children)) {
                    foreach ($children as $child) {
                        if ($child instanceof \PhpOffice\PhpWord\Element\Text) {
                            $text = $child->getText();
                            if ($text !== '' && !str_starts_with(trim($text), '•')) {
                                $child->setText('• ' . $text);
                                break; 
                            }
                        }
                    }
                }
            }
        }
    }

private function cleanWordHtml(string $html): string
    {
        $html = str_replace(
            ['&nbsp;', "\xC2\xA0", "\xE2\x80\x8B", '&#46;', '&period;', '&#8226;', '&amp;amp;'],
            [' ', ' ', ' ', '.', '.', '•', '&amp;'],
            $html
        );

        $html = preg_replace_callback(
            '/<span[^>]*style="[^"]*font-weight:\s*(bold|700)[^"]*"[^>]*>(.*?)<\/span>/is',
            fn($m) => '<strong>' . $m[2] . '</strong>',
            $html
        );
        $html = preg_replace_callback(
            '/<span[^>]*style="[^"]*font-style:\s*italic[^"]*"[^>]*>(.*?)<\/span>/is',
            fn($m) => '<em>' . $m[2] . '</em>',
            $html
        );
        $html = preg_replace_callback(
            '/<span[^>]*style="[^"]*text-decoration:\s*underline[^"]*"[^>]*>(.*?)<\/span>/is',
            fn($m) => '<u>' . $m[2] . '</u>',
            $html
        );

        $html = preg_replace('/<\/?span[^>]*>/i', '', $html);

        for ($i = 0; $i < 5; $i++) {
            $html = preg_replace(
                '/(<p[^>]*>\s*•\s*[\s\S]*?)<\/p>\s*<p[^>]*>(?!\s*(?:•|\d+\.|[A-Z]\.\s|<h[1-6]|➡|PROSES|INPUT|OUTPUT|KESIMPULAN|BAB|Tujuan|How To))(.*?)<\/p>/iu',
                '$1 $2</p>',
                $html
            );
        }

        $html = preg_replace('/<p[^>]*>\s*•\s*(.*?)<\/p>/ius', '<ul><li>$1</li></ul>', $html);
        $html = preg_replace('/<\/ul>\s*<ul>/ius', '', $html);

        $html = preg_replace('/(?:\s*(?:\.|\x{2026}|…|â€¦|&hellip;)\s*){2,}/u', '', $html);

        $html = preg_replace('/(\?|:|\))\s*\.\s*/u', '$1', $html);

        $html = preg_replace('/\s+\.\s*(?=<\/(?:li|p|h[1-6]|strong|b|em|i|td)>)/i', '', $html);
        $html = preg_replace('/(?<=\w|\))\s*\.\s*(?=<\/(?:li|p|h[1-6]|td)>)/i', '', $html);

        for ($i = 0; $i < 5; $i++) {
            $html = preg_replace('/<(p|li|h[1-6]|div|strong|em|u)[^>]*>\s*\.?\s*<\/\1>/i', '', $html);
        }

        for ($i = 0; $i < 5; $i++) {
            $html = preg_replace('/<(p|li|h[1-6]|div)[^>]*>\s*<\/\1>/i', '', $html);
        }
        $html = preg_replace('/class="[^"]*"/i', '', $html);
        $html = preg_replace('/ {2,}/', ' ', $html);

        $html = preg_replace_callback('/<img[^>]+src=["\']([^"\']+)["\'][^>]*>/i', function($m) {
            return '<img src="' . $m[1] . '" style="max-width: 400px; width: 100%; height: auto; display: block; margin: 1.5rem auto;">';
        }, $html);

        return trim($html);
    }

    private function htmlToTiptapJson(string $html): array
    {
        if (empty(trim($html))) {
            return ['type' => 'doc', 'content' => []];
        }

        $dom = new \DOMDocument();
    
        $wrappedHtml = '<html><body>' . mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8') . '</body></html>';

        @$dom->loadHTML(
            '<?xml encoding="utf-8" ?>' . $wrappedHtml,
            LIBXML_HTML_NODEFDTD
        );

        $content = [];

        $body = $dom->getElementsByTagName('body')->item(0);
        
        if ($body) {
            foreach ($body->childNodes as $node) {
                if ($node->nodeType === XML_ELEMENT_NODE) {
                    $converted = $this->convertNode($node);
                    if (!empty($converted)) {
                        $content[] = $converted;
                    }
                }
            }
        }

        return [
            'type' => 'doc',
            'content' => $content,
        ];
    }

   private function convertNode(\DOMNode $node): array
    {
        $tag = strtolower($node->nodeName);

        if ($tag === 'p') {
            return [
                'type' => 'paragraph',
                'content' => $this->convertInline($node),
            ];
        }

        if (in_array($tag, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])) {
            $level = (int) substr($tag, 1);
            return [
                'type' => 'heading',
                'attrs' => ['level' => $level],
                'content' => $this->convertInline($node),
            ];
        }

        if ($tag === 'img') {
            $src = $node->attributes->getNamedItem('src')?->nodeValue;
            if ($src) {
                return ['type' => 'image', 'attrs' => ['src' => $src]];
            }
        }

        if ($tag === 'table') {
            return $this->convertTable($node);
        }

        if (in_array($tag, ['ul', 'ol'])) {
            return $this->convertList($node, $tag);
        }

        return [];
    }

    private function convertList(\DOMNode $listNode, string $tag): array
    {
        $items = [];
        foreach ($listNode->childNodes as $li) {
            if (strtolower($li->nodeName) === 'li') {
                $liContent = [];
                
                foreach ($li->childNodes as $child) {
                    if ($child->nodeType === XML_ELEMENT_NODE) {
                        $converted = $this->convertNode($child);
                        if (!empty($converted)) $liContent[] = $converted;
                    } elseif ($child->nodeType === XML_TEXT_NODE && trim($child->nodeValue) !== '') {
                        $liContent[] = [
                            'type' => 'paragraph',
                            'content' => [['type' => 'text', 'text' => $child->nodeValue]]
                        ];
                    }
                }

                if (empty($liContent)) {
                    $liContent[] = ['type' => 'paragraph', 'content' => $this->convertInline($li)];
                }

                $items[] = ['type' => 'listItem', 'content' => $liContent];
            }
        }

        if (empty($items)) return [];

        return [
            'type' => $tag === 'ul' ? 'bulletList' : 'orderedList',
            'content' => $items,
        ];
    }

    private function convertTable(\DOMNode $tableNode): ?array
    {
        $rows = [];
        $trNodes = $this->findDescendants($tableNode, 'tr');

        foreach ($trNodes as $tr) {
            $cells = [];
            foreach ($tr->childNodes as $cell) {
                $cellTag = strtolower($cell->nodeName);
                if (!in_array($cellTag, ['td', 'th'])) {
                    continue;
                }

                $cellContent = [];
                foreach ($cell->childNodes as $child) {
                    $converted = $this->convertNode($child);
                    if (!empty($converted)) {
                        $cellContent[] = $converted;
                    }
                }

                if (empty($cellContent)) {
                    $cellContent[] = [
                        'type' => 'paragraph',
                        'content' => $this->convertInline($cell)
                    ];
                }

                $cells[] = [
                    'type' => $cellTag === 'th' ? 'tableHeader' : 'tableCell',
                    'content' => $cellContent,
                ];
            }

            if (!empty($cells)) {
                $rows[] = ['type' => 'tableRow', 'content' => $cells];
            }
        }

        if (empty($rows)) {
            return null;
        }

        return ['type' => 'table', 'content' => $rows];
    }

    private function findDescendants(\DOMNode $node, string $tagName): array
    {
        $results = [];
        foreach ($node->childNodes as $child) {
            if (strtolower($child->nodeName) === $tagName) {
                $results[] = $child;
            }
            $results = array_merge($results, $this->findDescendants($child, $tagName));
        }
        return $results;
    }

    private function convertInline(\DOMNode $node, array $marks = []): array
    {
        $result = [];

        foreach ($node->childNodes as $child) {
            if ($child->nodeType === XML_TEXT_NODE) {
                $text = $child->nodeValue;
                if ($text !== '') {
                    $textNode = ['type' => 'text', 'text' => $text];
                    if (!empty($marks)) {
                        $textNode['marks'] = $marks;
                    }
                    $result[] = $textNode;
                }
            } elseif ($child->nodeType === XML_ELEMENT_NODE) {
                $tag = strtolower($child->nodeName);

                if ($tag === 'img') {
                    $src = $child->attributes->getNamedItem('src')?->nodeValue;
                    if ($src) {
                        $result[] = [
                            'type' => 'image',
                            'attrs' => ['src' => $src],
                        ];
                    }
                    continue; 
                }

                $newMarks = $marks;

                if (in_array($tag, ['strong', 'b'])) {
                    $newMarks[] = ['type' => 'bold'];
                } elseif (in_array($tag, ['em', 'i'])) {
                    $newMarks[] = ['type' => 'italic'];
                } elseif ($tag === 'u') {
                    $newMarks[] = ['type' => 'underline'];
                }

                $result = array_merge($result, $this->convertInline($child, $newMarks));
            }
        }

        return $result;
    }

    private function extractAndSaveImages(string $html, int $importId): string
    {
        return preg_replace_callback(
            '/<img[^>]+src=["\']data:(image\/[a-zA-Z]+);base64,([^"\']+)["\'][^>]*>/i',
            function ($matches) use ($importId) {
                $mimeType = $matches[1];
                $base64Data = $matches[2];
                $extension = str_replace('image/', '', $mimeType);
                $extension = $extension === 'jpeg' ? 'jpg' : $extension;

                $filename = 'import/' . $importId . '/' . uniqid('img_') . '.' . $extension;

                Storage::disk('public')->put($filename, base64_decode($base64Data));

                $url = url(Storage::url($filename)); 

                return '<img src="' . $url . '">';
            },
            $html
        );
    }
}
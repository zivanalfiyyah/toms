<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentImport;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Writer\HTML;

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
            'imported_by' => $request->user()->id,
            'status' => 'pending',
        ]);

        try {
            $phpWord = IOFactory::load(storage_path('app/private/' . $path));
        } catch (\Exception $e) {
            $documentImport->update([
                'status' => 'failed',
                'error_message' => 'File tidak bisa dibaca sebagai dokumen Word',
            ]);

            return response()->json([
                'message' => 'gagal membaca file. pastikan file berformat .docx',
            ], 422);
        }

        try {

            $htmlWriter = new HTML($phpWord);
            $tempHtmlPath = storage_path('app/temp' . uniqid() . '.html');
            $htmlWriter->save($tempHtmlPath);

            $rawHtml = file_get_contents($tempHtmlPath);
            unlink($tempHtmlPath);

            preg_match('/<body[^>]*>(.*?)<\/body>/is', $rawHtml, $matches);
            $bodyHtml = $matches[1] ?? $rawHtml;

            $tiptapJson = $this->htmlToTiptapJson($bodyHtml);

            $page = Page::create([
                'category_id' => $validated['category_id'],
                'title' => $validated['title'],
                'slug' => Str::slug($validated['title']),
                'content' => $tiptapJson,
                'content_html' => $bodyHtml,
                'content_text' => strip_tags($bodyHtml),
                'status' => 'draft',
                'created_by' => $request->user()->id,
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
                'error_message' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Import Failed',
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    private function htmlToTiptapJson(string $html): array
    {
        $dom = new \DOMDocument();
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="utf-8" ?>' . $html);
        libxml_clear_errors();

        $body = $dom->getElementsByTagName('body')->item(0);
        $content = [];

        if ($body) {
            foreach ($body->childNodes as $node) {
                $converted = $this->convertNode($node);
                if ($converted) {
                    $content[] = $converted;
                }
            }
        }

        return ['type' => 'doc', 'content' => $content];
    }

    private function convertNode(\DOMNode $node): ?array
    {
        if ($node->nodeType !== XML_ELEMENT_NODE) {
            return null;
        }

        $tag = strtolower($node->nodeName);

        return match (true) {
            $tag === 'p' => ['type' => 'paragraph', 'content' => $this->convertInline($node)],
            preg_match('/^h[1-6]$/', $tag) === 1 => [
                'type' => 'heading',
                'attrs' => ['level' => (int) substr($tag, 1)],
                'content' => $this->convertInline($node),
            ],
            $tag === 'ul' => ['type' => 'bulletList', 'content' => $this->convertListItems($node)],
            $tag === 'ol' => ['type' => 'orderedList', 'content' => $this->convertListItems($node)],
            default => null,
        };
    }

    private function convertListItems(\DOMNode $listnode): array
    {
        $items = [];

        foreach ($listnode->childNodes as $child) {
            if (strtolower($child->nodeName) === 'li') {
                $items[] = [
                    'type' => 'listItem',
                    'content' => [['type' => 'paragraph', 'content' => $this->convertInline($child)]],  
                ];
            }
        }

        return $items;
    }

    private function convertInline(\DOMNode $node, array $marks = []): array
    {
        $result = [];

        foreach ($node->childNodes as $child) {
            if ($child->nodeType === XML_TEXT_NODE) {
                $text = trim($child->textContent);
                if ($text !== '') {
                    $textNode = ['type' => 'text', 'text' => $child->textContent];
                    if (! empty($marks)) {
                        $textNode['marks'] = $marks;
                    }
                    $result[] = $textNode;
                }
            } elseif ($child->nodeType === XML_ELEMENT_NODE) {
                $tag = strtolower($child->nodeName);
                $newMarks = $marks;

                if (in_array($tag, ['strong', 'b'])) {
                    $newMarks[] = ['type' => 'bold'];
                } elseif (in_array($tag, ['em', 'i'])) {
                    $newMarks[] = ['type' => 'italic'];
                }

                $result = array_merge($result, $this->convertInline($child, $newMarks));
            }
        }

        return $result;
    }

}

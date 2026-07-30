<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentImport;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Writer\HTML;
use Illuminate\Support\Facades\Storage;

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
            $bodyHtml = $this->extractAndSaveImages($bodyhtml, $documentImport->id);

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
            $tag === 'table' => $this->convertTable($node),
            $tag === 'img' => $this->convertImage($node),
            default => null,
        };
    }

    private function convertTable(\DOMNode $tableNode): array
    {
        $rows = [];

        $trNodes = $this->findDescendants($tableNode, 'tr');

        foreach ($trNodes as $tr) {
            $cells = [];
            foreach ($tr->childNodes as $cell) {
                $cellTag = strtolower($cell->nodeName);
                if (! in_array($cellTag, ['td', 'th'])) {
                    continue;
                }

                $cellContent = [];
                foreach ($cell->childNodes as $child) {
                    $converted = $this->convertNode($child);
                    if ($converted) {
                        $cellContent[] = $converted;
                    }
                }

                if (empty($cellContent)) {
                    $cellContent[] = ['type' => 'paragraph', 'content' => $this->convertInline($cell)];
                }

                $cells[] = [
                    'type' => $cellTag === 'th' ? 'tableHeader' : 'tableCell',
                    'content' => $cellContent,
                ];
            }

            if (! empty($cells)) {
                $rows[] = ['type' => 'tableRow', 'content' => $cells];
            }
        }

        return ['type' => 'table', 'content' => $rows];
    }

    private function convertImage(\DOMNode $imgNode): array
    {
        $src = $imgNode->attributes->getNamedItem('src')?->nodeValue ?? '';
        $alt = $imgNode->attributes->getNamedItem('alt')?->nodeValue ?? '';

        return [
            'type' => 'image',
            'attrs' => ['src' => $src, 'alt' => $alt],
        ];
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

    private function extractAndSaveImages(string $html, int $importId): string
    {
        return preg_replace_callback(
            '/<img[^>]+src="data:(image\/[a-zA-Z]+);base64,([^"]+)"[^>]*>/i',
            function ($matches) use ($importId) {
                $mimeType = $macthes[1];
                $base64Data = $matches[2];
                $extension = str_replace('image/', '', $mimeType);
                $extension = $extension === 'jpeg' ? 'jpg' : $extension;

                $filename = 'import/' . $importId . '/' . uniqid('img') . '.' . $extension;
                Storage::disk('public')->put($filename, base_decode($base64Data));

                $url = Storage::url($filename);

                return '<img src="' . $url . '">';

            },
            $html
        );
    }

}

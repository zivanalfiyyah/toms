<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Page;
use Illuminate\Support\Str;
use App\Http\Resources\PageResource;

class PageController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Page::with('category');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if (! $request->user() || ! $request->user()->can('manage-pages')) {
            $query->where('status', 'published');
        }

        $pages = $query->orderBy('order')->get();

        return PageResource::collection($pages);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255',
            'content' => 'required|array',
            'status' => 'in:draft,published',
            'order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
        $validated['content_html'] = $this->renderHtml($validated['content']);
        $validated['content_text'] = strip_tags($validated['content_html']);
        $validated['created_by'] = $request->user()->id;

        $page = Page::create($validated);

        return new PageResource($page, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Page $page)
    {
        return new PageResource($page->load('category', 'creator', 'updater'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|array',
            'status' => 'in:draft,published',
            'order' => 'nullable|integer',
        ]);

        if (isset($validated['title'])){
            $validated['slug'] = Str::slug($validated['title']);
        }
        if (isset($validated['content'])) {
            $validated['content_html'] = $this->renderHtml($validated['content']);
            $validated['content_text'] = strip_tags($validated['content_html']);
        }
        
        $validated['updated_by'] = $request->user()->id;

        $page->update($validated);

        return new PageResource($page->load('category', 'creator', 'updater'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Page $page)
    {
        $page->delete();

        return response()->json(['message' => 'Page deleted']);
    }

    private function renderHtml(array $content): string
    {
        if (! isset($content['content'])) {
            return '';
        }

        return $this->renderNodes($content['content']);
    }

    private function renderNodes(array $nodes): string
    {
        $html = '';

        foreach ($nodes as $node) {
            $html .= $this->renderNode($node);
        }

        return $html;
    }

    private function renderNode(array $node): string
    {
        $type = $node['type'] ?? null;
        $children = isset($node['content']) ? $this->renderNodes($node['content']) : '';

        return match ($type) {
            'paragraph' => "<p>{$children}</p>",
            'heading' => $this->renderHeading($node, $children),
            'text' => $this->renderText($node),
            'bulletList' => "<ul>{$children}</ul>",
            'orderedList' => "<ol>{$children}</ol>",
            'listItem' => "<li>{$children}</li>",
            'blockquote' => "<blockquote>{$children}</blockquote>",
            'hardBreak' => '<br>',
            default => $children,
        };
    }

    private function renderHeading(array $node, string $children): string
    {
        $level = $node['attrs']['level'] ?? 1;

        return "<h{$level}>{$children}</h{$level}>";
    }

    private function renderText(array $node): string
    {
        $text = htmlspecialchars($node['text'] ?? '');
        $marks = $node['marks'] ?? [];

        foreach ($marks as $mark) {
            $text = match ($mark['type'] ?? null) {
                'bold' => "<strong>{$text}</strong>",
                'italic' => "<em>{$text}</em>",
                'underline' => "<u>{$text}</u>",
                'strike' => "<s>{$text}</s>",
                'code' => "<code>{$text}</code>",
                default => $text,
            };
        }

        return $text;
    }
}

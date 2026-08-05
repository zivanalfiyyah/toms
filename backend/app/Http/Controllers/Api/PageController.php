<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Page;
use Illuminate\Support\Str;
use App\Http\Resources\PageResource;
use Illuminate\Support\Facades\Storage;

class PageController extends Controller
{
    public function index(Request $request)
    {
        $query = Page::with('category', 'children');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if (! $request->user() || ! $request->user()->can('manage-pages')) {
            $query->where('status', 'published');
        }

        $pages = $query->orderBy('order')->get();

        return PageResource::collection($pages);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'parent_id' => 'nullable|exists:pages,id',
            'title' => 'required|string|max:255',
            'content' => 'required|array',
            'content_html' => 'required|string', 
            'status' => 'in:draft,published',
            'order' => 'nullable|integer',
        ]);

        $validated['slug'] = Str::slug($validated['title']);
    
        $validated['content_text'] = strip_tags($validated['content_html']);
        $validated['created_by'] = $request->user()->id;

        $page = Page::create($validated);

        return new PageResource($page, 201);
    }

    public function show(Page $page)
    {
        return new PageResource($page->load('category', 'creator', 'updater', 'children'));
    }

    public function update(Request $request, Page $page)
    {
        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'parent_id' => 'nullable|exists:pages,id',
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|array',
            'content_html' => 'sometimes|string', 
            'status' => 'in:draft,published',
            'order' => 'nullable|integer',
        ]);

        if (isset($validated['title'])){
            $validated['slug'] = Str::slug($validated['title']);
        }
        
        if (isset($validated['content_html'])) {
            $validated['content_text'] = strip_tags($validated['content_html']);
        }
        
        $validated['updated_by'] = $request->user()->id;

        $page->update($validated);

        return new PageResource($page->load('category', 'creator', 'updater', 'children'));
    }

    public function destroy(Page $page)
    {
        $page->delete();

        return response()->json(['message' => 'Page deleted']);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        $path = $request->file('image')->store('editor-image', 'public');
        $url = url(Storage::url($path));

        return response()->json(['url' => $url]);
    }
}
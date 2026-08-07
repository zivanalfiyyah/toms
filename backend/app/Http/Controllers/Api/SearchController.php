<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SearchController extends Controller
{
    public function index(Request $request) 
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $q = $validated['q'];

        $pages = Page::query()
            ->where(function ($sub) use ($q) {
                $sub->where('title', 'LIKE', "%{$q}%")
                    ->orWhere('content_text', 'LIKE', "%{$q}%");
            })
            ->with(['category', 'parent'])
            ->limit(20)
            ->get();

        $results = $pages->map(function ($page) {
            $categorySlug = $page->category ? $page->category->slug : '';

            if ($page->parent_id && $page->parent) {
                $path = "{$categorySlug}/{$page->parent->slug}/{$page->slug}";
            } else if ($categorySlug) {
                $path = "{$categorySlug}/{$page->slug}";
            } else {
                $path = $page->slug;
            }

            return [
                'id' => $page->id,
                'title' => $page->title,
                'snippet' => Str::limit($page->content_text ?? '', 100),
                'path' => $path, 
                'status' => $page->status,
            ];
        });

        return response()->json($results);
    }
}
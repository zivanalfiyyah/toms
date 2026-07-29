<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function index(Request $request) 
    {
        $validated = $request->validate([
            'q' => 'required|string|min:2',
        ]);

        $query = Page::query()
            ->whereFullText(['title', 'content_text'], $validated['q']);

            if (! $request->user() || ! $request->user()->can('manage-pages')) {
                $query->where('status', 'published');
            }

            $results = $query->with('category')
                ->limit(20)
                ->get(['id', 'category_id', 'title', 'slug', 'content_text', 'status']);

                return response()->json($results);
    }
}

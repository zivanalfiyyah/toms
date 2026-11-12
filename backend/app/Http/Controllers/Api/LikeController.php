<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\CategoryLike;
use App\Models\Like;
use App\Models\Page;
use App\Support\Audit;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    /** Daftar halaman yang disukai pengguna yang sedang login. */
    public function index(Request $request)
    {
        $likes = Like::with('page.category')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->filter(fn ($l) => $l->page)
            ->map(fn ($l) => [
                'id' => $l->page->id,
                'title' => $l->page->title,
                'slug' => $l->page->slug,
                'parent_id' => $l->page->parent_id,
                'category' => $l->page->category ? [
                    'id' => $l->page->category->id,
                    'name' => $l->page->category->name,
                    'slug' => $l->page->category->slug,
                ] : null,
                'liked_at' => $l->created_at,
            ])
            ->values();

        return response()->json($likes);
    }

    public function store(Request $request, Page $page)
    {
        $like = Like::firstOrCreate(['user_id' => $request->user()->id, 'page_id' => $page->id]);
        if ($like->wasRecentlyCreated) {
            Audit::log('document.like', 'Menyukai halaman “'.$page->title.'”', $page);
        }

        return response()->json(['liked' => true, 'likes_count' => $page->likes()->count()]);
    }

    public function destroy(Request $request, Page $page)
    {
        if (Like::where('user_id', $request->user()->id)->where('page_id', $page->id)->delete()) {
            Audit::log('document.unlike', 'Membatalkan suka halaman “'.$page->title.'”', $page);
        }

        return response()->json(['liked' => false, 'likes_count' => $page->likes()->count()]);
    }

    // ---- Suka untuk kategori (bab) ----

    public function categoryStatus(Request $request, Category $category)
    {
        return response()->json($this->categoryState($request, $category));
    }

    public function categoryStore(Request $request, Category $category)
    {
        $like = CategoryLike::firstOrCreate(['user_id' => $request->user()->id, 'category_id' => $category->id]);
        if ($like->wasRecentlyCreated) {
            Audit::log('document.like', 'Menyukai kategori “'.$category->name.'”', $category);
        }

        return response()->json($this->categoryState($request, $category));
    }

    public function categoryDestroy(Request $request, Category $category)
    {
        if (CategoryLike::where('user_id', $request->user()->id)->where('category_id', $category->id)->delete()) {
            Audit::log('document.unlike', 'Membatalkan suka kategori “'.$category->name.'”', $category);
        }

        return response()->json($this->categoryState($request, $category));
    }

    private function categoryState(Request $request, Category $category): array
    {
        return [
            'liked' => CategoryLike::where('user_id', $request->user()->id)->where('category_id', $category->id)->exists(),
            'likes_count' => CategoryLike::where('category_id', $category->id)->count(),
        ];
    }
}

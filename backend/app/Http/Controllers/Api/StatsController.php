<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Category;
use App\Models\Page;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'users_count' => User::count(),
            'categories_count' => Category::count(),
            'pages_count' => Page::count(),
            'children_count' => Page::whereNotNull('parent_id')->count(),
        ]);
    }

    /**
     * Angka ringkas untuk Beranda (publik). "Topik terdata" memakai hitungan yang
     * sama dengan Daftar Isi: setiap bab + seluruh halaman di semua level (sama dengan data /categories).
     */
    public function publicStats()
    {
        $categories = Category::count();
        $pages = Page::count();

        return response()->json([
            'categories_count' => $categories,
            'pages_count' => $pages,
            'topics_count' => $categories + $pages,
        ]);
    }
}

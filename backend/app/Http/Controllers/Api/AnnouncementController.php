<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    /** Publik: hanya yang terbit. Admin/editor (dengan token) melihat semuanya lewat ?all=1. */
    public function index(Request $request)
    {
        $user = $request->user('sanctum');
        $query = Announcement::query()->orderByDesc('is_lead')->orderByDesc('published_at')->orderByDesc('id');

        if (! ($user && $user->can('manage-pages') && $request->boolean('all'))) {
            $query->where('is_published', true)
                ->where(fn ($q) => $q->whereNull('published_at')->orWhere('published_at', '<=', now()));
        }

        return response()->json($query->get());
    }

    public function show(Announcement $announcement)
    {
        abort_unless($announcement->is_published, 404);

        return response()->json($announcement);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['created_by'] = $request->user()->id;
        $data['published_at'] = $data['published_at'] ?? now();

        $item = Announcement::create($data);
        $this->singleLead($item);

        return response()->json($item, 201);
    }

    public function update(Request $request, Announcement $announcement)
    {
        $announcement->update($this->validated($request));
        $this->singleLead($announcement);

        return response()->json($announcement->fresh());
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(['message' => 'Pengumuman dihapus']);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'tag' => 'required|string|max:100',
            'badge' => 'nullable|string|max:40',
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'body' => 'nullable|string',
            'image_url' => 'nullable|url|max:500',
            'is_lead' => 'boolean',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ]);
    }

    /** Hanya satu berita utama pada satu waktu. */
    private function singleLead(Announcement $item): void
    {
        if ($item->is_lead) {
            Announcement::where('id', '!=', $item->id)->where('is_lead', true)->update(['is_lead' => false]);
        }
    }
}

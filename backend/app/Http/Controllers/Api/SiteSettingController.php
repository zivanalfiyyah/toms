<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\Request;

class SiteSettingController extends Controller
{
    /** Publik: semua pengaturan konten (kunci yang belum diisi bernilai null → frontend pakai bawaan). */
    public function index()
    {
        $stored = SiteSetting::whereIn('key', SiteSetting::KEYS)->pluck('value', 'key');

        return response()->json(collect(SiteSetting::KEYS)->mapWithKeys(fn ($k) => [$k => $stored[$k] ?? null]));
    }

    public function update(Request $request, string $key)
    {
        abort_unless(in_array($key, SiteSetting::KEYS, true), 404);

        $rules = match ($key) {
            'contact' => [
                'value' => 'required|array',
                'value.email' => 'required|email|max:255',
                'value.phone' => 'nullable|string|max:60',
                'value.hours' => 'nullable|string|max:120',
            ],
            'faq' => [
                'value' => 'required|array|max:30',
                'value.*.title' => 'required|string|max:150',
                'value.*.items' => 'required|array|max:60',
                'value.*.items.*.q' => 'required|string|max:500',
                'value.*.items.*.a' => 'required',
            ],
            'bab_topics' => [
                'value' => 'required|array|max:30',
                'value.*.title' => 'required|string|max:150',
                'value.*.goal' => 'nullable|string|max:500',
                'value.*.topics' => 'required|array|max:40',
                'value.*.topics.*' => 'string|max:200',
            ],
        };

        $data = $request->validate($rules);
        $row = SiteSetting::updateOrCreate(['key' => $key], ['value' => $data['value']]);

        return response()->json([$key => $row->value]);
    }

    /** Kembalikan ke isi bawaan di frontend. */
    public function destroy(string $key)
    {
        abort_unless(in_array($key, SiteSetting::KEYS, true), 404);
        SiteSetting::where('key', $key)->delete();

        return response()->json(['message' => 'Dikembalikan ke bawaan']);
    }
}

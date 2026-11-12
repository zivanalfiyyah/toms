<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DashboardSnapshot;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /** Daftar periode yang tersedia (terbaru dulu). */
    public function periods()
    {
        return response()->json(DashboardSnapshot::orderByDesc('period')->pluck('period'));
    }

    /** Data dashboard; tanpa ?period= dipakai periode terbaru. */
    public function show(Request $request)
    {
        $query = DashboardSnapshot::query();
        $snap = $request->filled('period')
            ? $query->where('period', $request->period)->first()
            : $query->orderByDesc('period')->first();

        if (! $snap) {
            return response()->json(['period' => null, 'data' => null]);
        }

        return response()->json(['period' => $snap->period, 'data' => $snap->data]);
    }

    /** Buat/ubah data satu periode. */
    public function upsert(Request $request, string $period)
    {
        abort_unless(preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $period), 422, 'Format periode harus YYYY-MM');

        $data = $request->validate([
            'kpis' => 'required|array|max:8',
            'kpis.*.label' => 'required|string|max:60',
            'kpis.*.value' => 'required|string|max:30',
            'kpis.*.delta' => 'nullable|string|max:30',
            'kpis.*.up' => 'boolean',
            'trend' => 'nullable|array',
            'trend.title' => 'nullable|string|max:80',
            'trend.months' => 'nullable|array|max:12',
            'trend.months.*' => 'string|max:10',
            'trend.actual' => 'nullable|array|max:12',
            'trend.actual.*' => 'numeric',
            'trend.target' => 'nullable|array|max:12',
            'trend.target.*' => 'numeric',
            'fleet' => 'nullable|array',
            'fleet.total' => 'nullable|integer|min:0',
            'fleet.ready' => 'nullable|integer|min:0',
            'fleet.maintenance' => 'nullable|integer|min:0',
            'fleet.unfit' => 'nullable|integer|min:0',
            'safety' => 'nullable|array',
            'safety.major' => 'nullable|integer|min:0',
            'safety.minor' => 'nullable|integer|min:0',
            'safety.near_miss' => 'nullable|integer|min:0',
            'safety.investigation_pct' => 'nullable|numeric|min:0|max:100',
            'actions_open' => 'nullable|integer|min:0',
        ]);

        $snap = DashboardSnapshot::updateOrCreate(
            ['period' => $period],
            ['data' => $data, 'updated_by' => $request->user()->id]
        );

        return response()->json(['period' => $snap->period, 'data' => $snap->data]);
    }

    public function destroy(string $period)
    {
        DashboardSnapshot::where('period', $period)->delete();

        return response()->json(['message' => 'Data periode dihapus']);
    }
}

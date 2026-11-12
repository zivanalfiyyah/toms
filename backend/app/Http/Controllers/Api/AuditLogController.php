<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $q = AuditLog::query()->orderByDesc('id');

        if ($s = trim((string) $request->query('q'))) {
            $q->where(fn ($w) => $w->where('description', 'like', "%$s%")
                ->orWhere('user_name', 'like', "%$s%")
                ->orWhere('user_email', 'like', "%$s%")
                ->orWhere('subject_label', 'like', "%$s%"));
        }
        if ($g = $request->query('group')) {
            $q->where('action', 'like', $g.'.%');
        }
        if ($a = $request->query('action')) {
            $q->where('action', $a);
        }
        if ($u = $request->query('user_id')) {
            $q->where('user_id', $u);
        }
        if ($f = $request->query('from')) {
            $q->where('created_at', '>=', $f.' 00:00:00');
        }
        if ($t = $request->query('to')) {
            $q->where('created_at', '<=', $t.' 23:59:59');
        }

        return response()->json($q->paginate(min((int) $request->query('per_page', 25), 100)));
    }
}

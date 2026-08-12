<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AccessRequest;
use Illuminate\Http\Request;

class AccessRequestController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|max:255',
            'division' => 'nullable|string|max:255',
            'reason'   => 'nullable|string|max:1000',
        ]);

        $accessRequest = AccessRequest::create($request->only('name', 'email', 'division', 'reason'));

        return response()->json([
            'message' => 'Permintaan akses terkirim. Admin akan meninjau permintaan kamu.',
            'data'    => $accessRequest,
        ], 201);
    }

    public function index(Request $request)
    {
        $query = AccessRequest::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function reject(Request $request, AccessRequest $accessRequest)
    {
        if ($accessRequest->status !== 'pending') {
            return response()->json(['message' => 'Permintaan ini sudah diproses.'], 409);
        }

        $accessRequest->update([
            'status'      => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json($accessRequest);
    }
}
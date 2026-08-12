<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\InvitationMail;
use App\Models\AccessRequest;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    public function storeFromRequest(Request $request, AccessRequest $accessRequest)
    {
        $request->validate([
            'role' => 'required|string|in:admin,editor,viewer',
        ]);

        if ($accessRequest->status !== 'pending') {
            return response()->json(['message' => 'Permintaan ini sudah diproses.'], 409);
        }

        $invitation = Invitation::create([
            'name'              => $accessRequest->name,
            'email'             => $accessRequest->email,
            'token'             => Str::random(48),
            'role'              => $request->role,
            'access_request_id' => $accessRequest->id,
            'invited_by'        => $request->user()->id,
            'expires_at'        => now()->addDays(3),
        ]);

        $accessRequest->update([
            'status'      => 'invited',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        Mail::to($invitation->email)->queue(new InvitationMail($invitation));

        return response()->json($invitation, 201);
    }

    public function show(string $token)
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if ($invitation->isAccepted()) {
            return response()->json(['message' => 'Undangan sudah digunakan.'], 410);
        }
        if ($invitation->isExpired()) {
            return response()->json(['message' => 'Undangan sudah kedaluwarsa.'], 410);
        }

        return response()->json([
            'name'  => $invitation->name,
            'email' => $invitation->email,
            'role'  => $invitation->role,
        ]);
    }

    public function accept(Request $request, string $token)
    {
        $invitation = Invitation::where('token', $token)->firstOrFail();

        if ($invitation->isAccepted() || $invitation->isExpired()) {
            return response()->json(['message' => 'Undangan tidak valid.'], 410);
        }

        $request->validate([
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name'     => $invitation->name,
            'email'    => $invitation->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($invitation->role);
        $user->load('roles');

        $invitation->update(['accepted_at' => now()]);

        $authToken = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $authToken,
        ], 201);
    }
}
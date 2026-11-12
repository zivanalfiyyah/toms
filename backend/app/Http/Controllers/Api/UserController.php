<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::with('roles')
            ->orderByRaw("case status when 'pending' then 0 else 1 end")
            ->orderBy('id')
            ->get();

        return UserResource::collection($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,editor,viewer',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        $user->assignRole($validated['role']);

        return new UserResource($user->load('roles'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return new UserResource($user->load('roles'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,editor,viewer',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $user->syncRoles([$validated['role']]);

        return new UserResource($user->load('roles'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'Kamu tidak bisa menghapus akun sendiri',
            ], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);

    }

    /** Setujui pendaftaran: cukup dicentang admin, tanpa verifikasi email. */
    public function approve(Request $request, User $user)
    {
        $data = $request->validate(['role' => ['nullable', 'in:admin,editor,viewer']]);

        if (! empty($data['role'])) {
            $user->syncRoles([$data['role']]);
        }

        $user->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()->id,
        ]);

        Audit::log('user.approved', 'Menyetujui akun '.$user->name.(! empty($data['role']) ? ' sebagai '.$data['role'] : ''), $user);

        return new UserResource($user->load('roles'));
    }

    public function reject(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            return response()->json(['message' => 'Kamu tidak bisa menolak akun sendiri'], 422);
        }

        $user->update(['status' => 'rejected', 'approved_at' => null, 'approved_by' => null]);
        Audit::log('user.rejected', 'Menolak akun '.$user->name, $user);

        return new UserResource($user->load('roles'));
    }
}

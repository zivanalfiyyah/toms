<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Audit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Pendaftaran mandiri. Akun berstatus "pending" sampai admin menyetujuinya
     * (tanpa verifikasi email). Tidak ada token yang diberikan di sini.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'company_code' => 'required|string|max:64',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'company_code.required' => 'Kode perusahaan wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak sama.',
        ]);

        $expected = (string) config('portal.company_code');
        if ($expected === '' || ! hash_equals(mb_strtolower($expected), mb_strtolower(trim($validated['company_code'])))) {
            throw \Illuminate\Validation\ValidationException::withMessages([
                'company_code' => 'Kode perusahaan tidak valid.',
            ]);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'status' => 'pending',
        ]);

        $user->assignRole('viewer');

        return response()->json([
            'message' => 'Pendaftaran berhasil. Akun Anda akan aktif setelah disetujui admin.',
            'user' => ['name' => $user->name, 'email' => $user->email, 'status' => $user->status],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            Audit::log('auth.login_failed', 'Gagal login dengan email '.$request->email, null, [], $user, $request->email);
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if ($user->status === 'pending') {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda belum disetujui admin. Silakan tunggu persetujuan.'],
            ]);
        }

        if ($user->status === 'rejected') {
            throw ValidationException::withMessages([
                'email' => ['Pendaftaran akun Anda ditolak. Hubungi admin TOMS.'],
            ]);
        }

        Audit::log('auth.login', 'Login ke portal', null, [], $user, $user->name);
        $user->load('roles');
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        Audit::log('auth.logout', 'Logout dari portal', null, [], $request->user(), $request->user()->name);
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('roles'));
    }

    /** Ubah nama tampilan. Email dipakai untuk login sehingga tidak diubah di sini. */
    public function updateProfile(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $request->user()->update($validated);

        return response()->json($request->user()->fresh()->load('roles'));
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password saat ini salah.'],
            ]);
        }

        $request->user()->update(['password' => $validated['password']]); // di-hash oleh cast

        return response()->json(['message' => 'Password berhasil diubah.']);
    }
}

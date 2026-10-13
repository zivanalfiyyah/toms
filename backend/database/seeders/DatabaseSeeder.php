<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
        ]);

        $adminEmail = env('DEFAULT_ADMIN_EMAIL', 'admin@example.com');
        $adminPassword = env('DEFAULT_ADMIN_PASSWORD', 'password');

        $admin = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Super Admin',
                'password' => Hash::make($adminPassword),
            ]
        );
        $admin->assignRole('admin');

        $this->call([
            TomsStructureSeeder::class,
        ]);
    }
}


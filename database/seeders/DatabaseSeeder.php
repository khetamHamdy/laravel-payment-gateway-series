<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Constant;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // Create Admin User
        Admin::create([
            'name'=> 'Administrator',
            'username'=> 'admin',
            'email'=> 'admin@admin.com',
            'password'=> Hash::make('12345678'),
            'last_activity'  => now(),
            'avatar'  => null,
            'super_admin'  => 1,
            'is_active' => 1,
        ]);


        if (app()->environment('local')) {
            $this->call(UserSeeder::class);
            $this->call(ContentSeeder::class);
        }
    }
}

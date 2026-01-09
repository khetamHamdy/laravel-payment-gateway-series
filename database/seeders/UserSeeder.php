<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        
        $user = User::create([
            'first_name' => 'User',
            'last_name' => null,
            'email' => 'user@gmail.com',
            'phone' => null,
            'password' => Hash::make('12345678'),
            'date_of_birth' => null,
            'gender' => 'male',
            'country_code' => null,
            'avatar' => null,
            'last_activity' => now()
        ]);


        // Guest Profile
        $user->profiles()->create([
            'name' => 'Guest',
            'avatar_url' => null,
            'is_default' => true,
            'is_child_profile' => false,
            'pin_code' => null,
            'language' => 'ar',
            'is_active' => true
        ]);

        // Child Profile
        $user->profiles()->create([
            'name' => 'Child',
            'avatar_url' => null,
            'is_default' => false,
            'is_child_profile' => true,
            'pin_code' => null,
            'language' => 'ar',
            'is_active' => true
        ]);
    }
}

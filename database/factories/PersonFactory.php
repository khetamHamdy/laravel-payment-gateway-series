<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Person>
 */
class PersonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name_ar'     => 'الممثل ' . $this->faker->firstName(),
            'name_en'     => $this->faker->name(),
            'bio_ar'      => 'نبذة: ' . $this->faker->sentence(10),
            'bio_en'      => $this->faker->paragraph(),
            'photo_url'   => 'https://placehold.co/400x400?text=movie+molestiae',
            'birth_date'  => $this->faker->date(),
            'birth_place'  => $this->faker->word(),
            'nationality' => $this->faker->countryCode(),
            'gender'      => $this->faker->randomElement(['male','female']),
            'known_for'   => $this->faker->randomElement(['acting','directing','writing']),
            'tmdb_id'     => $this->faker->numberBetween(1000, 999999),
            'is_active'   => $this->faker->boolean(95),
        ];
    }
}

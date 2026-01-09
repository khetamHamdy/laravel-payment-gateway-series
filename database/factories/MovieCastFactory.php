<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Movie;
use App\Models\Person;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MovieCast>
 */
class MovieCastFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'movie_id'       => Movie::factory(),
            'person_id'      => Person::factory(),
            'role_type'      => $this->faker->randomElement(['actor', 'director', 'writer']),
            'character_name' => 'شخصية ' . $this->faker->firstName(),
            'sort_order'     => $this->faker->numberBetween(1, 20),
        ];
    }
}

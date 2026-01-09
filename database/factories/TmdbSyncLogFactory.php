<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Movie;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TmdbSyncLog>
 */
class TmdbSyncLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_type' => Movie::class,
            'content_id'   => Movie::factory(),
            'tmdb_id'      => $this->faker->numberBetween(1000, 999999),
            'action'       => $this->faker->randomElement(['fetch', 'update', 'sync']),
            'status'       => $this->faker->randomElement(['success', 'failed']),
            'synced_data'  => [
                'title'  => $this->faker->sentence(3),
                'rating' => $this->faker->randomFloat(1, 5, 9),
            ],
            'error_message' => null,
            'synced_at'    => now(),
        ];
    }
}

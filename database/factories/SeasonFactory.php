<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Series;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Season>
 */
class SeasonFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title_ar'       => 'الموسم ' . $this->faker->word(),
            'title_en'       => 'Season ' . $this->faker->word(),
            'description_ar' => 'وصف الموسم ' . $this->faker->sentence(8),
            'description_en' => $this->faker->paragraph(),
            'poster_url'     => 'https://placehold.co/600x900?text=movie+molestiae',
            'air_date'       => $this->faker->date(),
            'episode_count'  => $this->faker->numberBetween(3, 16),
            'status'         => $this->faker->randomElement(['draft', 'published']),
            'tmdb_id'        => $this->faker->numberBetween(1000, 999999),
        ];
    }
}

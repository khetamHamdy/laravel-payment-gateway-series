<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Series;
use App\Models\Season;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Episode>
 */
class EpisodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */    
    public function definition(): array
    {
        $titleEn = $this->faker->sentence(2);
        $titleAr = 'حلقة ' . $this->faker->word();

        return [
            'title_ar'         => $titleAr,
            'title_en'         => $titleEn,
            'description_ar'   => 'وصف للحلقة ' . $this->faker->sentence(8),
            'description_en'   => $this->faker->paragraph(),
            'thumbnail_url'    => 'https://placehold.co/600x400?text=movie+molestiae',
            'duration_minutes' => $this->faker->numberBetween(20, 60),
            'air_date'         => $this->faker->date(),
            'imdb_rating'      => $this->faker->randomFloat(1, 5, 9),
            'status'           => $this->faker->randomElement(['draft', 'published']),
            'view_count'       => $this->faker->numberBetween(0, 50000),
            'tmdb_id'          => $this->faker->numberBetween(1000, 999999),
            'intro_skip_time'  => $this->faker->numberBetween(0, 30),
        ];
    }
}

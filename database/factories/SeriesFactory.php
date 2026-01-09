<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Series>
 */
class SeriesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titleEn = $this->faker->unique()->sentence(2);
        $titleAr = 'مسلسل ' . $this->faker->unique()->word();

        return [
            'title_ar'        => $titleAr,
            'title_en'        => $titleEn,
            'slug'            => Str::slug($titleEn) ?: trim(preg_replace('/\s+/u', '-', $titleAr), '-'),
            'description_ar'  => 'وصف للمسلسل ' . $this->faker->sentence(8),
            'description_en'  => $this->faker->paragraph(),
            'poster_url'      => 'https://placehold.co/600x900?text=movie+molestiae',
            'backdrop_url'    => 'https://placehold.co/1280x720?text=movie+molestiae',
            'first_air_date'    => $this->faker->date(),
            'last_air_date'    => $this->faker->date(),
            'status'          => $this->faker->randomElement(['draft', 'published', 'archived']),
            'seasons_count'   => $this->faker->numberBetween(1, 6),
            'episodes_count'  => $this->faker->numberBetween(6, 60),
            'series_status'   => $this->faker->randomElement(['returning', 'ended', 'canceled']),
            'is_featured'     => $this->faker->boolean(10),
            'view_count'      => $this->faker->numberBetween(0, 80000),
            'tmdb_id'         => $this->faker->numberBetween(1000, 999999),
            'created_by'      => 1,
        ];
    }
}

<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Category;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Movie>
 */
class MovieFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $titleEn = $this->faker->unique()->sentence(3);
        $titleAr = 'فيلم ' . $this->faker->unique()->word();

        return [
            'title_ar'        => $titleAr,
            'title_en'        => $titleEn,
            'slug'            => Str::slug($titleEn) ?: trim(preg_replace('/\s+/u', '-', $titleAr), '-'),
            'description_ar'  => 'وصف: ' . $this->faker->sentence(10),
            'description_en'  => $this->faker->paragraph(),
            'poster_url'      => 'https://placehold.co/600x900?text=movie+molestiae',
            'backdrop_url'    => 'https://placehold.co/1280x720?text=movie+molestiae',
            'logo_url'        => 'https://placehold.co/320x110?text=movie+molestiae',
            'trailer_url'     => 'https://youtube.com/watch?v=' . Str::random(11),
            'release_date'    => $this->faker->date(),
            'duration_minutes'=> $this->faker->numberBetween(80, 180),
            'imdb_rating'     => $this->faker->randomFloat(1, 5, 9),
            'content_rating'  => $this->faker->randomElement(['G','PG','PG-13','R']),
            'language'        => $this->faker->randomElement(['ar','en']),
            'country'         => $this->faker->countryCode(),
            'status'          => $this->faker->randomElement(['draft','published']),
            'is_featured'     => $this->faker->boolean(15),
            'view_count'      => $this->faker->numberBetween(0, 50000),
            'tmdb_id'         => $this->faker->numberBetween(1000, 999999),
            'created_by'      => 1,
            'intro_skip_time' => $this->faker->numberBetween(0, 30),
        ];
    }
}

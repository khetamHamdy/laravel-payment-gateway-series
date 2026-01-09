<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Movie;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subtitle>
 */
class SubtitleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_type' => Movie::class,         // يمكنك عمل states للحلقة/الشورت
            'content_id'   => Movie::factory(),
            'language'     => $this->faker->randomElement(['ar', 'en', 'fr']),
            'label'        => $this->faker->randomElement(['Arabic', 'English', 'French']),
            'file_url'     => asset('storage/subtitles/demo_en.vtt'),
            'format'       => $this->faker->randomElement(['vtt', 'srt']),
            'is_default'   => $this->faker->boolean(30),
            'is_forced'    => $this->faker->boolean(10),
            'is_active'    => $this->faker->boolean(95),
        ];
    }
}

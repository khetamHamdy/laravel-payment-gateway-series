<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Movie;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VideoFiles>
 */
class VideoFilesFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content_type'    => Movie::class,  // يمكن لاحقًا تعمل states للحلقة/الشورت
            'content_id'      => Movie::factory(),
            'video_type'      => $this->faker->randomElement(['main','trailer']),
            'quality'         => $this->faker->randomElement(['720p','1080p','4K']),
            'format'          => $this->faker->randomElement(['mp4', 'hls', 'm3u8', 'webm']),
            // 'file_url'        => $this->faker->url(),
            'file_url' => 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
            'file_size'       => $this->faker->numberBetween(50_000_000, 2_000_000_000),
            'duration_seconds'=> $this->faker->numberBetween(60, 9000),
            'is_downloadable' => $this->faker->boolean(60),
            'is_active'       => $this->faker->boolean(95),
        ];
    }
}

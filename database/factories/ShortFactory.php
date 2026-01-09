<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Short>
 */
class ShortFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = $this->faker->unique()->sentence(3);

        return [
            'title'          => $title,
            'description'    => $this->faker->sentence(12),
            'video_path'     => $this->faker->url(),
            'poster_path'    => 'https://placehold.co/720x1280?text=movie+molestiae',
            'aspect_ratio'   => $this->faker->randomElement(['vertical', 'horizontal']),
            'likes_count'    => $this->faker->numberBetween(0, 5000),
            'comments_count' => $this->faker->numberBetween(0, 500),
            'shares_count'   => $this->faker->numberBetween(0, 200),
            'share_url'      => $this->faker->url(),
            'is_featured'    => $this->faker->boolean(10),
            'status'         => $this->faker->randomElement(['active', 'inactive']),
            'created_by'     => 1,
        ];
    }
}

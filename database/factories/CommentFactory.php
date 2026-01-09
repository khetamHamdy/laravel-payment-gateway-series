<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Movie;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'commentable_type' => Movie::class,
            'commentable_id'   => Movie::factory(),
            'user_id'          => 1,        // عدّلها لـ User::factory() إن كان موديل المستخدم مفعّل
            'profile_id'       => null,
            'parent_id'        => null,
            'content'          => $this->faker->boolean(50)
                ? 'تعليق عربي ' . $this->faker->sentence(8)
                : $this->faker->sentence(12),
            'likes_count'      => $this->faker->numberBetween(0, 200),
            'replies_count'    => $this->faker->numberBetween(0, 50),
            'is_edited'        => $this->faker->boolean(10),
            'status'           => $this->faker->randomElement(['approved', 'pending', 'rejected']),
            'edited_at'        => null,
        ];
    }
}

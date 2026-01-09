<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
        protected $model = Category::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nameEn = $this->faker->unique()->words(2, true);
        $nameAr = 'تصنيف ' . $this->faker->unique()->word();

        $slugBase = $nameEn ?: $nameAr;
        $slug = Str::slug($slugBase, '-');
        if ($slug === '' && !empty($slugBase)) {
            $slug = trim(preg_replace('/\s+/u', '-', $slugBase), '-');
        }

        return [
            'name_ar'        => $nameAr,
            'name_en'        => ucfirst($nameEn),
            'slug'           => $slug,
            'description_ar' => 'وصف للتصنيف ' . $this->faker->sentence(6),
            'description_en' => $this->faker->sentence(10),
            'image_url'      => 'https://placehold.co/600x400?text=movie',
            'color'          => $this->faker->hexColor(),
            'sort_order'     => $this->faker->numberBetween(1, 20),
            'is_active'      => $this->faker->boolean(90),
        ];
    }
}
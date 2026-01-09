<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{
    Category,
    Movie,
    Series,
    Season,
    Episode,
    Person,
    MovieCast,
    SeriesCast,
    VideoFiles,
    Subtitle,
    Short,
    Comment,
    TmdbSyncLog,
    User
};
use Illuminate\Support\Arr;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        // 🗂️ إنشاء تصنيفات
        $categories = Category::factory(5)->create();

        // 🎬 إنشاء أفلام وربطها بالتصنيفات
        $movies = Movie::factory(15)->create()->each(function ($movie) use ($categories) {
            if (method_exists($movie, 'categories')) {
                $movie->categories()->attach($categories->random(rand(1, 3))->pluck('id'));
            }
        });

        // 📺 إنشاء مسلسلات مع المواسم والحلقات
        $series = Series::factory(5)->create()->each(function ($series) {
            $seasonsCount = rand(1, 3);
            for ($s = 1; $s <= $seasonsCount; $s++) {
                $season = \App\Models\Season::factory()->create([
                    'series_id'     => $series->id,
                    'season_number' => $s, // رقم الموسم الفريد لكل سلسلة
                    'title_ar'      => "الموسم {$s}",
                    'title_en'      => "Season {$s}",
                ]);

                // 🎬 إنشاء الحلقات لكل موسم (زي ما عدّلنا سابقًا)
                $episodesCount = rand(3, 8);
                for ($i = 1; $i <= $episodesCount; $i++) {
                    \App\Models\Episode::factory()->create([
                        'season_id'      => $season->id,
                        'episode_number' => $i,
                    ]);
                }
            }
        });

        // 👤 إنشاء أشخاص (ممثلين ومخرجين)
        $people = Person::factory(20)->create();

        // 🎭 ربط الممثلين بالأفلام بدون تكرار
        foreach ($movies as $movie) {
            // عدد الأشخاص المشاركين في الفيلم
            $castCount = rand(3, 6);

            // اختار أشخاص عشوائيين بدون تكرار
            $selectedPeople = $people->random($castCount);

            // أدوار محتملة
            $roles = ['actor', 'director', 'writer'];

            foreach ($selectedPeople as $person) {
                // اختار نوع دور عشوائي
                $role = Arr::random($roles);

                // تأكد ما تكرر نفس الدور للشخص في نفس الفيلم
                $exists = \App\Models\MovieCast::where([
                    ['movie_id', $movie->id],
                    ['person_id', $person->id],
                    ['role_type', $role],
                ])->exists();

                if (!$exists) {
                    \App\Models\MovieCast::factory()->create([
                        'movie_id'  => $movie->id,
                        'person_id' => $person->id,
                        'role_type' => $role,
                    ]);
                }
            }
        }
        // 🎭 ربط الممثلين بالمسلسلات بدون تكرار وبدون فقدان روابط
        foreach ($series as $serie) {
            // تأكد أن السلسلة محفوظة فعليًا قبل توليد الكاست
            if (!$serie->exists) continue;

            $castCount = rand(3, 6);
            $selectedPeople = $people->random($castCount);
            $roles = ['actor', 'director', 'writer'];

            foreach ($selectedPeople as $person) {
                $role = Arr::random($roles);

                $exists = \App\Models\SeriesCast::where([
                    ['series_id', $serie->id],
                    ['person_id', $person->id],
                    ['role_type', $role],
                ])->exists();

                if (!$exists) {
                    \App\Models\SeriesCast::create([
                        'series_id'      => $serie->id,
                        'person_id'      => $person->id,
                        'role_type'      => $role,
                        'character_name' => 'شخصية ' . $person->name_ar,
                        'sort_order'     => rand(1, 20),
                    ]);
                }
            }
        }

        // 🎞️ إنشاء ملفات الفيديو والترجمات للأفلام
        foreach ($movies as $movie) {
            VideoFiles::factory(rand(1, 2))->create([
                'content_type' => Movie::class,
                'content_id' => $movie->id,
            ]);

            Subtitle::factory(rand(1, 2))->create([
                'content_type' => Movie::class,
                'content_id' => $movie->id,
            ]);
        }

        // 🎬 إنشاء فيديوهات قصيرة (Shorts)
        $shorts = Short::factory(10)->create();

        // 💬 إنشاء مستخدمين للتعليقات
        $users = User::factory(10)->create();

        // 💬 تعليقات على الأفلام
        Comment::factory(50)->create([
            'commentable_type' => 'movie',
            'commentable_id' => $movies->random()->id,
            'user_id' => $users->random()->id,
        ]);

        // 💭 تعليقات على المسلسلات
        Comment::factory(30)->create([
            'commentable_type' => 'series',
            'commentable_id' => $series->random()->id,
            'user_id' => $users->random()->id,
        ]);

        // 🧾 سجلات TMDB
        TmdbSyncLog::factory(10)->create([
            'content_type' => 'movie',
            'content_id' => $movies->random()->id,
        ]);

        $this->command->info('✅ تم توليد بيانات تجريبية كاملة لمرحلة المحتوى والتعليقات.');
    }
}

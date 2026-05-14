<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            // Hapus kolom time (string "40 menit") — diganti integer terpisah
            $table->dropColumn('time');

            // Deskripsi singkat resep
            $table->text('description')->nullable()->after('title');

            // Nutrisi lengkap per sajian
            $table->decimal('carbs', 6, 2)->default(0)->after('protein');
            $table->decimal('fat', 6, 2)->default(0)->after('carbs');
            $table->decimal('fiber', 6, 2)->nullable()->after('fat');

            // Waktu memasak dalam menit (lebih terstruktur dari string)
            $table->unsignedSmallInteger('preparation_time')->nullable()->after('fiber');
            $table->unsignedSmallInteger('cooking_time')->nullable()->after('preparation_time');

            // Jumlah sajian dan tingkat kesulitan
            $table->unsignedTinyInteger('servings')->default(1)->after('cooking_time');
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('easy')->after('servings');

            // Asal resep: dibuat AI (FitChef), input manual, atau impor
            $table->enum('source', ['ai_generated', 'manual', 'imported'])->default('ai_generated')->after('difficulty');
        });
    }

    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->dropColumn([
                'description', 'carbs', 'fat', 'fiber',
                'preparation_time', 'cooking_time',
                'servings', 'difficulty', 'source',
            ]);
            $table->string('time');
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('family_members', function (Blueprint $table) {
            // Hapus avatar lama
            $table->dropColumn('avatar');

            // Hapus weight & height (data aktual ada di growth_logs)
            $table->dropColumn(['weight', 'height']);

            // daily_calorie_goal: jadikan nullable (NULL = hitung otomatis dari BMR)
            $table->integer('daily_calorie_goal')->nullable()->default(null)->change();

            // Kolom foto profil
            $table->string('avatar_url', 2048)->nullable()->after('daily_calorie_goal');
            $table->enum('avatar_source', ['local', 'url', 'gravatar'])->nullable()->after('avatar_url');
            $table->string('avatar_provider', 100)->nullable()->after('avatar_source');

            // Soft delete
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('family_members', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['avatar_url', 'avatar_source', 'avatar_provider']);

            $table->string('avatar')->nullable();
            $table->decimal('weight', 5, 2)->nullable();
            $table->decimal('height', 5, 2)->nullable();
            $table->integer('daily_calorie_goal')->default(2000)->change();
        });
    }
};

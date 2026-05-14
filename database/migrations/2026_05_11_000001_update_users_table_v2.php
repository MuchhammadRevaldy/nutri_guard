<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Hapus kolom avatar lama (diganti avatar_url/source/provider)
            $table->dropColumn('avatar');

            // Hapus scan tracking lama (dipindah ke tabel scan_quotas)
            $table->dropColumn(['scan_count_today', 'scan_date']);

            // Kolom foto profil
            $table->string('avatar_url', 2048)->nullable()->after('password');
            $table->enum('avatar_source', ['local', 'url', 'gravatar'])->nullable()->default('gravatar')->after('avatar_url');
            $table->string('avatar_provider', 100)->nullable()->after('avatar_source');

            // Soft delete
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['avatar_url', 'avatar_source', 'avatar_provider']);

            $table->string('avatar')->nullable()->after('email');
            $table->unsignedTinyInteger('scan_count_today')->default(0);
            $table->date('scan_date')->nullable();
        });
    }
};

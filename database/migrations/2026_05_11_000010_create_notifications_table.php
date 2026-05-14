<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->enum('type', [
                'health_warning', // Peringatan kalori berlebih/kurang
                'invitation',     // Undangan bergabung keluarga
                'message',        // Pesan baru dari anggota keluarga
                'system',         // Info atau pengumuman dari sistem
            ]);

            $table->string('title');
            $table->text('body');

            // Data konteks tambahan, misal: {"member_id":5,"calories":2500,"limit":2000}
            $table->json('data')->nullable();

            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();

            $table->timestamp('created_at')->useCurrent();

            // Index untuk query notif belum dibaca (paling sering dipakai)
            $table->index(['user_id', 'is_read'], 'idx_notif_unread');
            $table->index('type', 'idx_notif_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

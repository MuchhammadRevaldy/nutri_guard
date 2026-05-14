<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            // Tipe pesan: teks, gambar, atau file
            $table->enum('message_type', ['text', 'image', 'file'])->default('text')->after('message');

            // URL lampiran untuk tipe image atau file
            $table->string('attachment_url', 2048)->nullable()->after('message_type');

            // Waktu pesan pertama dibaca
            $table->timestamp('read_at')->nullable()->after('is_read');

            // Soft delete — pesan dihapus tapi masih tersimpan di DB
            $table->softDeletes();

            // Index untuk query percakapan dan pesan belum dibaca
            $table->index(['recipient_id', 'is_read'], 'idx_msg_unread');
            $table->index(['sender_id', 'recipient_id', 'created_at'], 'idx_msg_conversation');
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('idx_msg_unread');
            $table->dropIndex('idx_msg_conversation');
            $table->dropSoftDeletes();
            $table->dropColumn(['message_type', 'attachment_url', 'read_at']);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('family_invitations', function (Blueprint $table) {
            // Batas waktu token berlaku — wajib ada agar token tidak aktif selamanya
            $table->timestamp('expires_at')->nullable()->after('token');

            // Waktu penerima merespons (accept/reject)
            $table->timestamp('responded_at')->nullable()->after('expires_at');

            // Index tambahan
            $table->index('recipient_email', 'idx_fi_recipient_email');
            $table->index('status', 'idx_fi_status');
        });
    }

    public function down(): void
    {
        Schema::table('family_invitations', function (Blueprint $table) {
            $table->dropIndex('idx_fi_recipient_email');
            $table->dropIndex('idx_fi_status');
            $table->dropColumn(['expires_at', 'responded_at']);
        });
    }
};

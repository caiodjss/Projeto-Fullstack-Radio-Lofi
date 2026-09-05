<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('radio_station_states', function (Blueprint $table) {
            $table->foreignId('current_track_id')->nullable()->after('station_id')->constrained('tracks')->nullOnDelete();
            $table->json('queue')->nullable()->after('current_track_id');
            $table->string('status')->default('playing')->after('queue');
            $table->unsignedInteger('playback_position_seconds')->default(0)->after('status');
            $table->timestamp('last_heartbeat_at')->nullable()->after('playback_position_seconds');
        });
    }

    public function down(): void
    {
        Schema::table('radio_station_states', function (Blueprint $table) {
            $table->dropConstrainedForeignId('current_track_id');
            $table->dropColumn(['queue', 'status', 'playback_position_seconds', 'last_heartbeat_at']);
        });
    }
};

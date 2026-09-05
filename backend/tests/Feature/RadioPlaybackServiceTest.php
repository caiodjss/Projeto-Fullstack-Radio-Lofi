<?php

namespace Tests\Feature;

use App\Models\RadioStationState;
use App\Models\Station;
use App\Models\Track;
use App\Models\Artist;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RadioPlaybackServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_resolves_now_playing_from_persisted_radio_state(): void
    {
        $artist = Artist::factory()->create();
        $station = Station::create([
            'name' => 'S4D',
            'slug' => 's4d',
            'description' => 'Test station',
            'theme_color' => '#123456',
            'background_url' => 'https://example.com/bg.gif',
            'is_active' => true,
        ]);

        $trackOne = Track::create([
            'station_id' => $station->id,
            'artist_id' => $artist->id,
            'title' => 'Track 1',
            'genre' => 'Sad',
            'audio_url' => 'https://example.com/1.mp3',
            'duration_seconds' => 180,
            'is_active' => true,
        ]);

        $trackTwo = Track::create([
            'station_id' => $station->id,
            'artist_id' => $artist->id,
            'title' => 'Track 2',
            'genre' => 'Sad',
            'audio_url' => 'https://example.com/2.mp3',
            'duration_seconds' => 120,
            'is_active' => true,
        ]);

        $state = RadioStationState::create([
            'station_id' => $station->id,
            'current_track_id' => $trackOne->id,
            'cycle_started_at' => Carbon::now()->subSeconds(30),
            'queue' => [$trackOne->id, $trackTwo->id],
            'status' => 'playing',
            'playback_position_seconds' => 0,
        ]);

        $service = app(\App\Services\Radio\RadioPlaybackService::class);
        $service->tickStation($station);
        $result = $service->resolveForStation($station->slug);

        $this->assertSame($trackOne->id, $result['track']->id);
        $this->assertSame(30, $result['offset_seconds']);
        $this->assertSame($station->slug, $result['station']->slug);
        $this->assertNotNull($result['cycle_started_at']);
    }

    public function test_it_advances_to_next_track_when_current_cycle_expires(): void
    {
        $artist = Artist::factory()->create();
        $station = Station::create([
            'name' => 'S4D',
            'slug' => 's4d-next',
            'description' => 'Test station',
            'theme_color' => '#123456',
            'background_url' => 'https://example.com/bg.gif',
            'is_active' => true,
        ]);

        $trackOne = Track::create([
            'station_id' => $station->id,
            'artist_id' => $artist->id,
            'title' => 'Track 1',
            'genre' => 'Sad',
            'audio_url' => 'https://example.com/1.mp3',
            'duration_seconds' => 30,
            'is_active' => true,
        ]);

        $trackTwo = Track::create([
            'station_id' => $station->id,
            'artist_id' => $artist->id,
            'title' => 'Track 2',
            'genre' => 'Sad',
            'audio_url' => 'https://example.com/2.mp3',
            'duration_seconds' => 60,
            'is_active' => true,
        ]);

        RadioStationState::create([
            'station_id' => $station->id,
            'current_track_id' => $trackOne->id,
            'cycle_started_at' => Carbon::now()->subSeconds(45),
            'queue' => [$trackOne->id, $trackTwo->id],
            'status' => 'playing',
            'playback_position_seconds' => 0,
        ]);

        $service = app(\App\Services\Radio\RadioPlaybackService::class);
        $service->tickStation($station);
        $result = $service->resolveForStation($station->slug);

        $this->assertSame($trackTwo->id, $result['track']->id);
        $this->assertLessThanOrEqual(30, $result['offset_seconds']);
    }
}


<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Models\PlayHistory;
use App\Models\RadioStationState;
use App\Models\Station;
use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class RadioPlaybackTest extends TestCase
{
    use RefreshDatabase;

    public function test_now_playing_returns_deterministic_track_and_offset(): void
    {
        $station = Station::create(['name' => 'Test Radio', 'slug' => 'test-radio', 'theme_color' => '#38bdf8', 'is_active' => true]);
        $artist = Artist::create(['name' => 'Test Artist']);
        $first = Track::create(['station_id' => $station->id, 'artist_id' => $artist->id, 'title' => 'First', 'genre' => 'Sad', 'audio_url' => 'https://example.com/first.mp3', 'duration_seconds' => 60, 'is_active' => true]);
        $second = Track::create(['station_id' => $station->id, 'artist_id' => $artist->id, 'title' => 'Second', 'genre' => 'Sad', 'audio_url' => 'https://example.com/second.mp3', 'duration_seconds' => 120, 'is_active' => true]);
        RadioStationState::create(['station_id' => $station->id, 'cycle_started_at' => Carbon::now()->subSeconds(75)]);

        $response = $this->getJson('/api/stations/test-radio/now-playing');

        $response->assertOk()
            ->assertJsonPath('data.track.id', $second->id)
            ->assertJsonPath('data.offset_seconds', 15);
        $this->assertNotSame($first->id, $response->json('data.track.id'));
    }

    public function test_authenticated_user_can_record_and_fetch_history(): void
    {
        $user = User::factory()->create();
        $station = Station::create(['name' => 'History Radio', 'slug' => 'history-radio', 'theme_color' => '#38bdf8', 'is_active' => true]);
        $artist = Artist::create(['name' => 'History Artist']);
        $track = Track::create(['station_id' => $station->id, 'artist_id' => $artist->id, 'title' => 'History Track', 'genre' => 'Sad', 'audio_url' => 'https://example.com/history.mp3', 'duration_seconds' => 90, 'is_active' => true]);
        $token = $user->createToken('history-test')->plainTextToken;

        $this->withToken($token)->postJson('/api/history', ['track_id' => $track->id])->assertCreated();
        $this->withToken($token)->getJson('/api/history')->assertOk()->assertJsonPath('data.0.track.id', $track->id);
        $this->assertDatabaseHas('play_histories', ['user_id' => $user->id, 'track_id' => $track->id]);
    }

    public function test_history_requires_authentication(): void
    {
        $this->getJson('/api/history')->assertUnauthorized();
    }
}

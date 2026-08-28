<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Models\Station;
use App\Models\Track;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthAndFavoritesTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_fetch_profile_and_manage_favorites(): void
    {
        $user = User::factory()->create([
            'name' => 'Maria Doe',
            'email' => 'maria@example.com',
        ]);

        $station = Station::create([
            'name' => 'Night Drive',
            'slug' => 'night-drive',
            'description' => 'Late night beats',
            'theme_color' => '#8b5cf6',
            'background_url' => 'https://example.com/bg.jpg',
            'is_active' => true,
        ]);

        $artist = Artist::create([
            'name' => 'Moon Echo',
            'avatar_url' => 'https://example.com/avatar.jpg',
            'social_link' => 'https://example.com/moon-echo',
        ]);

        $track = Track::create([
            'station_id' => $station->id,
            'artist_id' => $artist->id,
            'title' => 'Afterglow',
            'genre' => 'Chill',
            'audio_url' => 'https://example.com/audio.mp3',
            'duration_seconds' => 213,
            'is_active' => true,
        ]);

        $token = $user->createToken('test-token')->plainTextToken;

        $meResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/me');

        $meResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'maria@example.com');

        $toggleResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/favorites/toggle/' . $track->id);

        $toggleResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.track_id', $track->id)
            ->assertJsonPath('data.is_favorited', true);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $user->id,
            'track_id' => $track->id,
        ]);

        $favoritesResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/favorites');

        $favoritesResponse->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment(['title' => 'Afterglow']);
    }
}

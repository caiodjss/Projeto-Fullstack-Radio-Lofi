<?php

namespace Tests\Feature;

use App\Models\Track;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SyncR2TracksCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_continues_when_an_mp3_file_is_invalid(): void
    {
        Storage::fake('r2');

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('r2');
        $disk->put('audios/broken.mp3', '');

        $this->artisan('radio:sync-r2')->assertSuccessful();

        $this->assertSame(0, Track::count());
    }
}

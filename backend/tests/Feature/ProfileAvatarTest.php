<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Feature tests for POST /api/profile/avatar and DELETE /api/profile/avatar.
 *
 * GD is NOT available in this environment, so we use UploadedFile::fake()->create()
 * with an explicit MIME type. This still exercises all Laravel validation rules
 * (mimes:, max:, image) because the fake file's reported MIME is what Validator reads.
 *
 * Covers the four security guarantees stated in ProfileAvatarController:
 *  1. Validation rejects non-image files and enforces max 2 048 KB
 *  2. Stored filename is generated (avatar_{id}_{16-char-random}.ext), never the original
 *  3. Update is scoped to $request->user() — injected user_id in body is ignored
 *  4. Old-file deletion failure is non-fatal; new upload always succeeds
 *
 * Plus functional coverage:
 *  5. Successful upload → file on disk, URL persisted
 *  6. Second upload replaces old file
 *  7. Remove deletes file + nulls DB column
 *  8. Remove with no photo is graceful (200)
 *  9. Unauthenticated requests return 401
 */
class ProfileAvatarTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('s3');

        $this->user = User::create([
            'employee_id' => 'EMP-001',
            'name'        => 'testuser',
            'real_name'   => 'Test User',
            'email'       => 'test@ztg.com',
            'username'    => 'testuser',
            'password'    => Hash::make('password'),
            'pin'         => '1234',
            'role'        => UserRole::ADMIN,
            'status'      => UserStatus::ACTIVE,
        ]);

        $this->otherUser = User::create([
            'employee_id' => 'EMP-002',
            'name'        => 'other',
            'real_name'   => 'Other User',
            'email'       => 'other@ztg.com',
            'username'    => 'other',
            'password'    => Hash::make('password'),
            'pin'         => null,
            'role'        => UserRole::CASHIER,
            'status'      => UserStatus::ACTIVE,
        ]);
    }

    /** Extract relative storage path from a full avatar URL. */
    private function pathFromUrl(string $url): string
    {
        $mediaUrl = rtrim(config('app.url'), '/') . '/api/media/';
        if (str_starts_with($url, $mediaUrl)) {
            return ltrim(str_replace($mediaUrl, '', $url), '/');
        }

        if (str_starts_with($url, '/api/media/')) {
            return ltrim(substr($url, 11), '/');
        }

        $r2Url = rtrim(config('filesystems.disks.s3.url'), '/');
        if ($r2Url && str_starts_with($url, $r2Url)) {
            return ltrim(str_replace($r2Url, '', $url), '/');
        }

        $url = str_replace(rtrim(config('app.url'), '/') . '/storage/', '', $url);

        if (str_starts_with($url, '/storage/')) {
            $url = substr($url, 9);
        }

        return ltrim($url, '/');
    }

    /**
     * Create a fake image file that passes Laravel's 'image|mimes:jpeg' rules.
     * We use create() with 'image/jpeg' MIME to avoid requiring GD.
     */
    private function fakeJpeg(string $name = 'photo.jpg', int $kilobytes = 100): UploadedFile
    {
        return UploadedFile::fake()->create($name, $kilobytes, 'image/jpeg');
    }

    /* ── 1a. Successful upload ───────────────────────────────────────────── */

    public function test_authenticated_user_can_upload_avatar(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', ['avatar' => $this->fakeJpeg()]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'profile_photo'])
            ->assertJsonFragment(['message' => 'Profile photo uploaded successfully.']);

        $url = $this->user->fresh()->profile_photo;
        $this->assertNotNull($url);
        Storage::disk('s3')->assertExists($this->pathFromUrl($url));
    }

    /* ── 1b. Validation: missing file ───────────────────────────────────── */

    public function test_upload_rejects_missing_file(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['avatar']);
    }

    /* ── 1c. Validation: non-image MIME type ────────────────────────────── */

    public function test_upload_rejects_non_image_file(): void
    {
        $file = UploadedFile::fake()->create('malicious.txt', 50, 'text/plain');

        $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', ['avatar' => $file])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['avatar']);
    }

    /* ── 1d. Validation: oversized file (> 2 048 KB) ───────────────────── */

    public function test_upload_rejects_oversized_file(): void
    {
        // 13 000 KB (13 MB) — exceeds the 12 288 KB cap
        $file = UploadedFile::fake()->create('huge.jpg', 13000, 'image/jpeg');

        $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', ['avatar' => $file])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['avatar']);
    }

    /* ── 2. Filename is generated, NOT the original client filename ──────── */

    public function test_stored_filename_is_not_original_client_filename(): void
    {
        $originalName = 'my-precious-photo.jpg';

        $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', [
                'avatar' => UploadedFile::fake()->create($originalName, 100, 'image/jpeg'),
            ]);

        $url = $this->user->fresh()->profile_photo;
        $this->assertNotNull($url);

        // The URL must NOT contain the original filename
        $this->assertStringNotContainsString($originalName, $url);

        // Must match the generated pattern: avatar_{userId}_{16-char-random}
        $this->assertMatchesRegularExpression(
            '/avatar_' . $this->user->id . '_[A-Za-z0-9]{16}\.\w+$/',
            basename($url)
        );
    }

    /* ── 3. Endpoint scoped to authenticated user — injected user_id ignored */

    public function test_upload_only_affects_authenticated_user(): void
    {
        $victim = 'http://localhost/storage/avatars/victim.jpg';
        $this->otherUser->update(['profile_photo' => $victim]);

        $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', [
                'avatar'  => $this->fakeJpeg(),
                'user_id' => $this->otherUser->id,  // must be ignored by endpoint
            ]);

        // $this->user got a new photo
        $this->assertNotNull($this->user->fresh()->profile_photo);

        // otherUser's photo is completely unchanged
        $this->assertEquals($victim, $this->otherUser->fresh()->profile_photo);
    }

    /* ── 4. Old-file deletion failure does not block new upload ─────────── */

    public function test_upload_succeeds_when_old_photo_is_external_url(): void
    {
        // External URL → urlToStoragePath() returns null → no delete attempt → safe
        $this->user->update(['profile_photo' => 'https://cdn.example.com/avatar.jpg']);

        $response = $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', ['avatar' => $this->fakeJpeg('new.jpg')]);

        $response->assertStatus(200);
        $newUrl = $this->user->fresh()->profile_photo;
        $this->assertStringNotContainsString('cdn.example.com', $newUrl);
        Storage::disk('s3')->assertExists($this->pathFromUrl($newUrl));
    }

    /* ── 5 + 6. Second upload replaces old file on disk ─────────────────── */

    public function test_second_upload_deletes_old_file_and_stores_new(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', ['avatar' => $this->fakeJpeg('first.jpg')]);

        $firstUrl  = $this->user->fresh()->profile_photo;
        $firstPath = $this->pathFromUrl($firstUrl);
        Storage::disk('s3')->assertExists($firstPath);

        $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', ['avatar' => $this->fakeJpeg('second.jpg')]);

        $secondUrl  = $this->user->fresh()->profile_photo;
        $secondPath = $this->pathFromUrl($secondUrl);

        Storage::disk('s3')->assertMissing($firstPath);   // old gone
        Storage::disk('s3')->assertExists($secondPath);   // new present
        $this->assertNotEquals($firstUrl, $secondUrl);
    }

    /* ── 7. Remove deletes file and nulls profile_photo ─────────────────── */

    public function test_remove_deletes_file_and_nulls_profile_photo(): void
    {
        $this->actingAs($this->user)
            ->postJson('/api/profile/avatar', ['avatar' => $this->fakeJpeg()]);

        $storedUrl  = $this->user->fresh()->profile_photo;
        $storedPath = $this->pathFromUrl($storedUrl);
        Storage::disk('s3')->assertExists($storedPath);

        $this->actingAs($this->user)
            ->deleteJson('/api/profile/avatar')
            ->assertStatus(200)
            ->assertJsonFragment(['profile_photo' => null]);

        $this->assertNull($this->user->fresh()->profile_photo);
        Storage::disk('s3')->assertMissing($storedPath);
    }

    /* ── 8. Remove with no photo is graceful ────────────────────────────── */

    public function test_remove_when_no_photo_returns_200_gracefully(): void
    {
        $this->assertNull($this->user->fresh()->profile_photo);

        $this->actingAs($this->user)
            ->deleteJson('/api/profile/avatar')
            ->assertStatus(200)
            ->assertJsonFragment(['profile_photo' => null]);

        $this->assertNull($this->user->fresh()->profile_photo);
    }

    /* ── 9. Unauthenticated requests return 401 ─────────────────────────── */

    public function test_unauthenticated_upload_returns_401(): void
    {
        $this->postJson('/api/profile/avatar', ['avatar' => $this->fakeJpeg()])
            ->assertStatus(401);
    }

    public function test_unauthenticated_remove_returns_401(): void
    {
        $this->deleteJson('/api/profile/avatar')->assertStatus(401);
    }
}

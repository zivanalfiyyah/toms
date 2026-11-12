<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Page;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortalTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function user(string $role, array $extra = []): User
    {
        $u = User::factory()->create(array_merge(['password' => 'secret123'], $extra));
        $u->assignRole($role);

        return $u;
    }

    private function page(): Page
    {
        $c = Category::create(['name' => 'Bab', 'slug' => 'bab']);

        return Page::create([
            'category_id' => $c->id, 'title' => 'Halaman', 'slug' => 'halaman',
            'content' => [], 'content_html' => '<p>x</p>', 'content_text' => 'x', 'status' => 'published',
            'created_by' => User::factory()->create()->id,
        ]);
    }

    public function test_register_creates_pending_account_without_token(): void
    {
        $res = $this->postJson('/api/register', [
            'name' => 'Budi', 'email' => 'budi@x.com', 'company_code' => 'TOMS-2026', 'password' => 'secret123', 'password_confirmation' => 'secret123',
        ])->assertCreated();

        $this->assertArrayNotHasKey('token', $res->json());
        $this->assertSame('pending', User::where('email', 'budi@x.com')->first()->status);
    }

    public function test_register_rejects_wrong_company_code(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Budi', 'email' => 'budi@x.com', 'company_code' => 'SALAH', 'password' => 'secret123', 'password_confirmation' => 'secret123',
        ])->assertStatus(422)->assertJsonValidationErrors('company_code');
    }

    public function test_pending_and_rejected_cannot_login_approved_can(): void
    {
        $admin = $this->user('admin');
        $this->postJson('/api/register', [
            'name' => 'Budi', 'email' => 'budi@x.com', 'company_code' => 'TOMS-2026', 'password' => 'secret123', 'password_confirmation' => 'secret123',
        ]);
        $budi = User::where('email', 'budi@x.com')->first();

        $this->postJson('/api/login', ['email' => 'budi@x.com', 'password' => 'secret123'])
            ->assertStatus(422)->assertJsonValidationErrors('email');

        $this->actingAs($admin, 'sanctum')->postJson("/api/users/{$budi->id}/reject")->assertOk();
        $this->postJson('/api/login', ['email' => 'budi@x.com', 'password' => 'secret123'])->assertStatus(422);

        $this->actingAs($admin, 'sanctum')->postJson("/api/users/{$budi->id}/approve")->assertOk();
        $this->postJson('/api/login', ['email' => 'budi@x.com', 'password' => 'secret123'])
            ->assertOk()->assertJsonStructure(['token', 'user']);
    }

    public function test_only_admin_can_approve(): void
    {
        $editor = $this->user('editor');
        $u = $this->user('viewer', ['status' => 'pending']);
        $this->actingAs($editor, 'sanctum')->postJson("/api/users/{$u->id}/approve")->assertForbidden();
    }

    public function test_existing_users_default_to_approved(): void
    {
        $this->assertSame('approved', User::factory()->create()->fresh()->status);
    }

    public function test_likes_flow(): void
    {
        $viewer = $this->user('viewer');
        $page = $this->page();

        $this->postJson("/api/pages/{$page->id}/like")->assertUnauthorized();

        $this->actingAs($viewer, 'sanctum');
        $this->postJson("/api/pages/{$page->id}/like")->assertOk()->assertJson(['liked' => true, 'likes_count' => 1]);
        $this->postJson("/api/pages/{$page->id}/like")->assertJson(['likes_count' => 1]); // idempoten
        $this->getJson("/api/pages/{$page->id}")->assertJsonPath("liked", true)->assertJsonPath("likes_count", 1);
        $this->getJson('/api/me/likes')->assertOk()->assertJsonCount(1)->assertJsonPath('0.title', 'Halaman');
        $this->deleteJson("/api/pages/{$page->id}/like")->assertJson(['liked' => false, 'likes_count' => 0]);
    }

    public function test_profile_and_password(): void
    {
        $u = $this->user('viewer');
        $this->actingAs($u, 'sanctum');

        $this->putJson('/api/me', ['name' => 'Nama Baru'])->assertOk()->assertJsonPath('name', 'Nama Baru');
        $this->putJson('/api/me/password', ['current_password' => 'salah', 'password' => 'baru12345', 'password_confirmation' => 'baru12345'])
            ->assertStatus(422);
        $this->putJson('/api/me/password', ['current_password' => 'secret123', 'password' => 'baru12345', 'password_confirmation' => 'baru12345'])
            ->assertOk();
        $this->assertTrue(\Hash::check('baru12345', $u->fresh()->password));
    }

    public function test_announcements_public_only_published_and_single_lead(): void
    {
        $editor = $this->user('editor');
        $this->actingAs($editor, 'sanctum');
        $this->postJson('/api/announcements', ['tag' => 'Pengumuman Resmi', 'title' => 'A', 'is_lead' => true])->assertCreated();
        $this->postJson('/api/announcements', ['tag' => 'Safety Alert', 'title' => 'B', 'is_lead' => true])->assertCreated();
        $this->postJson('/api/announcements', ['tag' => 'Safety Alert', 'title' => 'Draft', 'is_published' => false])->assertCreated();

        $this->app['auth']->forgetGuards();
        $list = $this->getJson('/api/announcements')->assertOk();
        $list->assertJsonCount(2);
        $this->assertSame(1, collect($list->json())->where('is_lead', true)->count());
    }

    public function test_viewer_cannot_manage_content(): void
    {
        $v = $this->user('viewer');
        $this->actingAs($v, 'sanctum');
        $this->postJson('/api/announcements', ['tag' => 'x', 'title' => 'y'])->assertForbidden();
        $this->putJson('/api/dashboard/2026-06', [])->assertForbidden();
        $this->putJson('/api/settings/contact', [])->assertForbidden();
        $this->getJson('/api/help-tickets')->assertForbidden();
    }

    public function test_dashboard_upsert_and_latest(): void
    {
        $this->actingAs($this->user('editor'), 'sanctum');
        $payload = ['kpis' => [['label' => 'Ketepatan Jadwal', 'value' => '98.7%', 'delta' => '+1.4%', 'up' => true]],
            'fleet' => ['total' => 10, 'ready' => 8, 'maintenance' => 1, 'unfit' => 1]];
        $this->putJson('/api/dashboard/2026-05', $payload)->assertOk();
        $this->putJson('/api/dashboard/2026-06', $payload)->assertOk();
        $this->putJson('/api/dashboard/2026-13', $payload)->assertStatus(422);

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/dashboard/periods')->assertExactJson(['2026-06', '2026-05']);
        $this->getJson('/api/dashboard')->assertJsonPath('period', '2026-06')->assertJsonPath('data.fleet.total', 10);
        $this->getJson('/api/dashboard?period=2026-05')->assertJsonPath('period', '2026-05');
    }

    public function test_help_ticket_public_create_admin_manage(): void
    {
        $res = $this->postJson('/api/help-tickets', ['name' => 'A', 'email' => 'a@x.com', 'subject' => 'S', 'message' => 'M'])->assertCreated();
        $this->assertStringStartsWith('TKT-', $res->json('ticket'));
        $this->postJson('/api/help-tickets', ['name' => 'A'])->assertStatus(422);

        $this->actingAs($this->user('admin'), 'sanctum');
        $id = \App\Models\HelpTicket::first()->id;
        $this->getJson('/api/help-tickets')->assertJsonCount(1);
        $this->putJson("/api/help-tickets/{$id}", ['status' => 'selesai'])->assertJsonPath('status', 'selesai');
    }

    public function test_site_settings(): void
    {
        $this->getJson('/api/settings')->assertOk()->assertJson(['contact' => null, 'faq' => null, 'bab_topics' => null]);

        $this->actingAs($this->user('editor'), 'sanctum');
        $this->putJson('/api/settings/contact', ['value' => ['email' => 'help@x.com', 'phone' => '1', 'hours' => '24 jam']])->assertOk();
        $this->putJson('/api/settings/contact', ['value' => ['email' => 'bukan-email']])->assertStatus(422);
        $this->putJson('/api/settings/lain', ['value' => []])->assertNotFound();

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/settings')->assertJsonPath('contact.email', 'help@x.com');
    }

    public function test_public_stats_and_approve_with_role(): void
    {
        $this->getJson('/api/public-stats')->assertOk()->assertJsonStructure(['categories_count', 'pages_count', 'topics_count']);

        $admin = $this->user('admin', ['status' => 'approved']);
        $sari = $this->user('viewer', ['status' => 'pending']);
        $this->actingAs($admin, 'sanctum')->postJson("/api/users/{$sari->id}/approve", ['role' => 'editor'])->assertOk();
        $this->assertTrue($sari->fresh()->hasRole('editor'));
        $this->assertSame('approved', $sari->fresh()->status);
    }

    public function test_help_ticket_with_attachment(): void
    {
        \Illuminate\Support\Facades\Storage::fake('local');
        $res = $this->post('/api/help-tickets', [
            'name' => 'Budi', 'email' => 'budi@x.com', 'subject' => 'Dokumen', 'message' => 'Tidak terbuka',
            'attachment' => \Illuminate\Http\UploadedFile::fake()->image('layar.png'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $ticket = \App\Models\HelpTicket::first();
        $this->assertTrue($ticket->has_attachment);
        $admin = $this->user('admin');
        $this->actingAs($admin, 'sanctum')->get("/api/help-tickets/{$ticket->id}/attachment")->assertOk();
    }
}

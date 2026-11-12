<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\DocumentVersion;
use App\Models\Page;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuditTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function user(string $role): User
    {
        $u = User::factory()->create(['password' => 'secret123']);
        $u->assignRole($role);

        return $u;
    }

    private function newPage(): Page
    {
        $c = Category::create(['name' => 'SOP Operasional', 'slug' => 'sop-operasional']);

        return Page::create([
            'category_id' => $c->id, 'title' => 'SOP Pembayaran', 'slug' => 'sop-pembayaran',
            'content' => [], 'content_html' => '<p>x</p>', 'content_text' => 'x', 'status' => 'published', 'created_by' => User::factory()->create()->id,
        ]);
    }

    public function test_creating_and_updating_documents_makes_versions(): void
    {
        $page = $this->newPage();
        $this->assertSame(1, $page->fresh()->revision);

        $page->update(['content_html' => '<p>baru</p>']);
        $this->assertSame(2, $page->fresh()->revision);

        // perubahan non-konten (order) tidak menaikkan revisi
        $page->update(['order' => 5]);
        $this->assertSame(2, $page->fresh()->revision);

        $this->assertSame(2, DocumentVersion::where('kind', 'page')->where('subject_id', $page->id)->count());
        $this->assertSame('SOP', DocumentVersion::where('kind', 'page')->latest('id')->first()->doc_type);
        $this->assertTrue(AuditLog::where('action', 'document.updated')->exists());
    }

    public function test_latest_documents_requires_login_and_one_row_per_doc(): void
    {
        $this->getJson('/api/documents/latest')->assertUnauthorized();
        Sanctum::actingAs($this->user('viewer'));
        $page = $this->newPage();
        $page->update(['title' => 'SOP Pembayaran v2']);

        $res = $this->getJson('/api/documents/latest?limit=10')->assertOk();
        $rows = collect($res->json());
        $row = $rows->firstWhere('subject_id', $page->id);
        $this->assertSame('Rev. 1.1', $row['revision_label']);
        $this->assertSame('/docs/sop-operasional/sop-pembayaran', $row['to']);
        $this->assertSame(1, $rows->where('kind', 'page')->count());
    }

    public function test_audit_log_endpoints_are_admin_only(): void
    {
        $this->getJson('/api/audit-logs')->assertUnauthorized();

        Sanctum::actingAs($this->user('viewer'));
        $this->getJson('/api/audit-logs')->assertForbidden();

        Sanctum::actingAs($this->user('admin'));
        $this->newPage();
        $this->getJson('/api/audit-logs?group=document')->assertOk()->assertJsonPath('data.0.action', 'document.created');
        $this->getJson('/api/document-versions')->assertOk();
    }

    public function test_login_and_like_are_audited(): void
    {
        $u = $this->user('viewer');
        $this->postJson('/api/login', ['email' => $u->email, 'password' => 'secret123'])->assertOk();
        $this->postJson('/api/login', ['email' => $u->email, 'password' => 'salah'])->assertStatus(422);
        $this->assertTrue(AuditLog::where('action', 'auth.login')->exists());
        $this->assertTrue(AuditLog::where('action', 'auth.login_failed')->exists());

        Sanctum::actingAs($u);
        $page = $this->newPage();
        $this->postJson("/api/pages/{$page->id}/like")->assertOk();
        $this->assertTrue(AuditLog::where('action', 'document.like')->where('user_id', $u->id)->exists());
    }

    public function test_pdf_requires_login_and_works_when_library_installed(): void
    {
        $page = $this->newPage();
        $this->getJson("/api/pages/{$page->id}/pdf")->assertUnauthorized();

        Sanctum::actingAs($this->user('viewer'));
        $res = $this->get("/api/pages/{$page->id}/pdf");
        if (class_exists(\Dompdf\Dompdf::class)) {
            $res->assertOk();
            $this->assertStringStartsWith('%PDF', $res->getContent());
        } else {
            $res->assertStatus(501);
        }
    }

    public function test_document_content_hidden_from_guests(): void
    {
        $page = $this->newPage();
        $this->getJson("/api/pages/{$page->id}")->assertUnauthorized();
        $this->getJson("/api/categories/{$page->category_id}")->assertUnauthorized();

        // pohon kategori tetap publik (untuk menu), tetapi isinya kosong
        $tree = $this->getJson('/api/categories')->assertOk()->json();
        $tree = $tree['data'] ?? $tree;
        $this->assertNull($tree[0]['pages'][0]['content_html']);

        Sanctum::actingAs($this->user('viewer'));
        $this->getJson("/api/pages/{$page->id}")->assertOk()->assertJsonPath('content_html', '<p>x</p>');
    }

    public function test_category_like_and_pdf(): void
    {
        $cat = $this->newPage()->category;
        $this->getJson("/api/categories/{$cat->id}/like")->assertUnauthorized();

        Sanctum::actingAs($this->user('viewer'));
        $this->postJson("/api/categories/{$cat->id}/like")->assertOk()->assertJson(['liked' => true, 'likes_count' => 1]);
        $this->postJson("/api/categories/{$cat->id}/like")->assertOk()->assertJson(['likes_count' => 1]);
        $this->getJson("/api/categories/{$cat->id}/like")->assertOk()->assertJson(['liked' => true]);
        $this->deleteJson("/api/categories/{$cat->id}/like")->assertOk()->assertJson(['liked' => false, 'likes_count' => 0]);

        $res = $this->get("/api/categories/{$cat->id}/pdf");
        $this->assertContains($res->getStatusCode(), [200, 501]);
    }
}

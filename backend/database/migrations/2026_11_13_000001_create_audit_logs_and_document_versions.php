<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pages', function (Blueprint $table) {
            $table->unsignedInteger('revision')->default(1);
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->unsignedInteger('revision')->default(1);
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->string('user_email')->nullable();
            $table->string('action', 60)->index();
            $table->string('subject_type', 40)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('subject_label')->nullable();
            $table->text('description');
            $table->string('ip', 64)->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('created_at')->nullable()->index();
        });

        Schema::create('document_versions', function (Blueprint $table) {
            $table->id();
            $table->string('kind', 12);                       // page | category
            $table->unsignedBigInteger('subject_id');
            $table->string('title');
            $table->string('category_name')->nullable();
            $table->string('path')->nullable();               // kategori/slug/slug (tanpa /docs)
            $table->string('doc_type', 30)->default('Dokumen');
            $table->unsignedInteger('revision')->default(1);
            $table->string('action', 12);                     // created | updated
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name')->nullable();
            $table->timestamp('created_at')->nullable()->index();
            $table->index(['kind', 'subject_id']);
        });

        $this->backfill();
    }

    /** Dokumen yang sudah ada diberi catatan versi awal (Rev. 1.0). */
    private function backfill(): void
    {
        $cats = \Illuminate\Support\Facades\DB::table('categories')->get()->keyBy('id');
        $pages = \Illuminate\Support\Facades\DB::table('pages')->get()->keyBy('id');
        $rows = [];

        foreach ($cats as $c) {
            $rows[] = [
                'kind' => 'category', 'subject_id' => $c->id, 'title' => $c->name, 'category_name' => null,
                'path' => $c->slug, 'doc_type' => \App\Support\Audit::docType($c->name), 'revision' => 1,
                'action' => 'created', 'user_name' => 'Sistem', 'created_at' => $c->updated_at ?? $c->created_at ?? now(),
            ];
        }
        foreach ($pages as $p) {
            $slugs = [$p->slug];
            $cur = $p;
            $guard = 0;
            while ($cur->parent_id && isset($pages[$cur->parent_id]) && $guard++ < 20) {
                $cur = $pages[$cur->parent_id];
                array_unshift($slugs, $cur->slug);
            }
            $cat = $cats[$p->category_id] ?? null;
            $rows[] = [
                'kind' => 'page', 'subject_id' => $p->id, 'title' => $p->title, 'category_name' => $cat->name ?? null,
                'path' => ($cat->slug ?? '').'/'.implode('/', $slugs), 'doc_type' => \App\Support\Audit::docType($p->title),
                'revision' => 1, 'action' => 'created', 'user_name' => 'Sistem', 'created_at' => $p->updated_at ?? $p->created_at ?? now(),
            ];
        }
        foreach (array_chunk($rows, 100) as $chunk) {
            \Illuminate\Support\Facades\DB::table('document_versions')->insert($chunk);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('document_versions');
        Schema::dropIfExists('audit_logs');
        Schema::table('categories', fn (Blueprint $t) => $t->dropColumn('revision'));
        Schema::table('pages', fn (Blueprint $t) => $t->dropColumn('revision'));
    }
};

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\Category;
use App\Models\Page;

class TomsStructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    private int $categoryOrder = 1;
    private int $creatorId;

    public function run(): void
    {
        $this->creatorId = 7;

        $json = file_get_contents(__DIR__ . '/data/toms_structure.json');
        $categories = json_decode($json, true);

        foreach ($categories as $catData) {
            $category = Category::create([
                'name' => $catData['name'],
                'slug' => Str::slug($catData['name']),
                'order' => $this->categoryOrder++,
            ]);

            $pageOrder = 1;
            foreach ($catData['pages'] as $pageData) {
                $this->createPage($pageData, $category->id, null, $pageOrder++);
            }
        }
    }

    private function createPage(array $pageData, int $categoryId, ?int $parentId, int $order): void
    {
        $page = Page::create([
            'category_id' => $categoryId,
            'parent_id' => $parentId,
            'title' => $pageData['title'],
            'slug' => Str::slug($pageData['title']) . '-' . uniqid(),
            'content' => ['type' => 'doc', 'content' => []],
            'content_html' =>'',
            'content_text' => '',
            'status' => 'draft',
            'order' => $order,
            'created_by' => $this->creatorId,
        ]);

        $childOrder = 1;
        foreach ($pageData['children'] as $childData) {
            $this->createPage($childData, $categoryId, $page->id, $childOrder++);
        }
    }
}

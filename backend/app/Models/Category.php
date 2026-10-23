<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'slug',
        'content',
        'content_html',
        'parent_id',
        'order',
    ];

    protected $casts = [
        'content' => 'array',
    ];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function pages()
    {
        // Halaman level atas, diurutkan sesuai `order` (id sebagai pemisah).
        return $this->hasMany(Page::class)
            ->whereNull('parent_id')
            ->orderBy('order')
            ->orderBy('id');
    }
}

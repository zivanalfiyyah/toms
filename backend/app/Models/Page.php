<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'title', 'slug', 'content',
        'content_html', 'content_text', 'status', 'order',
        'created_by', 'updated_by',
    ];

    protected $casts = [
        'content' => 'array',

    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updater_by');
    }
}

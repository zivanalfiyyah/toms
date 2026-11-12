<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'tag', 'badge', 'title', 'excerpt', 'body', 'image_url',
        'is_lead', 'is_published', 'published_at', 'created_by',
    ];

    protected $casts = [
        'is_lead' => 'boolean',
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentVersion extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'kind', 'subject_id', 'title', 'category_name', 'path', 'doc_type', 'revision',
        'action', 'user_id', 'user_name', 'created_at',
    ];

    protected $casts = ['created_at' => 'datetime'];

    protected $appends = ['revision_label'];

    public function getRevisionLabelAttribute(): string
    {
        return 'Rev. 1.'.max(0, $this->revision - 1);
    }
}

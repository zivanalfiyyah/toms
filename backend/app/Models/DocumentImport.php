<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentImport extends Model
{
    protected $fillable = [
        'page_id', 'original_filename', 'file_path',
        'imported_by', 'status', 'error_message', 'page_id',
    ];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }

    public function importer()
    {
        return $this->belongsTo(User::class, 'imported_by');
    }
}

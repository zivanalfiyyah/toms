<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id', 'user_name', 'user_email', 'action', 'subject_type', 'subject_id',
        'subject_label', 'description', 'ip', 'meta', 'created_at',
    ];

    protected $casts = ['meta' => 'array', 'created_at' => 'datetime'];
}

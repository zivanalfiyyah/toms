<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AccessRequest extends Model
{
    protected $fillable = ['name', 'email', 'division', 'reason', 'status', 'reviewed_by', 'reviewed_at'];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function invitation()
    {
        return $this->hasOne(Invitation::class);
    }
}
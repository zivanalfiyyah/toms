<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    protected $fillable = ['user_id', 'page_id'];

    public function page()
    {
        return $this->belongsTo(Page::class);
    }
}

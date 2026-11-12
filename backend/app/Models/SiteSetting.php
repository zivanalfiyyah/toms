<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value'];

    protected $casts = ['value' => 'array'];

    /** Kunci yang boleh dikelola lewat API. */
    public const KEYS = ['contact', 'faq', 'bab_topics'];
}

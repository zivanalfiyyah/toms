<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DashboardSnapshot extends Model
{
    protected $fillable = ['period', 'data', 'updated_by'];

    protected $casts = ['data' => 'array'];
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpTicket extends Model
{
    protected $fillable = ['user_id', 'name', 'email', 'category', 'subject', 'message', 'attachment_path', 'attachment_name', 'status'];

    protected $hidden = ['attachment_path'];

    protected $appends = ['has_attachment'];

    public function getHasAttachmentAttribute(): bool
    {
        return ! empty($this->attachment_path);
    }
}

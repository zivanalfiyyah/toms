<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Invitation $invitation)
    {
    }

    public function build()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $acceptUrl = rtrim($frontendUrl, '/') . '/accept-invite/' . $this->invitation->token;

        return $this->subject('Undangan bergabung ke TOMS')
            ->view('emails.invitation')
            ->with([
                'name'      => $this->invitation->name,
                'role'      => $this->invitation->role,
                'acceptUrl' => $acceptUrl,
                'expiresAt' => $this->invitation->expires_at->format('d M Y H:i'),
            ]);
    }
}
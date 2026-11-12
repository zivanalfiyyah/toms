<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HelpTicket;
use Illuminate\Http\Request;

class HelpTicketController extends Controller
{
    /** Publik (ber-throttle): laporan kendala dari Pusat Bantuan. */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'category' => 'nullable|string|max:100',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'attachment' => 'nullable|file|max:5120|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,txt',
        ], [
            'attachment.max' => 'Ukuran lampiran maksimal 5 MB.',
            'attachment.mimes' => 'Lampiran harus berupa gambar, PDF, Word, Excel, atau teks.',
        ]);

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $data['attachment_path'] = $file->store('help-tickets');
            $data['attachment_name'] = mb_substr($file->getClientOriginalName(), 0, 200);
        }
        unset($data['attachment']);

        $data['user_id'] = $request->user('sanctum')?->id;

        $ticket = HelpTicket::create($data);

        return response()->json([
            'message' => 'Laporan Anda sudah kami terima.',
            'ticket' => 'TKT-' . str_pad((string) $ticket->id, 5, '0', STR_PAD_LEFT),
        ], 201);
    }

    public function index(Request $request)
    {
        $query = HelpTicket::query()->latest('id');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    public function update(Request $request, HelpTicket $ticket)
    {
        $data = $request->validate(['status' => 'required|in:baru,diproses,selesai']);
        $ticket->update($data);

        return response()->json($ticket);
    }

    public function destroy(HelpTicket $ticket)
    {
        $this->destroyAttachmentFile($ticket);
        $ticket->delete();

        return response()->json(['message' => 'Laporan dihapus']);
    }

    /** Unduh lampiran (khusus admin). */
    public function attachment(HelpTicket $ticket)
    {
        abort_unless($ticket->attachment_path && \Storage::exists($ticket->attachment_path), 404);

        return \Storage::download($ticket->attachment_path, $ticket->attachment_name ?: 'lampiran');
    }

    public function destroyAttachmentFile(HelpTicket $ticket): void
    {
        if ($ticket->attachment_path) {
            \Storage::delete($ticket->attachment_path);
        }
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; color: #222; line-height: 1.6;">
    <h2>Undangan bergabung ke TOMS</h2>

    <p>Halo {{ $name }},</p>

    <p>
        Admin TOMS telah menyetujui permintaan akses kamu dan mengundang kamu
        untuk bergabung sebagai <strong>{{ $role }}</strong>.
    </p>

    <p>
        Klik tombol di bawah ini untuk membuat password dan mengaktifkan akun kamu:
    </p>

    <p>
        <a href="{{ $acceptUrl }}"
           style="display:inline-block; background:#4a4ab7; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none;">
            Aktifkan Akun
        </a>
    </p>

    <p style="font-size: 0.85em; color: #666;">
        Atau salin link ini ke browser kamu:<br>
        {{ $acceptUrl }}
    </p>

    <p style="font-size: 0.85em; color: #666;">
        Link ini berlaku sampai {{ $expiresAt }}. Jika kamu tidak merasa meminta akses ini,
        abaikan saja email ini.
    </p>
</body>
</html>
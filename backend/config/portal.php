<?php

return [
    // Kode yang harus diisi saat pendaftaran akun (bagikan ke karyawan). Ubah lewat .env: PORTAL_COMPANY_CODE
    'company_code' => env('PORTAL_COMPANY_CODE', 'TOMS-2026'),

    // Teks watermark pada PDF unduhan & nama perusahaan di kepala PDF
    'company_name' => env('PORTAL_COMPANY_NAME', 'PT Trans Berjaya Khatulistiwa'),
    'pdf_watermark' => env('PORTAL_PDF_WATERMARK', 'TOMS • PT Trans Berjaya Khatulistiwa'),
];

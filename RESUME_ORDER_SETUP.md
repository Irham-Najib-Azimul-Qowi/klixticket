# 🔄 RESUME ORDER SYSTEM SETUP

Fitur ini memungkinkan user untuk melanjutkan pembayaran order yang terhenti (**PENDING**) langsung dari Riwayat Pesanan tanpa harus melakukan proses checkout dari awal.

## 1. Detail Perubahan Backend
- **Endpoint Baru**: `GET /api/v1/orders/:id/resume` (Protected via Auth)
- **Logika Keamanan**:
  - Validasi kepemilikan (hanya pemilik order yang bisa resume).
  - Validasi status (hanya status `PENDING` yang bisa di-resume).
  - **Auto-Expire**: Jika waktu `expired_at` sudah lewat, status otomatis berubah jadi `EXPIRED` dan user dipaksa beli ulang (untuk menjaga kuota tiket).
  - **Invoice Regeneration**: Jika invoice Xendit sudah kadaluarsa atau gagal dibuat sebelumnya, sistem akan otomatis men-generate invoice baru dengan jumlah yang sama.

## 2. Cara Menggunakan di Frontend
1.  **Halaman Profil / My Item**:
    - Tampilkan daftar pesanan dengan filter `status=pending`.
    - Tambahkan tombol **"Lanjutkan Pembayaran"**.
2.  **Tombol Klik**:
    - Kirim request ke `GET /api/v1/orders/[ORDER_ID]/resume`.
    - Ambil field `checkout_url` dari respon (berada di dalam objek `payment`).
    - Lakukan redirect ke `checkout_url` tersebut.

## 3. Respon API (Resume Order)
Contoh respon sukses:
```json
{
  "success": true,
  "message": "Order resumed successfully",
  "data": {
    "id": "...",
    "total_amount": 100000,
    "status": "PENDING",
    "expired_at": "...",
    "payment": {
      "xendit_invoice_id": "...",
      "checkout_url": "https://checkout.xendit.co/web/...",
      "status": "PENDING"
    },
    "order_items": [...]
  }
}
```

## 4. Langkah Deploy
1. Push semua perubahan ke GitHub.
2. Tunggu CI/CD GitHub Actions selesai.
3. **Database**: Tidak ada perubahan tabel baru, namun pastikan `migration.sql` (dari task sebelumnya) sudah dijalankan agar constraint keamanan sinkron.

---
**Senior Backend & System Designer**

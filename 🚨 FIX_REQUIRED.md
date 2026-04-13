# 🚨 CRITICAL FIXES APPLIED - ACTION REQUIRED

Kami telah mengimplementasikan perbaikan keamanan kritis untuk sistem ticketing. Harap ikuti langkah-langkah di bawah ini untuk mengaktifkan perubahan di production.

## 1. Menjalankan Migrasi Database
Wajib jalankan file `migration.sql` pada database production Anda. Ini akan menambahkan constraint keamanan di level database untuk mencegah data negatif.

```bash
# Contoh menggunakan psql
psql -h <host> -U <user> -d <database> -f backend/migration.sql
```

**Apa saja yang berubah di DB?**
- `order_items`: Menambahkan CHECK constraint `quantity > 0`.
- `orders`: Menambahkan CHECK constraint `total_amount > 0`.
- `users`: Menambahkan kolom `uuid` (untuk migrasi keamanan user ID).

## 2. Pembaruan API Endpoint
Kami telah menambahkan endpoint baru untuk menangani order yang tertunda (PENDING):
- **Endpoint:** `GET /api/v1/orders/:id/resume`
- **Fungsi:** Mengambil detail order PENDING dan mencoba regenerasi invoice Xendit jika sebelumnya gagal.

## 3. Perubahan Logika Keamanan (Backend)
- **Normalisasi Item:** Jika user mengirim ID produk yang sama berkali-kali dalam satu request, sistem sekarang akan menggabungkannya (aggregation) dan memastikan total quantity valid (> 0).
- **Proteksi Stock:** Sistem menggunakan atomic query `UPDATE ... WHERE stock >= quantity` untuk mencegah race condition.
- **Validasi Total:** Sistem menolak order jika `total_amount` bernilai 0 atau negatif.

## 4. Langkah Deploy Ulang
1. Pastikan database sudah dimigrasi (Step 1).
2. Rebuild backend:
   ```bash
   cd backend
   go build -o main .
   ```
3. Restart service backend.

## 5. Testing Rekomendasi
Setelah deploy, mohon verifikasi hal berikut:
- Coba buat order dengan quantity negatif (Seharusnya gagal/ditolak).
- Coba buat order dengan item duplikat (misal: ID 1 qty 2 DAN ID 1 qty -1). Sistem seharusnya mengabaikan qty negatif atau menolaknya.
- Pastikan order PENDING lama tetap bisa dibuka dan dilanjutkan pembayarannya.

---
**Senior Backend & Security Team**

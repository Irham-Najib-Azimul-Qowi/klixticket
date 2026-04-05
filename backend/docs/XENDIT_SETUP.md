# Panduan Setup Xendit API & Webhook untuk Backend

Xendit adalah Payment Gateway (PG) yang akan memproses pembayaran tiket pengguna via Bank Transfer (VA), e-Wallet, atau metode lainnya. Anda perlu mengatur kunci autentikasinya untuk backend kita.

## Langkah 1: Buat Akun Xendit dan Dapatkan API KEYS
1. Daftar atau Login ke [Dashboard Xendit](https://dashboard.xendit.co/).
2. Pastikan akun Anda berada dalam **Mode Tes (Test Mode)**. Anda dapat melihat *toggle* di kiri atas Dasbor (pastikan tertulis Test Mode, bukan Live Mode).
3. Di panel kiri Dasbor, arahkan kursor ke tab **Settings (Pengaturan)** di bagian bawah, lalu klik **API Keys**.
4. Pindah ke tab **Secret Keys**.
5. Klik **Generate Secret Key**.
6. Beri nama key (Misalnya: `Swanirwana Backend API`).
7. Pada pilihan izin otorisasi (Permissions), **Pilih "Write" (Tulis) untuk "Invoices"**. (Kita hanya menggunakan Invoice untuk MVP saat ini agar mendukung e-Wallet dan VA secara instan).
8. Klik Generate. Masukkan password Xendit Anda untuk konfirmasi.
9. Sebuah kode token panjang (yang diawali dengan `xnd_...`) akan muncul. **SALIN KODE TERSEBUT**. Anda hanya bisa melihatnya sekali!

## Langkah 2: Dapatkan Token Verifikasi Webhook
Webhook adalah jalur di mana Xendit "mengetuk" server backend Anda untuk memberitahu bahwa pengguna telah membayar pesanan. Untuk mencegah orang iseng berpura-pura menjadi Xendit dan meretas server Anda menjadi seolah-olah sudah lunas, kita perlu Verifikasi Token (Callback Token).

1. Tetap di Dasbor Xendit, buka menu **Settings (Pengaturan)** -> **Callbacks / Webhooks**.
2. Di bagian **Callback Verification Token (Token Verifikasi Callback)**, temukan token rahasia yang tertera. 
3. **Salin token tersebut**.

## Langkah 3: Setup Webhook URL (Nanti saat Server bisa diakses internet)
Karena sekarang kita sedang bekerja di `http://localhost:8080`, Xendit (yang ada di internet publik) tidak bisa memanggil localhost Anda langsung. 

Untuk saat ini biarkan saja, tapi **Nantinya** ketika Backend Anda sudah dionlinekan (misal alamatnya `https://api.domain-anda.com`), Anda harus:
1. Kembali ke **Settings** -> **Callbacks / Webhooks**.
2. Pada bagian **Invoices (Paid / Lunas)** dan **Invoices (Expired / Kedaluwarsa)**, masukkan URL backend kita:
   `https://api.domain-anda.com/api/v1/webhooks/xendit`
3. Centang kotak checklist, lalu klik **Simpan (Save and Test)**.

(Catatan: Untuk pengetesan lokal nanti, kita akan menggunakan alat seperti *ngrok* atau Postman webhook tester if needed, tetapi kode webhook tetap saya tuliskan di backend siap tancap gas).

## Langkah 4: Masukkan ke `.env` Backend
Buka kembali file `.env` di direktori `backend/` Anda, tambahkan baris ini:

```env
XENDIT_API_KEY="xnd_development_... (Kode Secret Key Anda dari Langkah 1)"
XENDIT_WEBHOOK_TOKEN="KODE_CALLBACK_TOKEN_DARI_LANGKAH_2"
```

## Selesai!
Sekarang Backend kita sudah siap 100% untuk membuat sistem Checkout order tiket.

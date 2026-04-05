# Panduan Setup Google OAuth 2.0 untuk Backend

Karena saya (AI) tidak bisa login ke akun Google Anda, Anda harus mengikuti langkah-langkah di bawah ini untuk mendapatkan **Client ID** dan **Client Secret** yang dibutuhkan oleh backend kita.

## Langkah 1: Buat Project di Google Cloud Console
1. Buka [Google Cloud Console](https://console.cloud.google.com/).
2. Login dengan akun Google Anda.
3. Klik dropdown project di kiri atas (di sebelah logo Google Cloud), lalu klik **New Project**.
4. Beri nama project (misal: `swanirwana-ticketing-app`), lalu klik **Create**.

## Langkah 2: Setup OAuth Consent Screen
1. Di menu sidebar kiri, pilih **APIs & Services** > **OAuth consent screen**.
2. Pilih **External** (karena aplikasi ini untuk publik), lalu klik **Create**.
3. Isi kolom wajib:
   - **App name**: Swanirwana Ticketing (atau nama event Anda).
   - **User support email**: Email Anda.
   - **Developer contact information**: Email Anda.
4. Klik **Save and Continue**.
5. Di bagian **Scopes**, Anda bisa klik **Add or Remove Scopes**. Pilih:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
   Lalu klik **Save and Continue**.
6. Bagian **Test users**, Anda bisa biarkan kosong atau tambah email Anda sendiri saat masa testing. Klik **Save and Continue**, lalu balik ke Dashboard.

## Langkah 3: Dapatkan Credentials
1. Di menu sidebar kiri, pilih **APIs & Services** > **Credentials**.
2. Klik tombol **+ CREATE CREDENTIALS** di bagian atas, pilih **OAuth client ID**.
3. Pilih **Application type** -> `Web application`.
4. Beri nama (contoh: `Backend API`).
5. Pada bagian **Authorized redirect URIs**, ini sangat penting! Masukkan:
   - Untuk testing lokal (Backend di port 8080): `http://localhost:8080/api/v1/auth/google/callback`
   - *(Nanti jika sudah dideploy, tambahkan URL production Anda)*
6. Klik **Create**.
7. Akan muncul popup berisi **Client ID** dan **Client Secret**. **SIMPAN KEDUA KODE INI**.

## Langkah 4: Masukkan ke `.env` Backend
Buka file `.env` di folder `backend/` Anda, dan tambahkan baris berikut (ganti dengan kode rahasia yang baru Anda dapatkan):

```env
GOOGLE_CLIENT_ID="KODE_CLIENT_ID_ANDA.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="KODE_CLIENT_SECRET_ANDA"
GOOGLE_REDIRECT_URL="http://localhost:8080/api/v1/auth/google/callback"
```

## Selesai!
Sekarang Backend Go Anda sudah siap untuk mengurus alur login dengan menggunakan token yang valid.

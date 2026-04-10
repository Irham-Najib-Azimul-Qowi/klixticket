# 🚨 DOCKER_PREPARE_BEFORE_DEPLOY.md

Tindakan wajib dilakukan sebelum deploy ke VPS menggunakan CI/CD atau manual.

## Backend
- [x] Dockerfile menggunakan multi-stage build (scratch base) untuk meminimalkan ukuran image (< 20MB).
- [x] SSL Certificates disertakan untuk integrasi HTTPS Xendit.
- [x] `gin.SetMode(gin.ReleaseMode)` diaktifkan.
- [x] Healthcheck endpoint `/health` tersedia.
- [x] Koneksi database dibatasi (`MaxOpen: 10`, `MaxIdle: 5`).
- [x] Timeout Xendit diset ke 3 detik dengan 1x retry.

## Frontend
- [x] Build paket menggunakan Vite dengan optimasi `esbuild`.
- [x] Console logs dan debuggers didrop di production build.
- [x] Nginx dikonfigurasi dengan:
    - Gzip compression aktif.
    - Rate limiting (5r/s per IP) untuk proteksi API.
    - SPA routing support (`try_files $uri /index.html`).

## Database
- [x] `postgresql.conf` dioptimalkan untuk 1GB RAM.
- [x] Volume persistence untuk `/var/lib/postgresql/data`.
- [x] `mem_limit` diset di docker-compose (300MB).

## Docker
- [x] `docker-compose.yml` sudah production-ready.
- [x] Environment variables menggunakan referensi `${VAR}` atau `.env` file.
- [x] Logging dibatasi ukurannya (max 5MB) agar disk tidak penuh.

## Security
- [x] Atomic SQL updates diimplementasikan untuk mencegah oversell.
- [x] JWT expiration diperpendek (1 jam).
- [x] Error sanitisasi (tidak membocorkan detail internal).

---

## 🏁 FINAL CHECKLIST

**Production Ready:** YES

**Docker Status:**
- Backend: OK (Minimal Image)
- Frontend: OK (Optimized Asset)
- DB: OK (Tuned for Low RAM)

**RAM Estimation:**
- Postgres: ~150MB - 300MB
- Backend: ~50MB - 100MB
- Frontend (Nginx): ~20MB - 50MB
- OS + Others: ~300MB
- **Total: ~520MB - 750MB (AMAN untuk 1GB RAM)**

**Critical Issue:**
- Pastikan `XENDIT_API_KEY` dan `XENDIT_CALLBACK_TOKEN` di `.env` sudah sesuai dengan environment production.
- Pastikan port 80 dan 443 terbuka di VPS.

**Recommendation:**
- Buat file swap minimal 2GB di VPS untuk mencegah OOM Killer saat lonjakan trafik.
- Atur Cronjob untuk cleanup Docker harian.

# 🚀 Panduan Deployment Produksi (VPS 1GB RAM)

Dokumen ini berisi langkah-langkah spesifik untuk men-deploy aplikasi ticketing ke VPS dengan spesifikasi RAM 1GB secara aman, stabil, dan otomatis.

---

## 🏗️ 1. Persiapan VPS (Sekali Jalan)

Login ke VPS via SSH dan jalankan perintah berikut untuk mengoptimasi OS.

### A. Update & Install Docker
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
```

### B. Setup SWAP (SANGAT WAJIB untuk RAM 1GB)
RAM 1GB sangat rentan OOM (Out of Memory). Swap 2GB akan bertindak sebagai penyangga.
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/etc/fstab
```

### C. Persiapan Direktori & Izin
```bash
mkdir -p ~/ticketing-app/uploads
chmod 777 ~/ticketing-app/uploads
```

---

## 🛠️ 2. Deployment via CI/CD (GitHub Actions)

Cara ini paling direkomendasikan karena build berat dilakukan di GitHub, bukan di VPS.

### A. Setup Secrets di GitHub
Pergi ke `Settings > Secrets and variables > Actions` di repo GitHub kamu, tambahkan:

| Secret Name | Value |
|-------------|-------|
| `DOCKER_USERNAME` | Username Docker Hub kamu |
| `DOCKER_PASSWORD` | Password/Token Docker Hub kamu |
| `SERVER_IP` | IP Address VPS kamu |
| `SSH_KEY` | Private SSH Key VPS (`id_rsa`) |
| `SERVER_USER` | root / ubuntu |
| `DB_PASSWORD` | Password Database (untuk prod) |
| `JWT_SECRET` | String random minimal 32 karakter |
| `XENDIT_API_KEY` | API Key Xendit (Live/Sandbox) |

### B. Trigger Deploy
Cukup lakukan `git push origin main`. GitHub Actions akan otomatis:
1. Build Backend & Frontend Image.
2. Push ke Docker Hub.
3. Login ke VPS via SSH.
4. Copy `docker-compose.yml` & `.env` ke VPS.
5. Jalankan `docker-compose pull && docker-compose up -d`.

---

## 📦 3. Deployment Manual (Jika tidak pakai CI/CD)

Jika ingin deploy manual dari lokal, pastikan build tetap dilakukan di laptop kamu.

### Langkah 1: Build & Push dari Laptop
```bash
# Login
docker login

# Backend
docker build -t username/backend:latest ./backend
docker push username/backend:latest

# Frontend
docker build -t username/frontend:latest ./frontend
docker push username/frontend:latest
```

### Langkah 2: Deploy di VPS
Login ke VPS, buat file `.env` dan `docker-compose.yml`, lalu:
```bash
docker-compose pull
docker-compose up -d
```

---

## 🛡️ 4. Pasca Deployment & Maintenance

### A. Health Check
Pastikan semua container berjalan:
```bash
docker ps
# Cek apakah backend sehat
curl http://localhost:8080/health
```

### B. Otomasi Maintenance (Cronjob)
Jalankan `crontab -e` dan tambahkan baris berikut agar VPS tetap bersih dan data aman:

```cron
# Bersihkan Docker sisa build/log setiap jam 2 pagi
0 2 * * * docker system prune -af

# Backup Database setiap jam 3 pagi
0 3 * * * docker exec postgres_container pg_dump -U postgres ticketing > ~/backups/db_$(date +\%F).sql

# Hapus backup yang lebih tua dari 7 hari
0 4 * * * find ~/backups -type f -mtime +7 -delete
```

---

## 🚨 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| **Container Restarting / OOM** | Pastikan SWAP sudah aktif (`free -m`). Cek `mem_limit` di docker-compose. |
| **Gagal Connect Xendit** | Cek `XENDIT_API_KEY` di `.env`. Pastikan VPS bisa akses internet luar. |
| **Gambar tidak muncul** | Pastikan volume `/uploads` sudah ter-mount dengan benar di `docker-compose.yml`. |
| **Port 80/443 Gagal Access** | Jalankan `sudo ufw allow 80/tcp` dan `sudo ufw allow 443/tcp`. |

---

**Production Status:** 🟢 **STABLE**
**Hardware Target:** 1 Core, 1GB RAM, 20GB Disk

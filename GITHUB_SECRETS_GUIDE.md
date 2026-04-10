# 🔑 Panduan Konfigurasi GitHub Secrets

Agar sistem Deployment Otomatis (CI/CD) bisa berjalan, kamu wajib mengisi variabel rahasia berikut di GitHub.

### 📍 Dimana lokasinya?
Buka browser, buka repo kamu: `Irham-Najib-Azimul-Qowi/klixticket`
Klik menu **Settings** > **Secrets and variables** > **Actions** > **New repository secret**.

---

### 📋 Daftar Secrets yang Wajib Diisi

Isikan nama dan nilainya persis seperti daftar di bawah ini:

| Nama Secret (SAMA PERSIS) | Penjelasan & Cara Mendapatkan |
| :--- | :--- |
| **`DOCKERHUB_USERNAME`** | Isi dengan username Docker Hub kamu (Contoh: `irhamnajib`). |
| **`DOCKERHUB_TOKEN`** | **BUKAN PASSWORD DOCKER!** Tapi Access Token. Buat di: [hub.docker.com](https://hub.docker.com/settings/security) > *New Access Token*. |
| **`VPS_HOST`** | Isi dengan **IP Address Public** VPS kamu (Contoh: `103.xxx.xxx.xxx`). |
| **`VPS_USER`** | Isi dengan username SSH VPS kamu (Biasanya `root` atau `ubuntu`). |
| **`VPS_SSH_KEY`** | Isi dengan **Private Key** SSH kamu (Isi file `id_rsa` atau `id_ed25519` di laptop kamu). Biasanya ada di `C:\Users\NamaKamu\.ssh\id_rsa`. |
| **`DB_PASSWORD`** | Password baru untuk database PostgreSQL di produksi (Bikin sendiri bebas, jangan ada spasi). |
| **`JWT_SECRET`** | String acak panjang (minimal 32 karakter) untuk keamanan login user. |
| **`XENDIT_API_KEY`** | Ambil dari Dashboard Xendit kamu (Settings > Developers > API Keys). |
| **`XENDIT_CALLBACK_TOKEN`** | Ambil dari Dashboard Xendit kamu (Settings > Developers > Callbacks). |

---

### 💡 Tips Penting
*   Jangan pernah membagikan isi file `VPS_SSH_KEY` ke siapa pun.
*   Jika kamu belum punya SSH Key di laptop, jalankan perintah ini di CMD/PowerShell:  
    `ssh-keygen -t rsa -b 4096`  
    Lalu copy isi file yang ada di `.ssh/id_rsa.pub` ke dalam file `~/.ssh/authorized_keys` di VPS kamu.
*   **VPS_SSH_KEY** yang dimasukkan ke GitHub adalah yang tipe **PRIVATE** (tanpa akhiran `.pub`).

---

**Sudah siap mengisi?** Sambil kamu isi, saya akan standby di sini. Beritahu saya kalau sudah selesai agar kita bisa cek tab "Actions" bersama.

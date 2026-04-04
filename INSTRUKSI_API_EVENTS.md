# Panduan Membuat API Events (Backend Go & Frontend Next.js)

Dokumen ini berisi instruksi spesifik, langkah demi langkah, beserta standar keamanan dan optimasi untuk membuat API pertama di backend (Go) guna mengambil data *events* dari database dan menampilkannya di frontend (Next.js).

---

## 1. Tuntutan Keamanan (Security)
Untuk menjaga agar server dan aplikasi tetap aman, API Get Events ini harus mematuhi hal-hal berikut:

- **CORS (Cross-Origin Resource Sharing) Ketat:**
  API ini akan dipanggil oleh Next.js (browser & server). Pastikan backend Go membatasi CORS origin **hanya** ke domain frontend kamu.
  - *Dev:* `http://localhost:3000`
  - *Prod:* `https://domain-kamu.com`
  *(Dilarang keras memakai wildcard `AllowOrigins: "*"` untuk production)*.
- **Pencegahan SQL Injection:**
  Wajib menggunakan **ORM (seperti GORM)** atau Query Builder yang mendukung *Parameterized Query* otomatis, jika menggunakan `database/sql` bawaan, gunakan Prepared Statements. Jangan pernah melakukan concatinasi (penggabungan string) variabel langsung ke query SQL.
- **Rate Limiting:**
  Data publik tanpa autentikasi rawan di-spam atau diserang (DDoS/scraping). Tambahkan **Rate Limiter middleware** di endpoint `/api/events` (misalnya batasi maksimal 60 request per menit dari 1 IP).

## 2. Tuntutan Optimasi (Optimal Performance)
Kinerja API harus ringan dan cepat merespon:

- **Wajib Pagination:** Jangan pernah mengirim seluruh baris data *events* yang ada di database. API wajib menerima dan menggunakan query `?limit=10&page=1` di Go untuk me-limit hasil SQL query.
- **Index Database:** Pastikan kolom yang sering disaring atau diurutkan (seperti `date` atau `status`) sudah memiliki Index (via Migration) di database (PostgreSQL/MySQL).

---

## 3. Instruksi Langkah Pengembangan di Backend (Golang)

Pola pengembangan yang baik memisahkan route, model, dan controller:

### Langkah A: Buat Model Representasi (`models/event.go`)
Definisikan struktur tabel Event agar ORM mengenali datanya.
```go
package models

import "time"

type Event struct {
    ID          uint      `json:"id" gorm:"primaryKey"`
    Title       string    `json:"title"`
    Description string    `json:"description"`
    Date        time.Time `json:"date"`
    Location    string    `json:"location"`
    IsActive    bool      `json:"is_active" gorm:"index"` // flag aktif/tidaknya event
}
```

### Langkah B: Buat Controller/Handler (`controllers/eventController.go`)
Fungsi yang akan dijalankan ketika endpoint ditembak. (Misal di sini dengan asumsi memakai framework seperti Gin atau Fiber).
```go
package controllers

import (
	"net/http"
	"strconv"

	"mastutik-api/config"
	"mastutik-api/models"

	"github.com/gin-gonic/gin"
)

// GetPublicEvents digunakan untuk mengambil list event untuk public frontend
func GetPublicEvents(c *gin.Context) {
	// 1. Ambil Query Parameter untuk pagination (limit & page)
	pageStr := c.DefaultQuery("page", "1")
	limitStr := c.DefaultQuery("limit", "10")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	// Validasi nilai
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	offset := (page - 1) * limit

	var events []models.Event
	var total int64

	// 2. Hitung total data yang aktif
	if err := config.DB.Model(&models.Event{}).Where("is_active = ?", true).Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count events"})
		return
	}

	// 3. Query SELECT ke database menggunakan ORM (GORM) dengan Limit dan Offset
	if err := config.DB.Where("is_active = ?", true).Limit(limit).Offset(offset).Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	// Hitung total page
	totalPages := int(total) / limit
	if int(total)%limit != 0 {
		totalPages++
	}

	// 4. Return respon dalam struktur JSON
	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data":   events,
		"meta": gin.H{
			"total":        total,
			"current_page": page,
			"total_pages":  totalPages,
			"limit":        limit,
		},
	})
}
```

### Langkah C: Pasang Route (`routes/api.go` / di dalam `main.go`)
```go
func SetupRoutes(r *gin.Engine) {
    // Daftarkan Rate Limiter middleware secara spesifik untuk route public
    api := r.Group("/api")
    {
        api.GET("/events", controllers.GetPublicEvents) // Akses ke List Event
    }
}
```

---

## 4. Instruksi Menarik Data di Frontend (Next.js)

Sekarang pindah ke projek Next.js, buat logika pengambilan data (*Data Fetching*). Agar optimal, kamu bisa memilih cara fetching tergantung pada kapan kamu membutuhkan datanya di-render:

### Cara 1: Menggunakan SWR/React Query (Optimasi via Cache Interaktif)
Sangat dianjurkan apabila event sering berubah dan ditambahkan filter-filter aktif di halaman klien.

```javascript
'use client'; // Jika menggunakan Next.js App Router

import useSWR from 'swr';

// Fetcher standard
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function EventsPage() {
  // Disarankan: URL backend didapat dari process.env.NEXT_PUBLIC_API_URL
  const { data, error, isLoading } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/events?page=1&limit=10`,
    fetcher
  );

  if (isLoading) return <div>Memuat Events...</div>;
  if (error) return <div>Error mengambil data!</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {data?.data?.map((event) => (
        <div key={event.id} className="p-4 border rounded">
          <h2>{event.title}</h2>
          <p>{new Date(event.date).toLocaleDateString()}</p>
          <p>{event.location}</p>
        </div>
      ))}
    </div>
  );
}
```

### Cara 2: React Server Components (Jika memakai App Router untuk SEO ekstra)
Next.js dapat meluncurkan request ke Golang *sebelum* dikirim ke browser klien.

```javascript
// page.js (contoh di Next.js App Router - Server Component)

export default async function EventsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events?limit=10`, {
    next: { revalidate: 60 }, // Cache respon backend selama 60 detik (ISR) -> OPTIMAL
  });
  
  if (!res.ok) throw new Error("Gagal load data");
  const result = await res.json();
  const events = result.data;

  return (
    <div>
      {events.map((evt) => (
        <div key={evt.id}>{evt.title}</div>
      ))}
    </div>
  );
}
```

---

## 5. Panduan Tepat Sasaran: Pasang API ke Katalog Event
*(Sangat Jelas & Detail)*

Buka folder proyekmu, pergilah ke file ini: **`frontend/src/pages/LandingPage.tsx`**

Kita akan mengedit 3 bagian di dalam file tersebut:

### Langkah 1: Tambahkan Hook (Ganti Baris ke-1)
Paling atas di file `LandingPage.tsx`, cari kode ini (biasanya di baris ke-1):
```tsx
import React from 'react';
```

**Ubah menjadi:**
```tsx
import React, { useState, useEffect } from 'react';
```
*(Ini menambahkan fungsi state dan effect dari React untuk memanggil API).*

---

### Langkah 2: Tambahkan State dan Fetch API (Di bawah Baris ke-8)
Scroll ke bawah sedikit (sekitar baris ke-8), cari kode ini:
```tsx
const LandingPage: React.FC = () => {
  return (
```

**Tempatkan kode Fetch tepat sebelum `return (`, sehingga kodenya menjadi:**
```tsx
const LandingPage: React.FC = () => {
  // --- MULAI TAMBAHKAN KODE INI ---
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetch('http://localhost:8080/api/events')
       .then(res => res.json())
       .then(result => {
         if (result.status === "success") {
           setEvents(result.data); 
         }
       })
       .catch(err => console.error("Error API:", err))
       .finally(() => setLoading(false));
  }, []);
  // --- BATAS TAMBAHAN KODE ---

  return (
```

---

### Langkah 3: Ganti Data Dummy menjadi Data Asli (Ganti Baris ke-61 sampai ke-96)
Scroll jauh ke bawah sampai masuk ke bagian daftar event.  
**CARI DAN HAPUS BLOK KODE INI (Mulai baris 61 hingga 96):**
```tsx
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Symphony of The Stars", date: "Oct 12, 2026", loc: "Jakarta Arena", price: "IDR 500,000", tag: "Concert" },
            { title: "DevConnect Summit", date: "Nov 20, 2026", loc: "ICE BSD", price: "IDR 150,000", tag: "Tech" },
            { title: "Culinary Night Fest", date: "Dec 05, 2026", loc: "GBK Plaza", price: "Free", tag: "Festival" }
          ].map((item, i) => (
            <Card key={i} className="group overflow-hidden rounded-2xl border-border bg-card shadow-none hover:shadow-sm transition-shadow">
...
            </Card>
          ))}
        </div>
```

**GANTI BLOK YANG DIHAPUS TERSEBUT DENGAN KODE INI:**
```tsx
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className="text-muted-foreground">Memuat daftar acara dari server...</p>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground">Yah, belum ada acara yang tersedia.</p>
          ) : (
            events.map((item: any) => (
              <Card key={item.id} className="group overflow-hidden rounded-2xl border-border bg-card shadow-none hover:shadow-sm transition-shadow">
                <div className="aspect-[16/9] bg-muted relative overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Badge className="absolute top-4 right-4" variant="secondary">Event</Badge>
                    <span className="text-muted-foreground font-semibold uppercase tracking-widest text-xs">Image Placeholder</span>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold leading-tight mb-4 group-hover:text-primary transition-colors">{item.title}</h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" /> 
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" /> {item.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Harga</p>
                      <p className="text-foreground text-lg cursor-help font-bold" title={item.description}>Termurah</p>
                    </div>
                    <Button size="sm" variant="default" className="rounded-full">Get Ticket</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
```

Selesai! Sekarang file `LandingPage.tsx` akan otomatis menarik data acara langsung dari Backend Go milikmu yang berjalan di `http://localhost:8080`.

## Rangkuman Next Step untukmu:
1. Buat Schema/Migrasi tabel database bernama `events`.
2. Tulis kodenya di `backend/` menggunakan GORM atau driver SQL kamu, dan sesuaikan Controller-nya.
3. Eksekusi server backend dan tes route dengan Postman/Insomnia ke `http://localhost:8080/api/events`.
4. Pergi ke frontend Next.js, pasang `env` url backend, dan buat component list dari response JSON nya.

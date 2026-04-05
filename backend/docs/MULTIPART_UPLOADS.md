# Multipart Upload Guide

Semua endpoint admin berikut mendukung `multipart/form-data` untuk upload image lokal. File yang diterima: `.jpg`, `.jpeg`, `.png`, `.webp` dengan ukuran maksimal 5 MB.

## Event

Endpoint:

```bash
POST /api/v1/admin/events
PUT /api/v1/admin/events/:id
```

Field form:

- `title`
- `description`
- `location`
- `start_date` format RFC3339
- `end_date` format RFC3339
- `publish_status` nilai `draft` atau `published`
- `ticket_types` string JSON array
- `banner` file image opsional
- `banner_url` opsional jika ingin memakai URL external

Contoh create:

```bash
curl -X POST http://localhost:8080/api/v1/admin/events \
  -H "Authorization: Bearer <token-admin>" \
  -F "title=Swanirwana Fest 2026" \
  -F "description=Festival musik tahunan" \
  -F "location=JIExpo Kemayoran" \
  -F "start_date=2026-08-10T19:00:00+07:00" \
  -F "end_date=2026-08-10T23:00:00+07:00" \
  -F "publish_status=published" \
  -F "ticket_types=[{\"name\":\"Presale 1\",\"description\":\"Batch awal\",\"price\":150000,\"quota\":100,\"sales_start_at\":\"2026-04-10T00:00:00+07:00\",\"sales_end_at\":\"2026-05-01T23:59:59+07:00\"}]" \
  -F "banner=@C:/path/to/banner.jpg"
```

Contoh update:

```bash
curl -X PUT http://localhost:8080/api/v1/admin/events/1 \
  -H "Authorization: Bearer <token-admin>" \
  -F "title=Swanirwana Fest 2026 Revised" \
  -F "description=Lineup baru" \
  -F "location=JIExpo Kemayoran" \
  -F "start_date=2026-08-10T19:00:00+07:00" \
  -F "end_date=2026-08-10T23:00:00+07:00" \
  -F "publish_status=published" \
  -F "ticket_types=[{\"id\":1,\"name\":\"Presale 1\",\"description\":\"Batch lama diupdate\",\"price\":175000,\"quota\":120,\"sales_start_at\":\"2026-04-10T00:00:00+07:00\",\"sales_end_at\":\"2026-05-01T23:59:59+07:00\",\"active_status\":true},{\"name\":\"VIP\",\"description\":\"Ticket baru\",\"price\":500000,\"quota\":50,\"sales_start_at\":\"2026-04-15T00:00:00+07:00\",\"sales_end_at\":\"2026-07-01T23:59:59+07:00\"}]" \
  -F "banner=@C:/path/to/new-banner.png"
```

## Merchandise

Endpoint:

```bash
POST /api/v1/admin/merchandise
PUT /api/v1/admin/merchandise/:id
```

Field form:

- `name`
- `description`
- `price`
- `stock`
- `active_status`
- `image` file image opsional
- `image_url` opsional jika ingin memakai URL external

Contoh create:

```bash
curl -X POST http://localhost:8080/api/v1/admin/merchandise \
  -H "Authorization: Bearer <token-admin>" \
  -F "name=T-Shirt Official" \
  -F "description=Merch resmi event" \
  -F "price=125000" \
  -F "stock=50" \
  -F "active_status=true" \
  -F "image=@C:/path/to/shirt.webp"
```

Contoh update:

```bash
curl -X PUT http://localhost:8080/api/v1/admin/merchandise/1 \
  -H "Authorization: Bearer <token-admin>" \
  -F "name=Hoodie Official" \
  -F "description=Merch premium" \
  -F "price=275000" \
  -F "stock=25" \
  -F "active_status=true" \
  -F "image=@C:/path/to/hoodie.jpg"
```

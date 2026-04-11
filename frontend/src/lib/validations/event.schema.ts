import { z } from 'zod';

const ticketTierSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Nama tier harus diisi.'),
  price: z.any().transform((val) => Number(val)).pipe(z.number().min(0, 'Harga tidak boleh negatif.')),
  quota: z.any().transform((val) => Number(val)).pipe(z.number().int().min(1, 'Kuota minimal 1.')),
});

export const eventSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter.'),
  description: z.string().optional(),
  location: z.string().min(1, 'Lokasi harus diisi.'),
  start_date: z.string().min(1, 'Tanggal mulai harus diisi.'),
  end_date: z.string().min(1, 'Tanggal selesai harus diisi.'),
  publish_status: z.enum(['draft', 'published']),
  ticket_types: z.array(ticketTierSchema).min(1, 'Minimal satu tipe tiket harus ada.'),
  // File is validated as an instance of File or null
  banner: z.any().optional().refine((file) => {
    if (!file) return true;
    return file instanceof File;
  }, 'Banner harus berupa file gambar.')
}).refine((data) => {
  if (!data.start_date || !data.end_date) return true;
  return new Date(data.end_date) > new Date(data.start_date);
}, {
  message: "Tanggal selesai harus setelah tanggal mulai.",
  path: ["end_date"],
});

export type EventInput = z.infer<typeof eventSchema>;
export type TicketTierInput = z.infer<typeof ticketTierSchema>;

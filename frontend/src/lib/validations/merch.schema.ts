import { z } from 'zod';

export const merchSchema = z.object({
  name: z.string().min(3, 'Nama merchandise minimal 3 karakter.'),
  slug: z.string().optional(),
  description: z.string().optional(),
  price: z.any().transform((val) => Number(val)).pipe(z.number().min(0, 'Harga tidak boleh negatif.')),
  stock: z.any().transform((val) => Number(val)).pipe(z.number().int().min(0, 'Stok tidak boleh negatif.')),
  active_status: z.boolean(),
  image: z.any().optional().refine((file) => {
    if (!file) return true;
    return file instanceof File;
  }, 'Gambar harus berupa file.')
});

export type MerchInput = z.infer<typeof merchSchema>;

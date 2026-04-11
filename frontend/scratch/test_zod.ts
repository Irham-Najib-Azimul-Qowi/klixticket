import { z } from 'zod';

const ticketTierSchema = z.object({
  name: z.string().min(1, 'Nama tier harus diisi.'),
  price: z.coerce.number().min(0, 'Harga tidak boleh negatif.'),
  quota: z.coerce.number().int().min(1, 'Kuota minimal 1.'),
});

type Tier = z.infer<typeof ticketTierSchema>;

const test: Tier = {
    name: 'test',
    price: 100,
    quota: 10
};

console.log(typeof test.price);

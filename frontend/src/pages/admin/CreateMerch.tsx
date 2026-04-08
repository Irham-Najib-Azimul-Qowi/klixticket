import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminApi } from '@/services/api';
import { ArrowLeft, Save, Loader2, Package } from 'lucide-react';

const CreateMerch: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [merchData, setMerchData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    active_status: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMerchData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchData.name || !merchData.price || !merchData.stock) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', merchData.name);
      formData.append('description', merchData.description);
      formData.append('price', merchData.price);
      formData.append('stock', merchData.stock);
      formData.append('active_status', String(merchData.active_status));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await adminApi.createMerchandise(formData);
      navigate('/admin/merchandise');
    } catch (error) {
       console.error("Failed to create merchandise", error);
       alert("Failed to create merchandise. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/admin/merchandise">
          <Button variant="outline" size="icon" className="border-2 border-black rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight text-stanton">Add New Merch</h2>
          <p className="text-muted-foreground">List a new physical item in the store.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-stanton text-white border-b-4 border-black mb-6 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8" />
              <CardTitle className="text-2xl font-black uppercase">Merchandise Details</CardTitle>
            </div>
            <CardDescription className="text-cream/80 font-bold">Configure product information and stock levels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 p-8">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-stanton">Product Name <span className="text-burgundy">*</span></label>
              <Input name="name" value={merchData.name} onChange={handleChange} placeholder="e.g. Connected Oversized Tee V1" className="border-2 border-black py-6 text-lg font-bold" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-stanton">Description</label>
              <textarea 
                name="description"
                value={merchData.description}
                onChange={handleChange}
                className="flex min-h-[120px] w-full rounded-md border-2 border-black bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Product details, material info, etc..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-stanton">Price (IDR) <span className="text-burgundy">*</span></label>
                <Input name="price" type="number" value={merchData.price} onChange={handleChange} placeholder="0" className="border-2 border-black py-6 text-lg font-bold" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-stanton">Stock Quantity <span className="text-burgundy">*</span></label>
                <Input name="stock" type="number" value={merchData.stock} onChange={handleChange} placeholder="0" className="border-2 border-black py-6 text-lg font-bold" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-stanton">Product Image</label>
              <Input type="file" accept="image/*" onChange={handleFileChange} className="border-2 border-black py-4 cursor-pointer" />
            </div>

            <div className="flex items-center gap-4 bg-cream p-4 rounded-xl border-2 border-black">
              <input 
                type="checkbox" 
                id="active_status" 
                checked={merchData.active_status}
                onChange={(e) => setMerchData(prev => ({ ...prev, active_status: e.target.checked }))}
                className="w-6 h-6 border-2 border-black rounded bg-white checked:bg-salmon transition-colors cursor-pointer" 
              />
              <label htmlFor="active_status" className="font-black uppercase tracking-tighter cursor-pointer">Set as Active & Visible in Store</label>
            </div>

            <div className="pt-6">
              <Button type="submit" disabled={loading} className="w-full bg-salmon text-white border-2 border-black py-8 rounded-2xl text-2xl font-black uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                {loading ? <Loader2 className="animate-spin mr-3" /> : <Save className="mr-3" />}
                {loading ? 'Creating Product...' : 'Create Merchandise'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateMerch;

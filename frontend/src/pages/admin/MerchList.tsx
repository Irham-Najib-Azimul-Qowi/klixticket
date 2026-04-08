import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, MoreVertical, Package, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { adminApi } from '@/services/api';
import type { Merchandise } from '@/types';

const MerchList: React.FC = () => {
  const navigate = useNavigate();
  const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerch();
  }, []);

  const fetchMerch = async () => {
    try {
      const resp = await adminApi.getAllMerchandise();
      setMerchandise(resp.data);
    } catch (error) {
      console.error("Failed to fetch merchandise", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await adminApi.deleteMerchandise(id);
      fetchMerch();
    } catch (error) {
      alert("Failed to delete merchandise");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold tracking-tight text-foreground">Merchandise Inventory</h2>
           <p className="text-muted-foreground text-sm">Manage your product catalog, stock levels, and store status.</p>
        </div>
        <Button onClick={() => navigate('/admin/merch/create')} className="flex items-center gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[300px]">Product Info</TableHead>
              <TableHead>Pricing</TableHead>
              <TableHead>Inventory</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-24 text-muted-foreground animate-pulse">
                   Syncing inventory...
                 </TableCell>
               </TableRow>
            ) : merchandise.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-24 text-muted-foreground">
                   Your inventory is empty.
                 </TableCell>
               </TableRow>
            ) : (
              merchandise.map(item => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden border flex items-center justify-center">
                         {item.image_url ? (
                           <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                         ) : (
                           <Package className="w-5 h-5 text-muted-foreground" />
                         )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-sm truncate">{item.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{item.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.price)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <Box className={`w-4 h-4 ${item.stock < 10 ? 'text-destructive' : 'text-muted-foreground'}`} />
                       <span className={`text-sm font-medium ${item.stock < 10 ? 'text-destructive' : ''}`}>
                         {item.stock} in stock
                       </span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant={item.active_status ? 'default' : 'secondary'} className="px-3">
                       {item.active_status ? 'Active' : 'Inactive'}
                     </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate(`/admin/merch/edit/${item.id}`)} className="flex items-center gap-2 cursor-pointer">
                          <Edit className="w-4 h-4" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4" /> Remove Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default MerchList;

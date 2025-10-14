import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdmin();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
    fetchCategories();
  }, [isAdmin, navigate]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*');
    setCategories(data || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      toast.error('حدث خطأ');
      return;
    }
    toast.success('تم الحذف');
    fetchProducts();
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/admin">
            <Button variant="ghost">
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </Link>
          <img src={logo} alt="Bazzarna" className="h-12" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">إدارة المنتجات</h1>
        </div>

        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold">{product.name_ar}</h3>
                <p className="text-sm text-muted-foreground">{product.price} دج</p>
              </div>
              <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;

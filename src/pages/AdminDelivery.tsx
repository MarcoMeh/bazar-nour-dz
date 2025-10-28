import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Save } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';

const AdminDelivery = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [wilayas, setWilayas] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchWilayas();
  }, [isAdmin, navigate]);

  const fetchWilayas = async () => {
    const { data } = await supabase
      .from('wilayas')
      .select('*')
      .order('code', { ascending: true });
    setWilayas(data || []);
  };

  const handleEdit = (wilaya: any) => {
    setEditingId(wilaya.id);
    setEditPrice(wilaya.delivery_price.toString());
  };

  const handleSave = async (id: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('wilayas')
      .update({ delivery_price: parseFloat(editPrice) })
      .eq('id', id);
    
    setLoading(false);

    if (error) {
      toast.error('حدث خطأ في التحديث');
      return;
    }

    toast.success('تم تحديث رسوم التوصيل');
    setEditingId(null);
    fetchWilayas();
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditPrice('');
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
        <h1 className="text-3xl font-bold mb-8">رسوم التوصيل حسب الولاية</h1>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الرمز</TableHead>
                <TableHead className="text-right">اسم الولاية</TableHead>
                <TableHead className="text-right">رسوم التوصيل (دج)</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wilayas.map((wilaya) => (
                <TableRow key={wilaya.id}>
                  <TableCell className="font-mono">{wilaya.code}</TableCell>
                  <TableCell>{wilaya.name_ar}</TableCell>
                  <TableCell>
                    {editingId === wilaya.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-32"
                      />
                    ) : (
                      <span>{wilaya.delivery_price} دج</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === wilaya.id ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSave(wilaya.id)}
                          disabled={loading}
                        >
                          <Save className="h-4 w-4 ml-1" />
                          حفظ
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          disabled={loading}
                        >
                          إلغاء
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(wilaya)}
                      >
                        تعديل
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  );
};

export default AdminDelivery;

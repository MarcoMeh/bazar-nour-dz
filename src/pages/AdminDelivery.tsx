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
  const [editingField, setEditingField] = useState<'home' | 'desk' | null>(null);
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

  const handleEdit = (wilaya: any, field: 'home' | 'desk') => {
    setEditingId(wilaya.id);
    setEditingField(field);
    const price = field === 'home' ? wilaya.home_delivery_price : wilaya.desk_delivery_price;
    setEditPrice(price.toString());
  };

  const handleSave = async (id: string) => {
    if (!editingField) return;
    
    setLoading(true);
    const updateField = editingField === 'home' ? 'home_delivery_price' : 'desk_delivery_price';
    const { error } = await supabase
      .from('wilayas')
      .update({ [updateField]: parseFloat(editPrice) })
      .eq('id', id);
    
    setLoading(false);

    if (error) {
      toast.error('حدث خطأ في التحديث');
      return;
    }

    toast.success('تم تحديث رسوم التوصيل');
    setEditingId(null);
    setEditingField(null);
    fetchWilayas();
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingField(null);
    setEditPrice('');
  };

  const handleToggleAvailability = async (wilayaId: string, field: 'home' | 'desk', currentValue: boolean) => {
    setLoading(true);
    const updateField = field === 'home' ? 'home_delivery_available' : 'desk_delivery_available';
    const { error } = await supabase
      .from('wilayas')
      .update({ [updateField]: !currentValue })
      .eq('id', wilayaId);
    
    setLoading(false);

    if (error) {
      toast.error('حدث خطأ في التحديث');
      return;
    }

    toast.success('تم تحديث حالة التوصيل');
    fetchWilayas();
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
        <h1 className="text-3xl font-bold mb-8">رسوم التوصيل</h1>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">رسوم التوصيل حسب الولاية</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الرمز</TableHead>
                  <TableHead className="text-right">اسم الولاية</TableHead>
                  <TableHead className="text-right">توصيل للمنزل</TableHead>
                  <TableHead className="text-right">سعر المنزل (دج)</TableHead>
                  <TableHead className="text-right">توصيل للمكتب</TableHead>
                  <TableHead className="text-right">سعر المكتب (دج)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wilayas.map((wilaya) => (
                  <TableRow key={wilaya.id}>
                    <TableCell className="font-mono">{wilaya.code}</TableCell>
                    <TableCell>{wilaya.name_ar}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={wilaya.home_delivery_available ? "default" : "outline"}
                        onClick={() => handleToggleAvailability(wilaya.id, 'home', wilaya.home_delivery_available)}
                        disabled={loading}
                      >
                        {wilaya.home_delivery_available ? 'متاح' : 'غير متاح'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {editingId === wilaya.id && editingField === 'home' ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24"
                          />
                          <Button size="sm" onClick={() => handleSave(wilaya.id)} disabled={loading}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} disabled={loading}>
                            إلغاء
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <span>{wilaya.home_delivery_price} دج</span>
                          {wilaya.home_delivery_available && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(wilaya, 'home')}
                            >
                              تعديل
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={wilaya.desk_delivery_available ? "default" : "outline"}
                        onClick={() => handleToggleAvailability(wilaya.id, 'desk', wilaya.desk_delivery_available)}
                        disabled={loading}
                      >
                        {wilaya.desk_delivery_available ? 'متاح' : 'غير متاح'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {editingId === wilaya.id && editingField === 'desk' ? (
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={editPrice}
                            onChange={(e) => setEditPrice(e.target.value)}
                            className="w-24"
                          />
                          <Button size="sm" onClick={() => handleSave(wilaya.id)} disabled={loading}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel} disabled={loading}>
                            إلغاء
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <span>{wilaya.desk_delivery_price} دج</span>
                          {wilaya.desk_delivery_available && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(wilaya, 'desk')}
                            >
                              تعديل
                            </Button>
                          )}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminDelivery;

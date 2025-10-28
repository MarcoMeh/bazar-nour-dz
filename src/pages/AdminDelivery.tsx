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
  const [deliveryTypes, setDeliveryTypes] = useState({ home: 0, desk: 0 });
  const [editingType, setEditingType] = useState<'home' | 'desk' | null>(null);
  const [typePrice, setTypePrice] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchWilayas();
    fetchDeliveryTypes();
  }, [isAdmin, navigate]);

  const fetchWilayas = async () => {
    const { data } = await supabase
      .from('wilayas')
      .select('*')
      .order('code', { ascending: true });
    setWilayas(data || []);
  };

  const fetchDeliveryTypes = async () => {
    const { data } = await supabase
      .from('delivery_types')
      .select('*');
    
    if (data) {
      const homeDelivery = data.find(d => d.type === 'home');
      const deskDelivery = data.find(d => d.type === 'desk');
      setDeliveryTypes({
        home: homeDelivery?.price || 0,
        desk: deskDelivery?.price || 0
      });
    }
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

  const handleTypeEdit = (type: 'home' | 'desk') => {
    setEditingType(type);
    setTypePrice(deliveryTypes[type].toString());
  };

  const handleTypeSave = async () => {
    if (!editingType) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('delivery_types')
      .upsert({ 
        type: editingType, 
        price: parseFloat(typePrice),
        name_ar: editingType === 'home' ? 'التوصيل للمنزل' : 'التوصيل للمكتب'
      }, { onConflict: 'type' });
    
    setLoading(false);

    if (error) {
      toast.error('حدث خطأ في التحديث');
      return;
    }

    toast.success('تم تحديث رسوم التوصيل');
    setEditingType(null);
    fetchDeliveryTypes();
  };

  const handleTypeCancel = () => {
    setEditingType(null);
    setTypePrice('');
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

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">رسوم التوصيل حسب النوع</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">التوصيل للمنزل</h3>
                {editingType !== 'home' && (
                  <Button size="sm" variant="outline" onClick={() => handleTypeEdit('home')}>
                    تعديل
                  </Button>
                )}
              </div>
              {editingType === 'home' ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={typePrice}
                    onChange={(e) => setTypePrice(e.target.value)}
                    className="w-32"
                  />
                  <Button size="sm" onClick={handleTypeSave} disabled={loading}>
                    حفظ
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleTypeCancel} disabled={loading}>
                    إلغاء
                  </Button>
                </div>
              ) : (
                <p className="text-2xl font-bold">{deliveryTypes.home} دج</p>
              )}
            </Card>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">التوصيل للمكتب</h3>
                {editingType !== 'desk' && (
                  <Button size="sm" variant="outline" onClick={() => handleTypeEdit('desk')}>
                    تعديل
                  </Button>
                )}
              </div>
              {editingType === 'desk' ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={typePrice}
                    onChange={(e) => setTypePrice(e.target.value)}
                    className="w-32"
                  />
                  <Button size="sm" onClick={handleTypeSave} disabled={loading}>
                    حفظ
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleTypeCancel} disabled={loading}>
                    إلغاء
                  </Button>
                </div>
              ) : (
                <p className="text-2xl font-bold">{deliveryTypes.desk} دج</p>
              )}
            </Card>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">رسوم التوصيل حسب الولاية</h2>
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

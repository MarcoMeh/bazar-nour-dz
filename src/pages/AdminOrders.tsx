import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Trash2, Eye } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';

const AdminOrders = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderProducts, setOrderProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchOrders();
  }, [isAdmin, navigate]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    setLoading(false);

    if (error) {
      toast.error('حدث خطأ في تحديث الحالة');
      return;
    }

    toast.success('تم تحديث حالة الطلب');
    fetchOrders();
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    setLoading(false);

    if (error) {
      toast.error('حدث خطأ في حذف الطلب');
      return;
    }

    toast.success('تم حذف الطلب');
    fetchOrders();
  };

  const handleViewOrder = async (order: any) => {
    setSelectedOrder(order);
    
    // جلب تفاصيل المنتجات من قاعدة البيانات
    const productIds = order.items.map((item: any) => item.id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name_ar, supplier_name')
      .in('id', productIds);
    
    // دمج بيانات المنتجات مع الطلب
    const enrichedItems = order.items.map((item: any) => {
      const product = products?.find(p => p.id === item.id);
      return {
        ...item,
        supplier_name: product?.supplier_name || 'غير محدد'
      };
    });
    
    setOrderProducts(enrichedItems);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'قيد الانتظار', variant: 'secondary' },
      processing: { label: 'قيد المعالجة', variant: 'default' },
      shipped: { label: 'تم الشحن', variant: 'outline' },
      delivered: { label: 'تم التوصيل', variant: 'default' },
      cancelled: { label: 'ملغي', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
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
        <h1 className="text-3xl font-bold mb-8">إدارة الطلبات</h1>

        <Card className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الطلب</TableHead>
                <TableHead className="text-right">اسم العميل</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-right">الولاية</TableHead>
                <TableHead className="text-right">السعر الكلي</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.customer_phone}</TableCell>
                  <TableCell>{order.wilaya_code}</TableCell>
                  <TableCell>{order.total_price} دج</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString('ar-DZ')}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewOrder(order)}
                        title="عرض التفاصيل"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">قيد الانتظار</SelectItem>
                          <SelectItem value="processing">قيد المعالجة</SelectItem>
                          <SelectItem value="shipped">تم الشحن</SelectItem>
                          <SelectItem value="delivered">تم التوصيل</SelectItem>
                          <SelectItem value="cancelled">ملغي</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(order.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        {/* نافذة تفاصيل الطلب */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">معلومات العميل</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                      <p><strong>الهاتف:</strong> {selectedOrder.customer_phone}</p>
                      <p><strong>العنوان:</strong> {selectedOrder.customer_address}</p>
                      <p><strong>الولاية:</strong> {selectedOrder.wilaya_code}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">معلومات الطلب</h3>
                    <div className="space-y-1 text-sm">
                      <p><strong>التاريخ:</strong> {new Date(selectedOrder.created_at).toLocaleString('ar-DZ')}</p>
                      <p><strong>نوع التوصيل:</strong> {selectedOrder.delivery_type === 'home' ? 'توصيل للمنزل' : 'توصيل لمكتب'}</p>
                      <p><strong>سعر التوصيل:</strong> {selectedOrder.delivery_price} دج</p>
                      <p><strong>السعر الكلي:</strong> {selectedOrder.total_price} دج</p>
                      <p><strong>الحالة:</strong> {getStatusBadge(selectedOrder.status)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">المنتجات</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المنتج</TableHead>
                        <TableHead className="text-right">الكمية</TableHead>
                        <TableHead className="text-right">السعر</TableHead>
                        <TableHead className="text-right">المجموع</TableHead>
                        <TableHead className="text-right">المورد</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderProducts.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name_ar}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.price} دج</TableCell>
                          <TableCell>{(item.quantity * item.price).toFixed(2)} دج</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.supplier_name}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminOrders;

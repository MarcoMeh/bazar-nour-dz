import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch'; // Import Switch component
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Plus, Trash2, Edit, Upload } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdmin();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price: '',
    category_id: '',
    image_url: '',
    supplier_name: '',
    // New fields
    is_delivery_home_available: true,
    is_delivery_desktop_available: true,
    is_sold_out: false,
    is_free_delivery: false
  });
  const [uploading, setUploading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      name: formData.name,
      name_ar: formData.name_ar,
      description: formData.description,
      description_ar: formData.description_ar,
      price: parseFloat(formData.price),
      category_id: formData.category_id || null,
      image_url: formData.image_url || null,
      supplier_name: formData.supplier_name || null,
      // New fields
      is_delivery_home_available: formData.is_delivery_home_available,
      is_delivery_desktop_available: formData.is_delivery_desktop_available,
      is_sold_out: formData.is_sold_out,
      is_free_delivery: formData.is_free_delivery
    };

    let error;
    if (editingProduct) {
      ({ error } = await supabase.from('products').update(productData).eq('id', editingProduct.id));
    } else {
      ({ error } = await supabase.from('products').insert(productData));
    }

    setLoading(false);

    if (error) {
      toast.error('حدث خطأ');
      return;
    }

    toast.success(editingProduct ? 'تم التحديث' : 'تم الإضافة');
    setIsDialogOpen(false);
    resetForm();
    fetchProducts();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      toast.error('فشل رفع الصورة');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    setFormData({ ...formData, image_url: publicUrl });
    toast.success('تم رفع الصورة');
    setUploading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      price: '',
      category_id: '',
      image_url: '',
      supplier_name: '',
      // Reset new fields
      is_delivery_home_available: true,
      is_delivery_desktop_available: true,
      is_sold_out: false,
      is_free_delivery: false
    });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      name_ar: product.name_ar || '',
      description: product.description || '',
      description_ar: product.description_ar || '',
      price: product.price?.toString() || '',
      category_id: product.category_id || '',
      image_url: product.image_url || '',
      supplier_name: product.supplier_name || '',
      // Load new fields, providing defaults if null/undefined
      is_delivery_home_available: product.is_delivery_home_available ?? true,
      is_delivery_desktop_available: product.is_delivery_desktop_available ?? true,
      is_sold_out: product.is_sold_out ?? false,
      is_free_delivery: product.is_free_delivery ?? false
    });
    setIsDialogOpen(true);
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
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">الاسم بالإنجليزية</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_ar">الاسم بالعربية</Label>
                    <Input
                      id="name_ar"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="description">الوصف بالإنجليزية</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description_ar">الوصف بالعربية</Label>
                    <Textarea
                      id="description_ar"
                      value={formData.description_ar}
                      onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر (دج)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">الفئة</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>

                      <SelectContent>
                        {categories
                          // فقط الفئات الفرعية
                          .filter((cat) => cat.parent_id !== null)
                          // استبعاد الفئات التي أبوها اسمه "محلاتنا"
                          .filter((cat) => {
                            const parent = categories.find((p) => p.id === cat.parent_id);
                            return parent?.name_ar !== "محلاتنا";
                          })
                          .map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name_ar}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="supplier_name">اسم المورد</Label>
                  <Input
                    id="supplier_name"
                    value={formData.supplier_name}
                    onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                    placeholder="اسم المورد (اختياري)"
                  />
                </div>
                <div>
                  <Label>صورة المنتج</Label>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" disabled={uploading} asChild>
                          <span>
                            <Upload className="ml-2 h-4 w-4" />
                            {uploading ? 'جاري الرفع...' : 'رفع صورة'}
                          </span>
                        </Button>
                      </Label>
                      <span className="text-sm text-muted-foreground self-center">أو</span>
                    </div>
                    <div>
                      <Label htmlFor="image_url">رابط الصورة</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                    {formData.image_url && (
                      <div className="mt-2">
                        <img 
                          src={formData.image_url} 
                          alt="معاينة" 
                          className="h-32 w-32 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* New delivery and status options */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="delivery-home"
                      checked={formData.is_delivery_home_available}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          is_delivery_home_available: checked,
                          // If home delivery is off, desktop delivery should be off
                          is_delivery_desktop_available: checked ? prev.is_delivery_desktop_available : false
                        }));
                      }}
                    />
                    <Label htmlFor="delivery-home">التوصيل للمنزل متاح</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="delivery-desktop"
                      checked={formData.is_delivery_desktop_available}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({
                          ...prev,
                          is_delivery_desktop_available: checked
                        }));
                      }}
                      disabled={!formData.is_delivery_home_available} // Disable if home delivery is not available
                    />
                    <Label htmlFor="delivery-desktop">الاستلام من المكتب متاح</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sold-out"
                      checked={formData.is_sold_out}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_sold_out: checked })}
                    />
                    <Label htmlFor="sold-out">المنتج نفد</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="free-delivery"
                      checked={formData.is_free_delivery}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_free_delivery: checked })}
                    />
                    <Label htmlFor="free-delivery">توصيل مجاني</Label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'جاري الحفظ...' : editingProduct ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-bold">{product.name_ar}</h3>
                <p className="text-sm text-muted-foreground">{product.price} دج</p>
                {product.description_ar && (
                  <p className="text-sm text-muted-foreground mt-1">{product.description_ar}</p>
                )}
                <div className="mt-2 text-xs flex flex-wrap gap-2">
                  {product.is_sold_out && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full">نفد</span>}
                  {product.is_free_delivery && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">توصيل مجاني</span>}
                  {product.is_delivery_home_available && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">توصيل للمنزل</span>}
                  {product.is_delivery_desktop_available && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">استلام من المكتب</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => handleEdit(product)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminProducts;
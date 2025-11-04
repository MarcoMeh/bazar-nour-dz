import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowRight, Plus, Trash2, Edit, Upload } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';

const AdminCategories = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const [categories, setCategories] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    slug: '',
    parent_id: 'none',
    image_url: ''
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchCategories();
  }, [isAdmin, navigate]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false });
    setCategories(data || []);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: formData.name,
      name_ar: formData.name_ar,
      slug: formData.slug,
      parent_id: formData.parent_id === 'none' ? null : formData.parent_id || null,
      image_url: formData.image_url || null
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', editingCategory.id);

      if (error) {
        toast.error('حدث خطأ في تحديث التصنيف');
        return;
      }
      toast.success('تم تحديث التصنيف بنجاح');
    } else {
      const { error } = await supabase
        .from('categories')
        .insert(categoryData);

      if (error) {
        toast.error('حدث خطأ في إضافة التصنيف');
        return;
      }
      toast.success('تم إضافة التصنيف بنجاح');
    }

    resetForm();
    setIsDialogOpen(false);
    fetchCategories();
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_ar: category.name_ar,
      slug: category.slug,
      parent_id: category.parent_id || 'none',
      image_url: category.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('حدث خطأ في حذف التصنيف');
      return;
    }

    toast.success('تم حذف التصنيف بنجاح');
    fetchCategories();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      slug: '',
      parent_id: 'none',
      image_url: ''
    });
    setEditingCategory(null);
  };

  const getMainCategories = () => categories.filter(c => !c.parent_id);
  const getSubCategories = (parentId: string) => categories.filter(c => c.parent_id === parentId);
  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name_ar || '';

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
          <h1 className="text-3xl font-bold">إدارة التصنيفات</h1>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة تصنيف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name_ar">الاسم بالعربية</Label>
                  <Input
                    id="name_ar"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    required
                  />
                </div>
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
                  <Label htmlFor="slug">الرابط (Slug)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="parent_id">التصنيف الرئيسي (اختياري)</Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف الرئيسي" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">بدون تصنيف رئيسي</SelectItem>
                      {getMainCategories().map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name_ar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>صورة التصنيف</Label>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                        id="category-image-upload"
                      />
                      <Label htmlFor="category-image-upload" className="cursor-pointer">
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
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">
                    {editingCategory ? 'تحديث' : 'إضافة'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {getMainCategories().map((mainCategory) => (
            <Card key={mainCategory.id} className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold">{mainCategory.name_ar}</h3>
                  <p className="text-sm text-muted-foreground">{mainCategory.name}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(mainCategory)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(mainCategory.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {getSubCategories(mainCategory.id).length > 0 && (
                <div className="mr-6 space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">التصنيفات الفرعية:</p>
                  {getSubCategories(mainCategory.id).map((subCategory) => (
                    <Card key={subCategory.id} className="p-3 bg-muted/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{subCategory.name_ar}</p>
                          <p className="text-xs text-muted-foreground">{subCategory.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(subCategory)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(subCategory.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {categories.filter(c => !c.parent_id).length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              لا توجد تصنيفات. اضغط على "إضافة تصنيف" لإنشاء تصنيف جديد.
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminCategories;

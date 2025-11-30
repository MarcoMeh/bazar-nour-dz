import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Package, ShoppingCart, MapPin, LogOut, FolderTree } from 'lucide-react';
import logo from '@/assets/bazzarna-logo.jpeg';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, logout } = useAdmin();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login');
    }
  }, [isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src={logo} alt="Bazzarna" className="h-12" />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/products">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Package className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">إدارة المنتجات</h2>
              <p className="text-muted-foreground">إضافة وتعديل وحذف المنتجات</p>
            </Card>
          </Link>

          <Link to="/admin/categories">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <FolderTree className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">إدارة التصنيفات</h2>
              <p className="text-muted-foreground">إدارة التصنيفات الرئيسية والفرعية</p>
            </Card>
          </Link>

          <Link to="/admin/orders">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <ShoppingCart className="h-12 w-12 text-accent mb-4" />
              <h2 className="text-xl font-bold mb-2">الطلبات</h2>
              <p className="text-muted-foreground">متابعة وإدارة الطلبات</p>
            </Card>
          </Link>

          <Link to="/admin/delivery">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <MapPin className="h-12 w-12 text-secondary mb-4" />
              <h2 className="text-xl font-bold mb-2">رسوم التوصيل</h2>
              <p className="text-muted-foreground">تعديل أسعار التوصيل حسب الولاية</p>
            </Card>
          </Link>

          <Link to="/admin/adminstoreownerprofile">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <MapPin className="h-12 w-12 text-secondary mb-4" />
              <h2 className="text-xl font-bold mb-2">معلومات المتجر</h2>
              <p className="text-muted-foreground">تعديل وإدارة العلومات المتجر</p>
            </Card>
          </Link>

          <Link to="/admin/storeowners">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <MapPin className="h-12 w-12 text-secondary mb-4" />
              <h2 className="text-xl font-bold mb-2">المستخدمين</h2>
              <p className="text-muted-foreground">تعديل وإدارة المستخدمين</p>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Admin;

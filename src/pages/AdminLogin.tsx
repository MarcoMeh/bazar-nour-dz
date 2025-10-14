import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import logo from '@/assets/bazzarna-logo.jpeg';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAdmin } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await login(email, password);

    if (error) {
      toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      setLoading(false);
      return;
    }

    toast.success('تم تسجيل الدخول بنجاح');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-primary via-primary/95 to-primary/90 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Bazzarna" className="h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">لوحة التحكم</h1>
          <p className="text-muted-foreground mt-2">قم بتسجيل الدخول للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-secondary hover:bg-secondary/90"
            disabled={loading}
          >
            {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => navigate('/')}>
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/contexts/AdminContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/bazzarna-logo.jpeg";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAdmin } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Test Database Connection on Mount
  useEffect(() => {
    const testConnection = async () => {
      console.log("Testing DB connection...");
      const { data, error } = await supabase.from("admins").select("count", { count: 'exact', head: true });
      if (error) {
        console.error("DB Connection Test Failed:", error);
        toast.error("⚠️ خطأ في الاتصال بقاعدة البيانات: " + error.message);
      } else {
        console.log("DB Connection Test Passed. Admins count:", data);
      }
    };
    testConnection();
  }, []);

  // لو هو already logged in → يدخل لصفحة التحكم مباشرة
  useEffect(() => {
    if (isAdmin) navigate("/admin");
  }, [isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let loginEmail = email;
    function isEmail(input: string) {
      return /\S+@\S+\.\S+/.test(input);
    }

    // If the user typed a username (not an email)
    if (!isEmail(email)) {
      // find email by username
      const userRes = await supabase
        .from("store_owners")
        .select("email")
        .eq("username", email)
        .single();

      if (!userRes.data) {
        console.error("Username lookup failed:", userRes.error);
        toast.error("❌ اسم المستخدم غير موجود");
        setLoading(false);
        return;
      }

      loginEmail = userRes.data.email;
    }

    // Now login using EMAIL
    const { error: loginError } = await login(loginEmail, password);

    if (loginError) {
      console.error("Login error:", loginError);
      toast.error("❌ خطأ في تسجيل الدخول: " + loginError.message);
      setLoading(false);
      return;
    }

    // Get auth user
    const { data } = await (supabase.auth.getUser() as any);
    const authUser = data?.user;

    if (!authUser) {
      toast.error("فشل الحصول على بيانات المستخدم");
      setLoading(false);
      return;
    }

    // Check Admin
    const adminRes = await supabase
      .from("admins")
      .select("id")
      .eq("auth_user_id", authUser.id)
      .single();

    const isAdminUser = adminRes.data && !adminRes.error;

    // Check Store Owner
    const ownerRes = await supabase
      .from("store_owners")
      .select("id, username")
      .eq("user_id", authUser.id)
      .single();

    const isStoreOwner = ownerRes.data && !ownerRes.error;

    if (!isAdminUser && !isStoreOwner) {
      toast.error("❌ لا تملك صلاحية الدخول للوحة التحكم");
      setLoading(false);
      return;
    }

    toast.success("✔️ تم تسجيل الدخول بنجاح");
    navigate("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-primary via-primary/95 to-primary/90 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <img src={logo} alt="Bazzarna" className="h-20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">تسجيل دخول صاحب المتجر</h1>
          <p className="text-muted-foreground mt-2">
            قم بإدخال بيانات تسجيل الدخول الخاصة بصاحب المتجر
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني أو اسم المستخدم</Label>
            <Input
              id="email"
              type="text"
              placeholder="user@example.com OR username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input
              id="password"
              type="password"
              placeholder="•••••••••"
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
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="link" onClick={() => navigate("/")}>
            العودة للصفحة الرئيسية
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;

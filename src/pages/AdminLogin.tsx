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
  const [errorDetails, setErrorDetails] = useState<any>(null);

  // Test Database Connection on Mount
  useEffect(() => {
    const testConnection = async () => {
      console.log("Testing DB connection...");
      // Check profiles instead of admins since admins table doesn't exist
      const { data, error } = await supabase.from("profiles").select("count", { count: 'exact', head: true });
      if (error) {
        console.error("DB Connection Test Failed:", error);
        toast.error("⚠️ خطأ في الاتصال بقاعدة البيانات: " + error.message);
      } else {
        console.log("DB Connection Test Passed. Profiles count:", data);
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
    console.log("Attempting login with:", email);

    let loginEmail = email;
    function isEmail(input: string) {
      return /\S+@\S+\.\S+/.test(input);
    }

    // If the user typed a username (not an email)
    if (!isEmail(email)) {
      // Username login is not supported in the current schema (profiles table only has email)
      // We could check if we want to support it, but for now let's enforce email or warn.
      // The previous code checked store_owners.username.
      // Since we are migrating to profiles, and profiles doesn't have username, we should probably just tell them to use email.
      toast.error("يرجى استخدام البريد الإلكتروني لتسجيل الدخول");
      setLoading(false);
      return;
    }

    // Now login using EMAIL
    console.log("Calling supabase.auth.signInWithPassword with:", loginEmail);
    const { error: loginError } = await login(loginEmail, password);

    if (loginError) {
      console.error("Login error details:", loginError);
      setErrorDetails(loginError); // Show on UI
      if (loginError.message.includes("Database error querying schema")) {
        toast.error("❌ خطأ في قاعدة البيانات. يرجى تشغيل سكربت الإصلاح (master_rebuild_database.sql) في Supabase.");
      } else {
        toast.error("❌ خطأ في تسجيل الدخول: " + loginError.message);
      }
      setLoading(false);
      return;
    }

    console.log("Login successful, checking roles...");

    // Get auth user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const authUser = authData?.user;

    if (authError || !authUser) {
      console.error("Auth user retrieval failed:", authError);
      toast.error("فشل الحصول على بيانات المستخدم");
      setLoading(false);
      return;
    }

    console.log("Auth user ID:", authUser.id);

    // Check Profile Role
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) console.error("Error checking profile role:", profileError);

    const role = profileData?.role;
    console.log("User Role:", role);

    const isAdminUser = role === 'admin';
    const isStoreOwner = role === 'store_owner';

    if (!isAdminUser && !isStoreOwner) {
      console.warn("User is neither Admin nor Store Owner");
      toast.error("❌ لا تملك صلاحية الدخول للوحة التحكم");
      await supabase.auth.signOut(); // Sign out if not authorized
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

          {errorDetails && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-left dir-ltr">
              <p className="text-red-600 font-bold text-sm mb-2">Error Details (Please share this):</p>
              <pre className="text-xs text-red-800 overflow-auto whitespace-pre-wrap font-mono">
                {JSON.stringify(errorDetails, null, 2)}
              </pre>
            </div>
          )}
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

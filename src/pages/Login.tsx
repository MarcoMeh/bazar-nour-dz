import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Get user profile to check role
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();

            if (profileError) {
                console.error("Error fetching profile:", profileError);
            }

            console.log("User role:", profile?.role);

            toast({
                title: "تم تسجيل الدخول بنجاح",
                description: "مرحباً بك في بازارنا",
            });

            // Redirect based on role
            if (profile?.role === "admin" || profile?.role === "store_owner") {
                navigate("/admin");
            } else {
                console.log("Redirecting to home. Profile:", profile);
                navigate("/");
                toast({
                    title: "تم التوجيه للرئيسية",
                    description: `الدور الحالي: ${profile?.role || 'غير موجود'} (خطأ: ${profileError?.message || 'لا يوجد'})`,
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Login error:", error);
            toast({
                title: "خطأ في تسجيل الدخول",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
                    <CardDescription className="text-center">
                        أدخل بياناتك للدخول إلى حسابك
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                dir="ltr"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                dir="ltr"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ShoppingBag, Loader2 } from "lucide-react";

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

            toast({
                title: "تم تسجيل الدخول بنجاح",
                description: "مرحباً بك في بازارنا",
            });

            // Redirect based on role
            if (profile?.role === "admin" || profile?.role === "store_owner") {
                navigate("/admin");
            } else {
                navigate("/");
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
        <div className="min-h-screen w-full flex">
            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                <div className="w-full max-w-md space-y-8 animate-fadeIn">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">مرحباً بعودتك</h1>
                        <p className="text-muted-foreground">أدخل بياناتك للدخول إلى حسابك</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    dir="ltr"
                                    className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">كلمة المرور</Label>
                                    <Button variant="link" className="px-0 font-normal text-xs text-muted-foreground" type="button">
                                        نسيت كلمة المرور؟
                                    </Button>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    dir="ltr"
                                    className="h-12 bg-muted/50 border-muted-foreground/20 focus:border-primary transition-colors"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    جاري الدخول...
                                </>
                            ) : (
                                <>
                                    تسجيل الدخول
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        ليس لديك حساب؟{" "}
                        <Button variant="link" className="px-0 font-semibold text-primary hover:text-primary/80" onClick={() => navigate("/register")}>
                            إنشاء حساب جديد
                        </Button>
                    </div>
                </div>
            </div>

            {/* Left Side - Image/Branding (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 bg-muted relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-secondary/90 z-10 mix-blend-multiply" />
                <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                    alt="Login Background"
                    className="absolute inset-0 w-full h-full object-cover animate-scale-slow"
                />
                <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6" />
                        <span className="text-xl font-bold">بازارنا</span>
                    </div>
                    <div className="space-y-4 max-w-lg">
                        <h2 className="text-4xl font-bold leading-tight">
                            تجربة تسوق فريدة <br /> تبدأ من هنا
                        </h2>
                        <p className="text-lg opacity-90">
                            انضم إلى آلاف المتسوقين واستمتع بأفضل المنتجات والأسعار في الجزائر.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="h-1 w-8 bg-white rounded-full" />
                        <div className="h-1 w-2 bg-white/50 rounded-full" />
                        <div className="h-1 w-2 bg-white/50 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

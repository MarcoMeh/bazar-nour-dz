import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Store, User, Phone, Mail, MapPin, FileText, Loader2, ArrowRight } from 'lucide-react';
import SEO from '@/components/SEO';
import { PageBackground } from "@/type_defs";
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Check, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

// الولايات الجزائرية
const WILAYAS = [
    'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
    'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
    'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
    'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
    'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي',
    'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت',
    'غرداية', 'غليزان', 'تيميمون', 'برج باجي مختار', 'أولاد جلال', 'بني عباس',
    'عين صالح', 'عين قزام', 'تقرت', 'جانت', 'المغير', 'المنيعة'
];

const SellerRegister = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        owner_name: '',
        store_name: '',
        phone: '',
        email: '',
        wilaya: '',
        description: '',
        selected_plan: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleWilayaChange = (value: string) => {
        setFormData({
            ...formData,
            wilaya: value,
        });
    };

    const handlePlanChange = (value: string) => {
        setFormData({
            ...formData,
            selected_plan: value,
        });
    };

    const [registerBackground, setRegisterBackground] = useState<string | null>(null);
    const { data: settings } = useSiteSettings();

    useEffect(() => {
        const fetchBackground = async () => {
            const { data } = await supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from("page_backgrounds" as any)
                .select("image_url")
                .eq("page_key", "register_hero")
                .single();

            if ((data as unknown as PageBackground)?.image_url) {
                setRegisterBackground((data as unknown as PageBackground).image_url!);
            }
        };
        fetchBackground();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.owner_name || !formData.store_name || !formData.phone || !formData.email || !formData.wilaya || !formData.selected_plan) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة واختيار اشتراك');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('الرجاء إدخال بريد إلكتروني صحيح');
            return;
        }

        // Phone validation (Algerian format)
        const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error('الرجاء إدخال رقم هاتف جزائري صحيح (مثال: 0555123456)');
            return;
        }

        setLoading(true);

        try {
            // Insert into store_registration_requests table
            const { error } = await supabase
                .from('store_registration_requests' as any)
                .insert([
                    {
                        owner_name: formData.owner_name,
                        store_name: formData.store_name,
                        phone: formData.phone,
                        email: formData.email,
                        wilaya: formData.wilaya,
                        description: formData.description || null,
                        selected_plan: formData.selected_plan,
                        status: 'pending',
                    },
                ]);

            if (error) throw error;

            toast.success('تم إرسال طلبك بنجاح! سنتواصل معك قريباً.');

            // Reset form
            setFormData({
                owner_name: '',
                store_name: '',
                phone: '',
                email: '',
                wilaya: '',
                description: '',
                selected_plan: '',
            });

            // Navigate to home after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch (error: any) {
            console.error('Error submitting registration:', error);
            toast.error('حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = registerBackground ? {
        backgroundImage: `url(${registerBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
    } : {};

    return (
        <div className={`min-h-screen pt-24 pb-12 ${!registerBackground ? 'bg-gradient-to-br from-green-50 via-white to-blue-50' : 'relative'}`} style={containerStyle}>
            {registerBackground && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] z-0"></div>
            )}
            <div className="relative z-10">
                <SEO
                    title="سجل محلك - انضم إلينا"
                    description="سجل محلك في بازارنا وابدأ البيع عبر الإنترنت اليوم"
                />

                <div className="container mx-auto px-4 max-w-3xl">
                    {/* Back to Home */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mb-8"
                    >
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors font-bold group"
                        >
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            الرجوع للرئيسية
                        </Link>
                    </motion.div>

                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 mb-4">
                            <Store className="h-10 w-10 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            افتح متجرك معنا
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            انضم إلى منصة بازارنا واعرض منتجاتك لآلاف العملاء في جميع أنحاء الجزائر
                        </p>
                    </div>

                    {/* Form Card */}
                    <Card className="p-8 md:p-10 shadow-xl border-2 border-green-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Owner Name */}
                            <div>
                                <Label htmlFor="owner_name" className="text-lg flex items-center gap-2 mb-2">
                                    <User className="h-5 w-5 text-green-600" />
                                    اسمك الكامل <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="owner_name"
                                    name="owner_name"
                                    type="text"
                                    value={formData.owner_name}
                                    onChange={handleChange}
                                    placeholder="مثال: أحمد بن علي"
                                    className="h-12 text-lg"
                                    required
                                />
                            </div>

                            {/* Store Name */}
                            <div>
                                <Label htmlFor="store_name" className="text-lg flex items-center gap-2 mb-2">
                                    <Store className="h-5 w-5 text-green-600" />
                                    اسم المحل <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="store_name"
                                    name="store_name"
                                    type="text"
                                    value={formData.store_name}
                                    onChange={handleChange}
                                    placeholder="مثال: محل الأناقة للألبسة"
                                    className="h-12 text-lg"
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <Label htmlFor="phone" className="text-lg flex items-center gap-2 mb-2">
                                    <Phone className="h-5 w-5 text-green-600" />
                                    رقم الهاتف <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="مثال: 0555123456"
                                    className="h-12 text-lg"
                                    dir="ltr"
                                    required
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    يرجى استخدام رقم جزائري صالح (05، 06، أو 07)
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <Label htmlFor="email" className="text-lg flex items-center gap-2 mb-2">
                                    <Mail className="h-5 w-5 text-green-600" />
                                    البريد الإلكتروني <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="example@email.com"
                                    className="h-12 text-lg"
                                    dir="ltr"
                                    required
                                />
                            </div>

                            {/* Wilaya */}
                            <div>
                                <Label htmlFor="wilaya" className="text-lg flex items-center gap-2 mb-2">
                                    <MapPin className="h-5 w-5 text-green-600" />
                                    الولاية <span className="text-red-500">*</span>
                                </Label>
                                <Select value={formData.wilaya} onValueChange={handleWilayaChange}>
                                    <SelectTrigger className="h-12 text-lg">
                                        <SelectValue placeholder="اختر الولاية" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WILAYAS.map((wilaya) => (
                                            <SelectItem key={wilaya} value={wilaya}>
                                                {wilaya}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description (Optional) */}
                            <div>
                                <Label htmlFor="description" className="text-lg flex items-center gap-2 mb-2">
                                    <FileText className="h-5 w-5 text-green-600" />
                                    نبذة عن المحل (اختياري)
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="اكتب وصفاً مختصراً عن محلك ونوع المنتجات التي تبيعها..."
                                    className="min-h-[120px] text-lg resize-none"
                                    rows={4}
                                />
                            </div>

                            {/* Subscription Plans */}
                            <div className="space-y-4 pt-2">
                                <Label className="text-lg flex items-center gap-2 mb-2">
                                    <Zap className="h-5 w-5 text-green-600" />
                                    اختر نوع الاشتراك <span className="text-red-500">*</span>
                                </Label>
                                <div className="grid grid-cols-1 gap-4">
                                    {[
                                        { id: '1_month', label: '1 شهر', price: '2,000 دج', discount: null },
                                        { id: '3_months', label: '3 أشهر', price: '5,400 دج', original: '6,000 دج', discount: 'تخفيض 10%' },
                                        { id: '12_months', label: '12 شهر (سنة)', price: '19,200 دج', original: '24,000 دج', discount: 'تخفيض 20%' },
                                    ].map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => handlePlanChange(plan.id)}
                                            className={`relative p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition-all ${formData.selected_plan === plan.id
                                                ? 'border-green-600 bg-green-50 shadow-md'
                                                : 'border-slate-100 hover:border-green-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.selected_plan === plan.id ? 'border-green-600 bg-green-600' : 'border-slate-300'
                                                        }`}>
                                                        {formData.selected_plan === plan.id && <Check className="h-4 w-4 text-white" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg">{plan.label}</p>
                                                        {plan.discount && (
                                                            <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded-full font-bold">
                                                                {plan.discount}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-left">
                                                    {plan.original && (
                                                        <p className="text-xs text-slate-400 line-through">{plan.original}</p>
                                                    )}
                                                    <p className="font-black text-xl text-green-700">{plan.price}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Box */}
                            {(settings?.whatsapp_number || settings?.email) && (
                                <Card className="p-4 bg-green-50/50 border-green-100 border-dashed">
                                    <p className="text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        للمساعدة والتواصل المباشر:
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-xs">
                                        {settings?.whatsapp_number && (
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <span className="font-bold">واتساب:</span>
                                                <span dir="ltr">{settings.whatsapp_number}</span>
                                            </div>
                                        )}
                                        {settings?.email && (
                                            <div className="flex items-center gap-1 text-slate-600">
                                                <span className="font-bold">إيميل:</span>
                                                <span>{settings.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {/* Info Box */}
                            <Card className="p-4 bg-blue-50 border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <strong>ملاحظة:</strong> بعد إرسال الطلب واختيار الباقة، سيقوم فريقنا بمراجعة معلوماتك
                                    والتواصل معك خلال 24-48 ساعة لتفعيل حسابك .
                                </p>
                            </Card>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg hover:shadow-xl transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    <>
                                        <Store className="ml-2 h-5 w-5" />
                                        إرسال الطلب
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>

                    {/* Benefits Section */}
                    <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-3">🚀</div>
                            <h3 className="font-bold text-lg mb-2">ابدأ بسرعة</h3>
                            <p className="text-sm text-muted-foreground">
                                سجل محلك اليوم وابدأ البيع خلال أيام
                            </p>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-3">💰</div>
                            <h3 className="font-bold text-lg mb-2">بدون عمولات</h3>
                            <p className="text-sm text-muted-foreground">
                                اشتراك شهري بسيط بدون عمولات على المبيعات
                            </p>
                        </Card>

                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-3">📈</div>
                            <h3 className="font-bold text-lg mb-2">وصول أوسع</h3>
                            <p className="text-sm text-muted-foreground">
                                اعرض منتجاتك لآلاف العملاء في كل الجزائر
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerRegister;

import SEO from "@/components/SEO";
import { ArrowLeft, Shield, Lock, Eye, Database, Globe, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 font-cairo text-right" dir="rtl">
            <SEO
                title="سياسة الخصوصية | بازارنا"
                description="صفحة سياسة الخصوصية لمنصة بازارنا. تعرف على كيفية جمعنا واستخدامنا لبياناتك الشخصية."
            />

            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
                        <Shield className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading leading-tight">سياسة الخصوصية</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        نحن في بازارنا نلتزم بحماية خصوصيتك وضمان أمان بياناتك الشخصية. توضح هذه الوثيقة كيفية تعاملنا مع معلوماتك.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <div className="max-w-none font-sans">

                        {/* 1. المعلومات التي نجمعها */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <Eye className="w-6 h-6 text-indigo-600" />
                                1. المعلومات التي نجمعها
                            </h2>
                            <p className="text-slate-600 mb-4">
                                نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند استخدامك للموقع، وتشمل:
                            </p>
                            <ul className="list-disc pr-6 space-y-2 text-slate-600 marker:text-indigo-400">
                                <li>المعلومات الشخصية: الاسم، عنوان البريد الإلكتروني، رقم الهاتف، والعنوان.</li>
                                <li>معلومات الدفع: تفاصيل البطاقة الائتمانية أو الحساب البنكي (يتم معالجتها بأمان تام عبر بوابات دفع طرف ثالث).</li>
                                <li>معلومات الجهاز: نوع الجهاز، عنوان IP، ونظام التشغيل لتحسين تجربة المستخدم.</li>
                            </ul>
                        </div>

                        {/* 2. كيفية استخدام المعلومات */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <Database className="w-6 h-6 text-indigo-600" />
                                2. كيفية استخدام المعلومات
                            </h2>
                            <ul className="list-disc pr-6 space-y-2 text-slate-600 marker:text-indigo-400">
                                <li>معالجة الطلبات وإيصال المنتجات إليك.</li>
                                <li>تحسين خدماتنا وتجربة المستخدم على الموقع.</li>
                                <li>إرسال تحديثات حول الطلبات والعروض الترويجية (يمكنك إلغاء الاشتراك في أي وقت).</li>
                                <li>منع الاحتيال وضمان أمان المنصة.</li>
                            </ul>
                        </div>

                        {/* 3. حماية البيانات */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <Lock className="w-6 h-6 text-indigo-600" />
                                3. حماية البيانات
                            </h2>
                            <p className="text-slate-600">
                                نحن نتخذ تدابير أمنية تقنية وتنظيمية مناسبة لحماية معلوماتك الشخصية من الدخول غير المصرح به أو التغيير أو الإفشاء أو الإتلاف. نستخدم تقنيات التشفير (SSL) لحماية بياناتك الحساسة أثناء النقل.
                            </p>
                        </div>

                        {/* 4. مشاركة المعلومات */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <Globe className="w-6 h-6 text-indigo-600" />
                                4. مشاركة المعلومات
                            </h2>
                            <p className="text-slate-600 mb-4">
                                نحن لا نبيع بياناتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:
                            </p>
                            <ul className="list-disc pr-6 space-y-2 text-slate-600 marker:text-indigo-400">
                                <li>مع مقدمي الخدمات (مثل شركات التوصيل) لإتمام طلبك.</li>
                                <li>للامتثال للقوانين واللوائح المعمول بها في الجزائر.</li>
                                <li>مع شركاؤنا في المتجر (البائعين) فقط بالقدر اللازم لإتمام طلبك.</li>
                            </ul>
                        </div>

                        {/* 5. اتصل بنا */}
                        <div>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <Mail className="w-6 h-6 text-indigo-600" />
                                5. اتصل بنا
                            </h2>
                            <p className="text-slate-600">
                                إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر البريد الإلكتروني: <a href="mailto:support@bazzarna.store" className="text-indigo-600 hover:text-indigo-700 font-medium">support@bazzarna.store</a>
                            </p>
                        </div>

                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                        <Link to="/">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="w-4 h-4 ml-2" />
                                العودة إلى الرئيسية
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
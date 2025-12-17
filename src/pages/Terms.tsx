import SEO from "@/components/SEO";
import { ArrowLeft, FileText, Scale, AlertCircle, ShoppingBag, ShieldCheck, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Terms() {
    return (
        <div className="min-h-screen bg-slate-50 font-cairo text-right" dir="rtl">
            <SEO
                title="الشروط والأحكام | بازارنا"
                description="الشروط والأحكام الخاصة باستخدام منصة بازارنا. تعرف على حقوقك والتزاماتك عند استخدام الموقع."
            />

            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                {/* استبدال Container بـ div عادي */}
                <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
                        <Scale className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading leading-tight">الشروط والأحكام</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        يرجى قراءة هذه الشروط بعناية قبل استخدام منصة بازارنا. استخدامك للموقع يعني موافقتك على قواعد التعامل بين المنصة، التاجر، والمشتري.
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <div className="max-w-none font-sans">

                        {/* 1. مقدمة */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <FileText className="w-6 h-6 text-indigo-600" />
                                1. تعريف المنصة
                            </h2>
                            <p className="text-slate-600">
                                منصة "بازارنا" هي وسيط تقني يتيح للتجار عرض منتجاتهم وإنشاء متاجرهم الخاصة. بإنشاء حساب أو استخدام الموقع، فإنك توافق على أن "بازارنا" ليست البائع للمنتجات المعروضة، وأن عمليات البيع والشراء تتم مباشرة بين التاجر والمشتري.
                            </p>
                        </div>

                        {/* 2. الحسابات والتسجيل */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                                2. الحسابات والتسجيل
                            </h2>
                            <ul className="list-disc pr-6 space-y-2 text-slate-600 marker:text-indigo-400">
                                <li>يجب تقديم معلومات دقيقة وكاملة عند التسجيل.</li>
                                <li>أنت مسؤول مسؤولية كاملة عن الحفاظ على سرية بيانات دخولك.</li>
                                <li>يحق لإدارة المنصة تجميد أو حذف أي حساب يخالف شروط الاستخدام أو يقوم بنشاط احتيالي.</li>
                            </ul>
                        </div>

                        {/* 3. الطلبات والإرجاع (تم التصحيح هنا) */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <ShoppingBag className="w-6 h-6 text-indigo-600" />
                                3. الطلبات، الشحن والإرجاع
                            </h2>
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-amber-900 text-sm">
                                <strong>تنويه هام:</strong> المسؤولية عن المنتجات، الشحن، والإرجاع تقع على عاتق <strong>التاجر (صاحب المتجر)</strong>.
                            </div>
                            <ul className="list-disc pr-6 space-y-3 text-slate-600 marker:text-indigo-400">
                                <li>
                                    <strong>توفر المنتجات:</strong> جميع الطلبات خاضعة لتوفر المخزون لدى التاجر.
                                </li>
                                <li>
                                    <strong>الشحن:</strong> عملية توصيل الطلبات هي مسؤولية التاجر بالتعاون مع شركات التوصيل التي يختارها. "بازارنا" لا تقوم بنقل البضائع.
                                </li>
                                <li>
                                    <strong>الإرجاع:</strong> يحق للمشتري طلب إرجاع المنتج في حال وجود عيب أو عدم مطابقة، وذلك بالتواصل المباشر مع التاجر وفق سياسته الخاصة (عادة خلال 3 أيام).
                                </li>
                                <li>
                                    <strong>دور المنصة:</strong> نحن نضمن وصول طلبك تقنياً إلى التاجر، ولا نضمن عمليات التوصيل الفيزيائية.
                                </li>
                            </ul>
                        </div>

                        {/* 4. الملكية الفكرية */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <AlertCircle className="w-6 h-6 text-indigo-600" />
                                4. الملكية الفكرية
                            </h2>
                            <p className="text-slate-600">
                                جميع حقوق البرمجيات والتصاميم الخاصة بالمنصة محفوظة لـ "بازارنا". أما صور المنتجات والمعلومات التجارية فهي مملوكة للتجار، ويتحمل التاجر المسؤولية القانونية عن محتوى متجره.
                            </p>
                        </div>

                        {/* 5. إخلاء المسؤولية */}
                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <Scale className="w-6 h-6 text-indigo-600" />
                                5. حدود المسؤولية (إخلاء المسؤولية)
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                تعمل منصة بازارنا كـ <strong>وسيط تقني فقط</strong>. نحن لا نضمن دقة المعلومات الواردة في متاجر البائعين، ولا نتحمل أي مسؤولية قانونية أو مالية عن جودة المنتجات، تأخر التوصيل، أو أي أضرار تنشأ عن التعامل مع التجار. مسؤوليتنا تنحصر في توفير الأدوات التقنية لعمل المنصة.
                            </p>
                        </div>

                        {/* الاتصال */}
                        <div>
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <Mail className="w-6 h-6 text-indigo-600" />
                                الدعم والاستفسارات
                            </h2>
                            <p className="text-slate-600">
                                إذا واجهت مشكلة تقنية أو كان لديك استفسار حول هذه الشروط، يرجى التواصل معنا عبر البريد الإلكتروني: <a href="mailto:support@bazzarna.store" className="text-indigo-600 hover:text-indigo-700 font-medium">support@bazzarna.store</a>
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
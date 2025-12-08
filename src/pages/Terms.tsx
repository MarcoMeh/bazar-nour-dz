import { Container } from "@/components/ui/container";
import SEO from "@/components/SEO";
import { ArrowLeft, FileText, Scale, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Terms() {
    return (
        <div className="min-h-screen bg-slate-50">
            <SEO
                title="الشروط والأحكام | بازارنا"
                description="الشروط والأحكام الخاصة باستخدام منصة بازارنا. تعرف على حقوقك والتزاماتك عند استخدام الموقع."
            />

            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <Container className="relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
                        <Scale className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 font-heading leading-tight">الشروط والأحكام</h1>
                    <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                        يرجى قراءة هذه الشروط بعناية قبل استخدام منصة بازارنا. استخدامك للموقع يعني موافقتك على هذه البنود.
                    </p>
                </Container>
            </div>

            {/* Content Section */}
            <Container className="py-16">
                <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12">
                    <div className="max-w-none font-sans">

                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <FileText className="w-6 h-6 text-indigo-600" />
                                1. مقدمة
                            </h2>
                            <p className="text-slate-600">
                                مرحبًا بكم في بازارنا. تحكم هذه الشروط والأحكام استخدامك لموقعنا والخدمات المتاحة عليه. بإنشاء حساب أو شراء منتجات، فإنك توافق على الالتزام بهذه الشروط. يحق لنا تعديل هذه الشروط في أي وقت، ويكون التعديل ساريًا فور نشره على الموقع.
                            </p>
                        </div>

                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                                2. الحسابات والتسجيل
                            </h2>
                            <ul className="list-disc pr-6 space-y-2 text-slate-600 marker:text-indigo-400">
                                <li>يجب أن تكون المعلومات التي تقدمها عند التسجيل دقيقة وكاملة.</li>
                                <li>أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك.</li>
                                <li>نحتفظ بالحق في إغلاق الحسابات التي تنتهك سياساتنا أو تقوم بنشاط مشبوه.</li>
                            </ul>
                        </div>

                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <RefreshCw className="w-6 h-6 text-indigo-600" />
                                3. الطلبات والإرجاع
                            </h2>
                            <ul className="list-disc pr-6 space-y-2 text-slate-600 marker:text-indigo-400">
                                <li>جميع الطلبات خاضعة لتوفر المنتج وتأكيد السعر.</li>
                                <li>يحق لك طلب إرجاع المنتج في غضون 3 أيام من الاستلام إذا كان المنتج معيبًا أو غير مطابق للوصف.</li>
                                <li>يجب أن يكون المنتج في عبوته الأصلية وغير مستخدم لقبول طلب الإرجاع.</li>
                                <li>نحن نضمن توصيل المنتجات إلى 58 ولاية، وتختلف رسوم التوصيل حسب المنطقة.</li>
                            </ul>
                        </div>

                        <div className="mb-12 border-b border-slate-100 pb-8">
                            <h2 className="flex items-center gap-3 text-2xl font-bold text-slate-800 mb-6">
                                <AlertCircle className="w-6 h-6 text-indigo-600" />
                                4. الملكية الفكرية
                            </h2>
                            <p className="text-slate-600">
                                جميع المحتويات الموجودة على الموقع، بما في ذلك النصوص، الرسومات، الشعارات، الصور، والبرمجيات، هي ملك لبازارنا أو مرخصيها ومحمية بموجب قوانين حقوق النشر والعلامات التجارية. لا يجوز نسخ أو استخدام أي جزء من المحتوى بدون إذن كتابي مسبق.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-6">
                                5. إخلاء المسؤولية
                            </h2>
                            <p className="text-slate-600">
                                نسعى لضمان دقة المعلومات على الموقع، لكننا لا نضمن خلوه من الأخطاء. لا نتحمل المسؤولية عن أي أضرار مباشرة أو غير مباشرة تنشأ عن استخدامك للموقع أو عدم قدرتك على استخدامه.
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
            </Container>
        </div>
    );
}

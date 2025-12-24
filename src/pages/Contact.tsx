import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import SEO from '@/components/SEO';

export default function Contact() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // For now, just a dummy submit or mailto
        window.location.href = "mailto:contact@bazzarna.com";
    };

    return (
        <div className="min-h-screen bg-slate-50 font-cairo" dir="rtl">
            <SEO title="اتصل بنا - بازارنا" description="تواصل مع فريق بازارنا للاستفسارات والدعم." />

            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">اتصل بنا</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        فريقنا جاهز للإجابة على جميع استفساراتك. لا تتردد في التواصل معنا في أي وقت.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-2xl font-bold mb-6">معلومات التواصل</h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">الهاتف</h3>
                                        <p className="text-slate-500" dir="ltr">+213 555 123 456</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">البريد الإلكتروني</h3>
                                        <p className="text-slate-500">contact@bazzarna.com</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">العنوان</h3>
                                        <p className="text-slate-500">الجزائر العاصمة، الجزائر</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-4">تابعنا على</h3>
                                <div className="flex gap-4">
                                    {/* Social icons placeholders */}
                                    <Button variant="outline" size="icon" className="rounded-full">F</Button>
                                    <Button variant="outline" size="icon" className="rounded-full">I</Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">الاسم</label>
                                    <Input placeholder="اسمك الكريم" className="bg-slate-50 border-slate-200" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">رقم الهاتف</label>
                                    <Input placeholder="055..." className="bg-slate-50 border-slate-200 text-right" dir="ltr" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">الموضوع</label>
                                <Input placeholder="كيف يمكننا مساعدتك؟" className="bg-slate-50 border-slate-200" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">الرسالة</label>
                                <Textarea placeholder="اكتب رسالتك هنا..." className="min-h-[150px] bg-slate-50 border-slate-200" />
                            </div>

                            <Button type="submit" size="lg" className="w-full font-bold text-lg h-14 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                إرسال <Send className="mr-2 h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

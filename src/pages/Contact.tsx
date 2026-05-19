import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send, MessageCircle, Facebook, Instagram } from 'lucide-react';
import SEO from '@/components/SEO';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Contact() {
    const { data: settings } = useSiteSettings();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const emailTo = settings?.email || "contact@bazzarna.com";
        const emailBody = `الاسم: ${name}%0D%0Aالهاتف: ${phone}%0D%0A%0D%0Aالرسالة:%0D%0A${message}`;
        window.location.href = `mailto:${emailTo}?subject=${encodeURIComponent(subject || "اتصال من الموقع")}&body=${emailBody}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 font-cairo" dir="rtl">
            <SEO title="اتصل بنا - بازارنا" description="تواصل مع فريق بازارنا للاستفسارات والدعم." />

            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">اتصل بنا / الدعم الفني</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
                        فريقنا جاهز للإجابة على جميع استفساراتك. لا تتردد في التواصل معنا في أي وقت.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                            <h2 className="text-2xl font-bold mb-4">معلومات التواصل</h2>
                            <div className="space-y-6">
                                {/* Phone Card */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">رقم الهاتف</h3>
                                        <p className="text-slate-500 text-sm sm:text-base" dir="ltr">
                                            {settings?.phone_number || "+213 555 123 456"}
                                        </p>
                                    </div>
                                </div>

                                {/* WhatsApp Card if available */}
                                {settings?.whatsapp_number && (
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-green-600 shrink-0">
                                            <MessageCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">رقم الواتساب</h3>
                                            <p className="text-slate-500 text-sm sm:text-base" dir="ltr">
                                                {settings.whatsapp_number}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Email Card */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">البريد الإلكتروني</h3>
                                        <p className="text-slate-500 text-sm sm:text-base break-all">
                                            {settings?.email || "contact@bazzarna.com"}
                                        </p>
                                    </div>
                                </div>

                                {/* Address Card */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">العنوان</h3>
                                        <p className="text-slate-500 text-sm sm:text-base">
                                            {settings?.address || "الجزائر العاصمة، الجزائر"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Social Media Links */}
                            {(settings?.facebook_url || settings?.instagram_url) && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h3 className="font-bold text-slate-900 mb-4 text-sm sm:text-base">تابعنا على</h3>
                                    <div className="flex gap-4">
                                        {settings?.facebook_url && (
                                            <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="icon" className="rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                                    <Facebook className="h-5 w-5" />
                                                </Button>
                                            </a>
                                        )}
                                        {settings?.instagram_url && (
                                            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="icon" className="rounded-full hover:bg-pink-50 hover:text-pink-600 transition-colors">
                                                    <Instagram className="h-5 w-5" />
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                        <h2 className="text-2xl font-bold mb-6">أرسل لنا رسالة</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm font-bold text-slate-700">الاسم</label>
                                    <Input 
                                        placeholder="اسمك الكريم" 
                                        className="bg-slate-50 border-slate-200" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs sm:text-sm font-bold text-slate-700">رقم الهاتف</label>
                                    <Input 
                                        placeholder="055..." 
                                        className="bg-slate-50 border-slate-200 text-right" 
                                        dir="ltr"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-slate-700">الموضوع</label>
                                <Input 
                                    placeholder="كيف يمكننا مساعدتك؟" 
                                    className="bg-slate-50 border-slate-200"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-slate-700">الرسالة</label>
                                <Textarea 
                                    placeholder="اكتب رسالتك هنا..." 
                                    className="min-h-[150px] bg-slate-50 border-slate-200"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                />
                            </div>

                            <Button type="submit" size="lg" className="w-full font-bold text-base sm:text-lg h-14 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                                إرسال <Send className="mr-2 h-5 w-5" />
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

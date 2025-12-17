import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";

export const Footer = () => {
    const { data: settings } = useSiteSettings();
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from("categories")
                .select("id, name, slug")
                .limit(5);
            if (data) setCategories(data);
        };
        fetchCategories();
    }, []);

    return (
        <footer className="bg-green-600 text-white mt-auto">
            <div className="container py-6 md:py-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {/* About - Full width on mobile, 1 col on desktop */}
                    <div className="col-span-2 lg:col-span-1 space-y-3 md:space-y-4">
                        <Link to="/" className="inline-block">
                            {settings?.logo_url ? (
                                <img src={settings.logo_url} alt={settings.site_name} className="h-8 md:h-12 w-auto brightness-0 invert" />
                            ) : (
                                <h3 className="text-lg md:text-xl font-bold text-white">{settings?.site_name || "بازارنا"}</h3>
                            )}
                        </Link>
                        <p className="text-xs md:text-sm text-white/90 leading-relaxed max-w-xs hidden md:block">
                            منصتك الأولى للتسوق الإلكتروني في الجزائر. نجمع لك أفضل المحلات والمنتجات في مكان واحد.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-2 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-white">روابط سريعة</h3>
                        <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                            <li>
                                <Link to="/products" className="hover:text-white/80 transition-colors">
                                    المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link to="/stores" className="hover:text-white/80 transition-colors">
                                    المحلات
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-white/80 transition-colors">
                                    من نحن
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-white/80 transition-colors">
                                    اتصل بنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories - Dynamic */}
                    <div className="space-y-2 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-white">التصنيفات</h3>
                        <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <Link to={`/products?categoryId=${cat.id}`} className="hover:text-white/80 transition-colors">
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                            {categories.length === 0 && (
                                <li>
                                    <Link to="/products" className="hover:text-white/80 transition-colors">
                                        تصفح الكل
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Contact & Social - Full width on mobile */}
                    <div className="col-span-2 lg:col-span-1 space-y-3 md:space-y-4">
                        <h3 className="text-base md:text-lg font-semibold text-white">تواصل معنا</h3>

                        {/* Social Media - Compact row */}
                        <div className="flex gap-3">
                            {settings?.facebook_url && (
                                <a href={settings.facebook_url} target="_blank" rel="noreferrer" className="bg-white/10 p-1.5 md:p-2 rounded-full hover:bg-white/20 hover:text-white transition-all">
                                    <Facebook className="h-4 w-4 md:h-5 md:w-5" />
                                    <span className="sr-only">Facebook</span>
                                </a>
                            )}
                            {settings?.instagram_url && (
                                <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="bg-white/10 p-1.5 md:p-2 rounded-full hover:bg-white/20 hover:text-white transition-all">
                                    <Instagram className="h-4 w-4 md:h-5 md:w-5" />
                                    <span className="sr-only">Instagram</span>
                                </a>
                            )}
                            {settings?.tiktok_url && (
                                <a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="bg-white/10 p-1.5 md:p-2 rounded-full hover:bg-white/20 hover:text-white transition-all">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                    <span className="sr-only">TikTok</span>
                                </a>
                            )}
                        </div>

                        {/* Contact Info */}
                        <div className="text-xs md:text-sm text-white/90 space-y-1.5 md:space-y-2 mt-2 md:mt-4">
                            {settings?.phone_number && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span dir="ltr">{settings.phone_number}</span>
                                </div>
                            )}
                            {settings?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
                                </div>
                            )}
                            {settings?.address && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                    <span>{settings.address}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20 text-center text-xs md:text-sm text-white/80 flex flex-col md:flex-row justify-between items-center gap-3">
                    <p>© {new Date().getFullYear()} {settings?.site_name || "بازارنا"}. جميع الحقوق محفوظة.</p>
                    <div className="flex gap-3 md:gap-4">
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                        <Link to="/terms-conditions" className="hover:text-white transition-colors">الشروط والأحكام</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};


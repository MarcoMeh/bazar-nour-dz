import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

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

    const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="bg-white/5 p-2 rounded-full hover:bg-white/10 hover:text-white text-slate-300 transition-all border border-white/5"
            aria-label={label}
        >
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
        </a>
    );

    return (
        <footer className="bg-slate-950 text-slate-200 mt-auto border-t border-slate-800">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4 text-center md:text-right">
                        <Link to="/" className="inline-block">
                            {settings?.logo_url ? (
                                <img src={settings.logo_url} alt={settings.site_name} className="h-10 md:h-12 w-auto brightness-0 invert opacity-90" />
                            ) : (
                                <h3 className="text-2xl font-bold text-white tracking-tight">{settings?.site_name || "بازارنا"}</h3>
                            )}
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto md:mx-0">
                            منصتك الأولى للتسوق الإلكتروني في الجزائر. نجمع لك أفضل المحلات والمنتجات في مكان واحد.
                        </p>

                        <div className="flex gap-3 justify-center md:justify-start pt-2">
                            {settings?.facebook_url && <SocialLink href={settings.facebook_url} icon={Facebook} label="Facebook" />}
                            {settings?.instagram_url && <SocialLink href={settings.instagram_url} icon={Instagram} label="Instagram" />}
                            {settings?.tiktok_url && (
                                <a href={settings.tiktok_url} target="_blank" rel="noreferrer" className="bg-white/5 p-2 rounded-full hover:bg-white/10 hover:text-white text-slate-300 transition-all border border-white/5">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Desktop Navigation - Hidden on Mobile */}
                    <div className="hidden md:block space-y-4">
                        <h3 className="text-lg font-semibold text-white">روابط سريعة</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            <li><Link to="/products" className="hover:text-primary transition-colors">المنتجات</Link></li>
                            <li><Link to="/stores" className="hover:text-primary transition-colors">المحلات</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">من نحن</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">اتصل بنا</Link></li>
                        </ul>
                    </div>

                    {/* Desktop Categories - Hidden on Mobile */}
                    <div className="hidden md:block space-y-4">
                        <h3 className="text-lg font-semibold text-white">التصنيفات</h3>
                        <ul className="space-y-2 text-sm text-slate-400">
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <Link to={`/products?categoryId=${cat.id}`} className="hover:text-primary transition-colors">{cat.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info - Desktop */}
                    <div className="hidden md:block space-y-4">
                        <h3 className="text-lg font-semibold text-white">تواصل معنا</h3>
                        <ul className="space-y-3 text-sm text-slate-400">
                            {settings?.phone_number && (
                                <li className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span dir="ltr">{settings.phone_number}</span>
                                </li>
                            )}
                            {settings?.email && (
                                <li className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-primary" />
                                    <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
                                </li>
                            )}
                            {settings?.address && (
                                <li className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <span>{settings.address}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Mobile Compact Footer - Replaces Accordion */}
                    <div className="md:hidden col-span-1 space-y-6 pt-2">
                        {/* 1. Logo & Socials Row */}
                        <div className="flex items-center justify-between">
                            <Link to="/" className="inline-block">
                                {settings?.logo_url ? (
                                    <img src={settings.logo_url} alt={settings.site_name} className="h-8 w-auto object-contain opacity-90" />
                                ) : (
                                    <h3 className="text-xl font-bold text-white tracking-tight">{settings?.site_name || "بازارنا"}</h3>
                                )}
                            </Link>

                            <div className="flex gap-3">
                                {settings?.facebook_url && <SocialLink href={settings.facebook_url} icon={Facebook} label="Facebook" />}
                                {settings?.instagram_url && <SocialLink href={settings.instagram_url} icon={Instagram} label="Instagram" />}
                            </div>
                        </div>

                        {/* 2. Compact Contact Info */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 border-y border-slate-800/50 py-3">
                            <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-primary" />
                                <span dir="ltr">{settings?.phone_number || "+213 555 123 456"}</span>
                            </div>
                            <div className="flex items-center gap-2 justify-end">
                                <span className="truncate max-w-[120px]">{settings?.email || "contact@bazzarna.com"}</span>
                                <Mail className="h-3 w-3 text-primary" />
                            </div>
                        </div>

                        {/* 3. Legal & Copyright */}
                        <div className="text-center space-y-2 text-[10px] text-slate-500">
                            <div className="flex justify-center gap-4">
                                <Link to="/privacy-policy" className="hover:text-slate-300">سياسة الخصوصية</Link>
                                <span>•</span>
                                <Link to="/terms-conditions" className="hover:text-slate-300">الشروط والأحكام</Link>
                            </div>
                            <p>© {new Date().getFullYear()} bazzarna</p>
                        </div>
                    </div>
                </div>

                {/* Desktop Footer Bottom - Hidden on Mobile */}
                <div className="hidden md:flex mt-8 pt-8 border-t border-slate-800/50 justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} bazzarna. جميع الحقوق محفوظة.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">سياسة الخصوصية</Link>
                        <Link to="/terms-conditions" className="hover:text-slate-300 transition-colors">الشروط والأحكام</Link>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Spacing for Nav */}
            <div className="h-20 md:hidden"></div>
        </footer>
    );
};

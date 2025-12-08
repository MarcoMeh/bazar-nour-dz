import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-green-600 text-white mt-auto">
            <div className="container py-8 md:py-12">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About - Full width on mobile, 1 col on desktop */}
                    <div className="col-span-2 lg:col-span-1 space-y-4">
                        <Link to="/" className="inline-block">
                            <h3 className="text-xl font-bold text-white">بازارنا</h3>
                        </Link>
                        <p className="text-sm text-white/90 leading-relaxed max-w-xs">
                            منصتك الأولى للتسوق الإلكتروني في الجزائر. نجمع لك أفضل المحلات والمنتجات في مكان واحد.
                        </p>
                    </div>

                    {/* Quick Links - Share row on mobile */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">روابط سريعة</h3>
                        <ul className="space-y-2 text-sm">
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

                    {/* Categories - Share row on mobile */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">التصنيفات</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/products?category=clothes" className="hover:text-white/80 transition-colors">
                                    ملابس
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=electronics" className="hover:text-white/80 transition-colors">
                                    إلكترونيات
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=decor" className="hover:text-white/80 transition-colors">
                                    ديكور
                                </Link>
                            </li>
                            <li>
                                <Link to="/products?category=beauty" className="hover:text-white/80 transition-colors">
                                    مواد تجميل
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Social - Full width on mobile */}
                    <div className="col-span-2 lg:col-span-1 space-y-4">
                        <h3 className="text-lg font-semibold text-white">تواصل معنا</h3>
                        <div className="flex gap-4">
                            <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 hover:text-white transition-all">
                                <Facebook className="h-5 w-5" />
                                <span className="sr-only">Facebook</span>
                            </a>
                            <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 hover:text-white transition-all">
                                <Instagram className="h-5 w-5" />
                                <span className="sr-only">Instagram</span>
                            </a>
                            <a href="#" className="bg-white/10 p-2 rounded-full hover:bg-white/20 hover:text-white transition-all">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </a>
                        </div>
                        <p className="text-sm text-white/80 mt-4">
                            هل تحتاج مساعدة؟ <br />
                            <a href="mailto:support@bazzarna.dz" className="underline hover:text-white">support@bazzarna.dz</a>
                        </p>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/80 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} بازارنا. جميع الحقوق محفوظة.</p>
                    <div className="flex gap-4">
                        <Link to="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link>
                        <Link to="/login" className="opacity-60 hover:opacity-100 transition-opacity">إدارة</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

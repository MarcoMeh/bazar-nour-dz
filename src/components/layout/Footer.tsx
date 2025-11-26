import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-green-600 text-white mt-auto">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white">بازارنا</h3>
                        <p className="text-sm text-white/90">
                            منصتك الأولى للتسوق الإلكتروني في الجزائر. نجمع لك أفضل المحلات والمنتجات في مكان واحد.
                        </p>
                    </div>

                    {/* Quick Links */}
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

                    {/* Categories */}
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

                    {/* Contact & Social */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-white">تواصل معنا</h3>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-white/80 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-white/80 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-white/80 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/80">
                    <p>© {new Date().getFullYear()} بازارنا. جميع الحقوق محفوظة.</p>
                    <Link to="/login" className="inline-block mt-3 text-xs opacity-60 hover:opacity-100 transition-opacity text-white">
                        إدارة
                    </Link>
                </div>
            </div>
        </footer>
    );
};

import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground mt-auto">
            <div className="container py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-secondary">بازارنا</h3>
                        <p className="text-sm text-primary-foreground/80">
                            منصتك الأولى للتسوق الإلكتروني في الجزائر. نجمع لك أفضل المحلات والمنتجات في مكان واحد.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-secondary">روابط سريعة</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/products" className="hover:text-secondary transition-colors">
                                    المنتجات
                                </Link>
                            </li>
                            <li>
                                <Link to="/stores" className="hover:text-secondary transition-colors">
                                    المحلات
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-secondary transition-colors">
                                    من نحن
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-secondary transition-colors">
                                    اتصل بنا
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-secondary">التصنيفات</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/category/clothes" className="hover:text-secondary transition-colors">
                                    ملابس
                                </Link>
                            </li>
                            <li>
                                <Link to="/category/electronics" className="hover:text-secondary transition-colors">
                                    إلكترونيات
                                </Link>
                            </li>
                            <li>
                                <Link to="/category/decor" className="hover:text-secondary transition-colors">
                                    ديكور
                                </Link>
                            </li>
                            <li>
                                <Link to="/category/beauty" className="hover:text-secondary transition-colors">
                                    مواد تجميل
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-secondary">تواصل معنا</h3>
                        <div className="flex gap-4">
                            <a href="#" className="hover:text-secondary transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-secondary transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="hover:text-secondary transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60">
                    <p>© {new Date().getFullYear()} بازارنا. جميع الحقوق محفوظة.</p>
                </div>
            </div>
        </footer>
    );
};

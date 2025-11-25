import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Truck, Shield, HeadphonesIcon, ArrowRight, Star } from "lucide-react";

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-accent/20">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 bg-primary/5 z-0"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 animate-pulse delay-1000"></div>

                <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-right space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                            </span>
                            <span className="font-medium text-sm">منصتك الأولى للتسوق في الجزائر</span>
                        </div>

                        <h1 className="text-5xl lg:text-7xl font-black text-primary leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                            اكتشف عالم <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-l from-secondary to-primary">التسوق العصري</span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                            تجربة تسوق فريدة تجمع بين الجودة والسرعة. آلاف المنتجات من أفضل العلامات التجارية تصلك أينما كنت في الجزائر.
                        </p>

                        <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                                <Link to="/products">
                                    ابدأ التسوق <ArrowRight className="mr-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-accent transition-all">
                                <Link to="/stores">تصفح المحلات</Link>
                            </Button>
                        </div>

                        <div className="flex items-center gap-8 pt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
                            <div>
                                <h4 className="text-3xl font-bold text-primary">+5000</h4>
                                <p className="text-sm text-muted-foreground">منتج متنوع</p>
                            </div>
                            <div className="w-px h-12 bg-border"></div>
                            <div>
                                <h4 className="text-3xl font-bold text-primary">+58</h4>
                                <p className="text-sm text-muted-foreground">ولاية مغطاة</p>
                            </div>
                            <div className="w-px h-12 bg-border"></div>
                            <div>
                                <h4 className="text-3xl font-bold text-primary">+100</h4>
                                <p className="text-sm text-muted-foreground">محل شريك</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative hidden lg:block animate-float">
                        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop"
                                alt="Shopping Experience"
                                className="rounded-2xl w-full object-cover h-[500px]"
                            />

                            {/* Floating Card 1 */}
                            <div className="absolute -left-12 top-1/4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce delay-1000">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Truck className="h-6 w-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">توصيل سريع</p>
                                    <p className="text-xs text-muted-foreground">لجميع الولايات</p>
                                </div>
                            </div>

                            {/* Floating Card 2 */}
                            <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-bounce delay-700">
                                <div className="bg-yellow-100 p-3 rounded-full">
                                    <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">جودة عالية</p>
                                    <p className="text-xs text-muted-foreground">منتجات أصلية</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">لماذا تختار بازارنا؟</h2>
                        <p className="text-muted-foreground text-lg">نقدم لك تجربة تسوق متكاملة تجمع بين الراحة والأمان</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: ShoppingBag, title: "تشكيلة واسعة", desc: "آلاف المنتجات من مختلف الفئات", color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: Truck, title: "توصيل سريع", desc: "نوصل لجميع ولايات الجزائر", color: "text-green-500", bg: "bg-green-50" },
                            { icon: Shield, title: "دفع آمن", desc: "الدفع عند الاستلام لضمان حقك", color: "text-purple-500", bg: "bg-purple-50" },
                            { icon: HeadphonesIcon, title: "دعم متواصل", desc: "فريقنا في خدمتك 7/7", color: "text-orange-500", bg: "bg-orange-50" },
                        ].map((feature, i) => (
                            <Card key={i} className="group border-none shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                                <CardContent className="pt-8 text-center">
                                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${feature.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className={`h-10 w-10 ${feature.color}`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-primary">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-24 bg-accent/30">
                <div className="container">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">تصفح حسب الفئة</h2>
                            <p className="text-muted-foreground">اكتشف منتجاتنا حسب التصنيف الذي يناسبك</p>
                        </div>
                        <Button asChild variant="ghost" className="hidden md:flex group">
                            <Link to="/products">
                                عرض كل الفئات <ArrowRight className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {[
                            { name: "ملابس", icon: "👕", color: "bg-pink-100" },
                            { name: "إلكترونيات", icon: "📱", color: "bg-blue-100" },
                            { name: "ديكور", icon: "🏠", color: "bg-yellow-100" },
                            { name: "تجميل", icon: "💄", color: "bg-red-100" },
                            { name: "رياضة", icon: "⚽", color: "bg-green-100" },
                            { name: "ألعاب", icon: "🎮", color: "bg-purple-100" },
                        ].map((category) => (
                            <Link key={category.name} to={`/products?category=${category.name}`} className="group">
                                <div className="bg-white rounded-3xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-primary/10">
                                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${category.color} flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300`}>
                                        {category.icon}
                                    </div>
                                    <h3 className="font-bold text-primary group-hover:text-secondary transition-colors">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Best Products Section */}
            <section className="py-24">
                <div className="container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">وصل حديثاً</h2>
                        <p className="text-muted-foreground text-lg">أحدث المنتجات المضافة إلى متجرنا</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="group overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-300">
                                <div className="relative aspect-[4/5] bg-muted overflow-hidden">
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center gap-2">
                                        <Button size="icon" className="rounded-full bg-white text-primary hover:bg-secondary hover:text-white translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            <ShoppingBag className="h-5 w-5" />
                                        </Button>
                                        <Button size="icon" className="rounded-full bg-white text-primary hover:bg-secondary hover:text-white translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75">
                                            <ArrowRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <img
                                        src={`https://source.unsplash.com/random/400x500?product=${i}`}
                                        alt="Product"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20">
                                        جديد
                                    </div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="text-sm text-muted-foreground mb-2">تصنيف المنتج</div>
                                    <h3 className="font-bold text-lg mb-2 group-hover:text-secondary transition-colors">اسم المنتج الرائع {i}</h3>
                                    <div className="flex items-center justify-between mt-4">
                                        <span className="text-xl font-black text-primary">2,500 دج</span>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            <Star className="h-4 w-4 fill-current" />
                                            <span className="text-sm font-medium text-muted-foreground">4.5</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <Button asChild size="lg" className="rounded-full px-8">
                            <Link to="/products">عرض كل المنتجات</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="py-24 bg-primary text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="container relative z-10 text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">اشترك في نشرتنا البريدية</h2>
                    <p className="text-white/80 mb-8 text-lg">احصل على آخر العروض والخصومات مباشرة في بريدك الإلكتروني</p>
                    <div className="flex gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="أدخل بريدك الإلكتروني"
                            className="flex-1 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary"
                        />
                        <Button size="lg" className="rounded-full bg-secondary text-primary hover:bg-secondary/90 font-bold px-8">
                            اشترك
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

<<<<<<< HEAD
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import aboutImage from '@/assets/about_backround.jpeg'; // You can add a nice image here

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-green-600 text-white">
          <div className="absolute inset-0 bg-[url('/src/assets/about_image.png')] bg-cover bg-center opacity-20" />
          <div className="container mx-auto px-4 py-32 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              من نحن
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-6">
              بازارنا هو متجر إلكتروني شامل يجمع كل المنتجات التي تحتاجها في مكان واحد، من ملابس وإلكترونيات ومستحضرات تجميل وحتى أدوات منزلية وبناء.
            </p>
            <Link to="/products">
              <Button size="lg" className="bg-white text-green-600 font-bold hover:bg-gray-100 transition-all px-8 py-4">
                تصفح المنتجات
              </Button>
            </Link>
          </div>
        </section>

        {/* About Content */}
        <section className="py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                مهمتنا
              </h2>
              <p className="text-lg text-muted-foreground">
                نسعى لتوفير تجربة تسوق سهلة، موثوقة وممتعة لجميع عملائنا في الجزائر، مع تنوع كبير في المنتجات وتوصيل سريع لجميع الولايات.
              </p>

              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                رؤيتنا
              </h2>
              <p className="text-lg text-muted-foreground">
                أن نصبح المنصة الإلكترونية الرائدة في الجزائر التي تجمع كل ما يحتاجه العميل في مكان واحد مع جودة وخدمة عالية.
              </p>
            </div>

            {/* Image */}
            <div className="flex justify-center">
              <img 
                src={aboutImage} 
                alt="About Bazzarna" 
                className="rounded-2xl shadow-lg w-full max-w-md"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-green-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              لماذا تختار بازارنا؟
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-2">منتجات متنوعة</h3>
                <p className="text-muted-foreground">
                  جميع المنتجات التي تحتاجها من ملابس، إلكترونيات، أدوات منزلية ومستحضرات تجميل.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-2">توصيل سريع</h3>
                <p className="text-muted-foreground">
                  نوفر توصيل لجميع الولايات بأسرع وقت ممكن.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white shadow-md hover:shadow-xl transition-all">
                <h3 className="text-xl font-bold mb-2">دفع آمن</h3>
                <p className="text-muted-foreground">
                  الدفع عند الاستلام أو عبر وسائل الدفع الإلكترونية الموثوقة.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
=======
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import aboutImage from "@/assets/about_backround.jpeg"; // optional background image if you have one

const About = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <Header />

      {/* Hero Section */}
      <section className="relative w-full bg-green-50">
        {aboutImage && (
          <img
            src={aboutImage}
            alt="About Bazzarna"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}
        <div className="relative container mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl font-bold text-green-700 mb-4">من نحن</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            بازارنا هو متجرك الإلكتروني الموثوق في الجزائر 🇩🇿 — المكان الذي يجمع كل
            ما تحتاجه من منتجات متنوعة: من الأدوات المنزلية إلى الهواتف، العطور،
            الملابس، مستحضرات التجميل والمزيد.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-green-700 mb-6">رؤيتنا ورسالتنا</h2>
        <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
          نحن في <span className="text-green-700 font-semibold">بازارنا</span> نهدف إلى
          جعل تجربة التسوق الإلكترونية سهلة، مريحة وآمنة للجميع.  
          نسعى لتوفير منتجات عالية الجودة بأسعار مناسبة وتوصيل سريع لجميع الولايات.
        </p>
      </section>

      {/* Values Section */}
      <section className="bg-green-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-10">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-green-700 mb-2">الثقة</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                نضع ثقة عملائنا في المقدمة، من خلال الشفافية في الأسعار والجودة المضمونة.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-green-700 mb-2">السهولة</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                واجهة سهلة الاستخدام وتجربة شراء سلسة من أي جهاز.
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100">
              <h3 className="text-lg font-semibold text-green-700 mb-2">السرعة</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                توصيل سريع لجميع الولايات وخدمة عملاء متجاوبة على مدار الساعة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20">
        <h2 className="text-2xl font-bold text-green-700 mb-6">
          اكتشف تجربة التسوق الأفضل مع بازارنا
        </h2>
        <Button asChild className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg">
          <a href="/products">تسوق الآن</a>
        </Button>
      </section>
>>>>>>> 5c2b0f6ece8db8775ec6c1819f8ec4f67928f520

      <Footer />
    </div>
  );
};

export default About;

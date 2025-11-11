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

      <Footer />
    </div>
  );
};

export default About;

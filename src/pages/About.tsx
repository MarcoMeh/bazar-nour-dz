import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';

import { Button } from '@/components/ui/button';
import aboutImage from '@/assets/about_backround.jpeg';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-green-600 text-white">
          <div className="absolute inset-0 bg-black/20" />
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
                className="rounded-2xl shadow-lg w-full max-w-md object-cover"
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

    </div>
  );
};

export default About;

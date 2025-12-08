import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import aboutImage from '@/assets/about_backround.jpeg';
import { ShieldCheck, Truck, Users, Award, Heart, ShoppingBag } from 'lucide-react';
import SEO from '@/components/SEO';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-cairo overflow-x-hidden">
      <SEO
        title="من نحن"
        description="تعرف على بازارنا - المنصة الأولى للتجارة الإلكترونية في الجزائر. قصتنا، رؤيتنا، وكيف نسعى لخدمتكم بأفضل المنتجات."
      />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={aboutImage}
              alt="فريق بازارنا"
              className="w-full h-full object-cover animate-pulse-slow object-center scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-indigo-900/80 to-slate-900/60"></div>
          </div>

          <div className="container relative z-10 text-center text-white px-4 space-y-6">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4 animate-fade-in">
              <span className="text-yellow-400 font-bold tracking-wide text-sm">قصتنا</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight animate-slide-up">
              أكثر من مجرد <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">
                متجر إلكتروني
              </span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
              نحن نبني جسراً بين الأصالة والحداثة، لنضع سوق الجزائر الكبير بين يديك، أينما كنت.
            </p>
          </div>
        </section>

        {/* 2. Stats Section */}
        <section className="py-12 -mt-16 relative z-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "عميل سعيد", value: "+10,000" },
                { icon: ShoppingBag, label: "منتج متنوع", value: "+5,000" },
                { icon: Truck, label: "ولاية توصيل", value: "58" },
                { icon: Award, label: "سنة خبرة", value: "+3" },
              ].map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                  <div className="bg-indigo-50 p-3 rounded-full mb-3">
                    <stat.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-gray-500 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 md:order-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg">
                      <Heart className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">مهمتنا</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    نسعى لتوفير تجربة تسوق سهلة، موثوقة وممتعة لجميع عملائنا في الجزائر. نؤمن بأن التسوق الإلكتروني يجب أن يكون آمناً وبسيطاً، ولذلك نركز جهودنا على ضمان جودة المنتجات وسرعة التوصيل.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <ShieldCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">رؤيتنا</h2>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    أن نصبح المنصة الإلكترونية الرائدة في الجزائر وشمال أفريقيا، التي تجمع أصحاب الحرف، المتاجر الكبرى، والمستهلكين في مجتمع تجاري واحد نابض بالحياة.
                  </p>
                </div>

                <div className="pt-4">
                  <Link to="/products">
                    <Button size="lg" className="rounded-full px-8 bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all h-12 text-lg">
                      ابدأ التسوق معنا
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="order-1 md:order-2 relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-yellow-200 to-indigo-200 rounded-[2.5rem] blur-xl opacity-40"></div>
                <img
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1632"
                  alt="فريق العمل"
                  className="relative rounded-[2rem] shadow-2xl w-full object-cover h-[500px] border-4 border-white"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Why Choose Us */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">لماذا يختارنا الآلاف؟</h2>
              <p className="text-gray-500 max-w-2xl mx-auto text-lg hover:text-gray-700 transition-colors">
                نحن لا نبيع منتجات فقط، بل نبيع ثقة وراحة بال.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "جودة مضمونة",
                  desc: "نفحص المنتجات ونتأكد من مطابقتها للمواصفات قبل عرضها في متجرنا.",
                  color: "bg-green-50 text-green-600",
                  icon: Award
                },
                {
                  title: "توصيل لكل الجزائر",
                  desc: "شبكة توصيل تغطي 58 ولاية، تصلك سلعتك لباب منزلك أو مكتبك.",
                  color: "bg-yellow-50 text-yellow-600",
                  icon: Truck
                },
                {
                  title: "دفع آمن 100%",
                  desc: "لا تدفع أي دينار حتى تستلم سلعتك وتتأكد منها بنفسك.",
                  color: "bg-indigo-50 text-indigo-600",
                  icon: ShieldCheck
                }
              ].map((feature, idx) => (
                <div key={idx} className="p-8 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 group">
                  <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed group-hover:text-gray-600">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;

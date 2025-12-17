import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Truck, Users, Sparkles, Store, ShoppingBag, ArrowLeft, Zap } from 'lucide-react';
import SEO from '@/components/SEO';
import aboutImage from '@/assets/about_backround.jpeg'; // تأكد أن الصورة داكنة أو احترافية

import { usePageBackgrounds } from '@/hooks/usePageBackgrounds';

const About = () => {
  const { data: backgrounds } = usePageBackgrounds();
  // Fallbacks
  const heroBg = backgrounds?.['about_hero']; // Use uploaded image if available, else CSS/pattern or default
  const storyMb = backgrounds?.['about_story'] || aboutImage;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-cairo overflow-x-hidden" dir="rtl">
      <SEO
        title="من نحن | قصة بازارنا"
        description="بازارنا هو السوق الرقمي الأول في الجزائر. نربط أفضل المتاجر بالمتسوقين في منصة واحدة آمنة وسريعة."
      />

      <main className="flex-1">
        {/* 1. Hero Section: The Vision */}
        <section className="relative h-[75vh] flex items-center justify-center overflow-hidden bg-slate-900">
          <div className="absolute inset-0">
            {heroBg && (
              <img src={heroBg} alt="About Hero" className="absolute inset-0 w-full h-full object-cover opacity-40 animate-pulse-slow" />
            )}
            {!heroBg && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>}

            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="container relative z-10 text-center px-4 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-yellow-400 animate-fade-in-up">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wide">المستقبل يبدأ هنا</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight animate-fade-in-up delay-100">
              لسنا مجرد متجر.. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-amber-600">
                نحن سوق الجزائر الرقمي
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-light animate-fade-in-up delay-200">
              في بازارنا، قمنا بإعادة اختراع التجارة الإلكترونية. بنينا جسراً ذكياً يربط طموح التاجر الجزائري براحة المتسوق، في منصة واحدة تجمع الكل.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-300">
              <Link to="/products">
                <Button size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 text-white h-14 text-lg w-full sm:w-auto shadow-lg shadow-indigo-500/25">
                  تصفح المنتجات
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg" className="rounded-full px-8 border-white/20 text-white hover:bg-white/10 h-14 text-lg w-full sm:w-auto backdrop-blur-sm">
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* 2. The Duality Section (Merchant vs Customer) - Unchanged... */}
        <section className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">منصة واحدة.. عالمين مختلفين</h2>
              <p className="text-slate-500 text-lg">نقدم قيمة حقيقية لطرفي المعادلة التجارية</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* For Merchants */}
              <div className="group relative overflow-hidden rounded-3xl bg-slate-900 p-8 md:p-12 text-white transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Store className="w-48 h-48" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <Zap className="w-7 h-7 text-indigo-400" />
                  </div>
                  <h3 className="text-3xl font-bold">للتجار وأصحاب المشاريع</h3>
                  <p className="text-slate-300 leading-relaxed text-lg">
                    وداعاً لفوضى الرسائل. نمنحك متجراً إلكترونياً متكاملاً، رابطاً خاصاً بك، ونظاماً يدير طلباتك ومخزونك أوتوماتيكياً. ركز على سلعتك، ونحن نتكفل بالتقنية.
                  </p>
                  <ul className="space-y-3 text-slate-400">
                    <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400" /> متجر خاص باسمك</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-400" /> لوحة تحكم شاملة</li>
                  </ul>
                </div>
              </div>

              {/* For Shoppers */}
              <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 md:p-12 text-slate-900 transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShoppingBag className="w-48 h-48 text-indigo-900" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center border border-yellow-200">
                    <ShoppingBag className="w-7 h-7 text-yellow-600" />
                  </div>
                  <h3 className="text-3xl font-bold">للمتسوقين الأذكياء</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    تجربة تسوق آمنة وممتعة. تصفح آلاف المنتجات من متاجر موثوقة، قارن الأسعار، واطلب بضغطة زر مع ضمان التوصيل لـ 58 ولاية والدفع عند الاستلام.
                  </p>
                  <ul className="space-y-3 text-slate-500">
                    <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600" /> حماية المشتري</li>
                    <li className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600" /> جودة مضمونة</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. The Story / Philosophy */}
        <section className="py-20 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.5rem] rotate-2 opacity-20 blur-lg"></div>
                <img
                  src={storyMb}
                  alt="فلسفة بازارنا"
                  className="relative rounded-[2rem] shadow-2xl w-full object-cover h-[500px]"
                />
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs hidden md:block">
                  <p className="font-bold text-slate-900 text-lg mb-2">"هدفنا بسيط.."</p>
                  <p className="text-slate-500 text-sm">أن نجعل التجارة في الجزائر سهلة، منظمة، ومتاحة للجميع.</p>
                </div>
              </div>

              <div className="lg:w-1/2 space-y-8">
                <h2 className="text-4xl font-black text-slate-900 leading-tight">
                  لماذا وُجد <span className="text-indigo-600">بازارنا</span>؟
                </h2>
                <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                  <p>
                    بدأت القصة بملاحظة بسيطة: السوق الجزائري مليء بالفرص، لكنه غارق في الفوضى. التاجر يضيع وقته في الرد على الرسائل المتكررة، والمشتري يخشى الاحتيال أو سوء الجودة.
                  </p>
                  <p>
                    قررنا أن نكون <strong>الحل الجذري</strong>.
                  </p>
                  <p>
                    لم نقم بإنشاء مجرد موقع، بل بنينا نظاماً تقنياً يمنح كل تاجر "هويته الرقمية"، ويمنح كل مشتري "راحة البال". نحن نؤمن أن التكنولوجيا وجدت لخدمة الإنسان، وليس لتعقيد حياته.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="border-r-4 border-yellow-400 pr-4">
                    <h4 className="text-3xl font-bold text-slate-900">+10K</h4>
                    <p className="text-slate-500">عميل يثق بنا</p>
                  </div>
                  <div className="border-r-4 border-indigo-600 pr-4">
                    <h4 className="text-3xl font-bold text-slate-900">58</h4>
                    <p className="text-slate-500">ولاية نغطيها</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Values / Features Grid */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                {
                  icon: ShieldCheck,
                  color: "text-emerald-500",
                  bg: "bg-emerald-50",
                  title: "الثقة والأمان",
                  desc: "نحن الوسيط الضامن. لا تخرج الأموال إلا بعد التأكد، ولا تُعرض السلع إلا بعد الموافقة."
                },
                {
                  icon: Truck,
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                  title: "سرعة التوصيل",
                  desc: "شراكات مع أفضل شركات التوصيل في الجزائر لضمان وصول طلبيتك في وقت قياسي."
                },
                {
                  icon: Users,
                  color: "text-purple-500",
                  bg: "bg-purple-50",
                  title: "دعم محلي 100%",
                  desc: "فريقنا جزائري، يفهم عقليتك، ويتحدث لهجتك، وجاهز لخدمتك في أي وقت."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-8 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:shadow-xl transition-all duration-300 group">
                  <div className={`w-20 h-20 mx-auto ${item.bg} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <item.icon className={`w-10 h-10 ${item.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. CTA Section */}
        <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600/10"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">جاهز لتجربة تسوق مختلفة؟</h2>
            <p className="text-indigo-200 text-xl max-w-2xl mx-auto mb-10">
              انضم لآلاف الجزائريين الذين اختاروا السهولة والاحترافية. سواء كنت تشتري أو تبيع، مكانك هنا.
            </p>
            <Link to="/products">
              <Button size="lg" className="rounded-full px-10 py-8 text-xl bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold shadow-lg hover:shadow-yellow-400/50 transition-all">
                ابدأ التسوق الآن <ArrowLeft className="mr-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
};

export default About;
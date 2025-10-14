export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">بازارنا</h3>
            <p className="text-sm opacity-90">
              كل ما تحتاجه في مكان واحد. متجرك الإلكتروني الموثوق في الجزائر.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a href="/products" className="hover:opacity-100 transition-opacity">المنتجات</a></li>
              <li><a href="/cart" className="hover:opacity-100 transition-opacity">السلة</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">التواصل</h3>
            <p className="text-sm opacity-90">
              الدفع عند الاستلام<br />
              التوصيل لجميع الولايات
            </p>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-90">
          <p>© 2025 بازارنا. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-2xl mb-8">الصفحة غير موجودة</p>
        <a href="/" className="text-primary hover:underline">
          العودة للصفحة الرئيسية
        </a>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-16 text-center">
      <div className="bg-muted p-8 rounded-full mb-8 animate-pulse">
        <FileQuestion className="h-24 w-24 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold text-primary mb-4">404 - الصفحة غير موجودة</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        عذراً، الصفحة التي تبحث عنها قد تكون حذفت أو تم تغيير اسمها أو غير متاحة مؤقتاً.
      </p>
      <Button asChild size="lg">
        <Link to="/">العودة للصفحة الرئيسية</Link>
      </Button>
    </div>
  );
}

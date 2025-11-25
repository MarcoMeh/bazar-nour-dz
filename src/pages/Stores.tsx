import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Stores() {
    return (
        <div className="container py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-8 text-primary">محلاتنا</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder stores - will be replaced with real data from Supabase */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-video bg-muted"></div>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-xl mb-2">محل {i}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                وصف المحل وتخصصه في بيع المنتجات المختلفة
                            </p>
                            <Button asChild className="w-full">
                                <Link to={`/store/${i}`}>زيارة المحل</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

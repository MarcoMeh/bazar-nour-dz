import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RouteErrorFallbackProps {
    error?: Error;
    resetError?: () => void;
}

export function RouteErrorFallback({ error, resetError }: RouteErrorFallbackProps) {
    return (
        <div className="container flex items-center justify-center min-h-[60vh] py-8">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <CardTitle className="text-xl">حدث خطأ</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        عذراً، حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
                    </p>

                    {process.env.NODE_ENV === 'development' && error && (
                        <div className="bg-muted p-3 rounded text-xs font-mono text-destructive">
                            {error.message}
                        </div>
                    )}

                    <div className="flex gap-2">
                        {resetError && (
                            <Button onClick={resetError} variant="outline" className="flex-1">
                                إعادة المحاولة
                            </Button>
                        )}
                        <Button asChild className="flex-1">
                            <Link to="/">
                                <Home className="ml-2 h-4 w-4" />
                                الصفحة الرئيسية
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

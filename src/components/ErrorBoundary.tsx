import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console (you can also send to error tracking service)
        console.error("Uncaught error:", error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    private handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <Card className="max-w-lg w-full">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-destructive/10 rounded-full">
                                    <AlertTriangle className="h-6 w-6 text-destructive" />
                                </div>
                                <CardTitle className="text-2xl">عذراً، حدث خطأ غير متوقع</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                نعتذر عن هذا الإزعاج. حدث خطأ غير متوقع في التطبيق. يرجى المحاولة مرة أخرى.
                            </p>

                            {process.env.NODE_ENV === "development" && this.state.error && (
                                <div className="bg-muted p-4 rounded-lg space-y-2">
                                    <p className="font-mono text-sm text-destructive font-semibold">
                                        {this.state.error.toString()}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-muted-foreground">
                                            <summary className="cursor-pointer hover:text-foreground">
                                                عرض التفاصيل
                                            </summary>
                                            <pre className="mt-2 overflow-auto max-h-64 text-xs">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button onClick={this.handleReset} className="flex-1">
                                    <RefreshCcw className="ml-2 h-4 w-4" />
                                    العودة للصفحة الرئيسية
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                    className="flex-1"
                                >
                                    إعادة تحميل الصفحة
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

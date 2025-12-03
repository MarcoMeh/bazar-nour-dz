import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    message?: string;
    fullScreen?: boolean;
}

export const LoadingSpinner = ({
    size = "md",
    message = "جاري التحميل...",
    fullScreen = false
}: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-10 w-10",
        lg: "h-16 w-16",
    };

    const content = (
        <div className="text-center space-y-4">
            <Loader2 className={`${sizeClasses[size]} animate-spin text-primary mx-auto`} />
            {message && (
                <p className="text-muted-foreground text-sm">{message}</p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                {content}
            </div>
        );
    }

    return content;
};

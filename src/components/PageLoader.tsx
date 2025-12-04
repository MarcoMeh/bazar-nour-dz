import { LoadingSpinner } from './LoadingSpinner';

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <LoadingSpinner size="lg" message="جاري تحميل الصفحة..." fullScreen />
        </div>
    );
}

import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function OfflineIndicator() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <Alert variant="destructive" className="max-w-md mx-auto">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="mr-2">
          لا يوجد اتصال بالإنترنت. بعض الميزات قد لا تعمل.
        </AlertDescription>
      </Alert>
    </div>
  );
}

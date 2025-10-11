import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const NoContentAlert = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Není k dispozici žádný obsah</AlertTitle>
      <AlertDescription>
        Momentálně nejsou žádné položky k zobrazení.
      </AlertDescription>
    </Alert>
  );
};

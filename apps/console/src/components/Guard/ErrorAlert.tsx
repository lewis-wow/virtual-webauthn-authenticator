import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const ErrorAlert = () => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong.</AlertTitle>
      <AlertDescription>An unexpected error occurred.</AlertDescription>
    </Alert>
  );
};

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { HTTPExceptionCode } from '@repo/enums';
import { AlertCircle } from 'lucide-react';

export type HTTPExceptionAlertProps = {
  code: HTTPExceptionCode;
};

export const HTTPExceptionAlert = ({ code }: HTTPExceptionAlertProps) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Something went wrong.</AlertTitle>
      <AlertDescription>Request failed with code: {code}.</AlertDescription>
    </Alert>
  );
};

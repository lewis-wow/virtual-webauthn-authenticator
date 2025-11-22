import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/ui/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const NoContentAlert = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No content available</AlertTitle>
      <AlertDescription>
        There are currently no items to display.
      </AlertDescription>
    </Alert>
  );
};

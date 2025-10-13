import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, AlertTriangle, RefreshCw, Wifi } from 'lucide-react';

export type ErrorAlertType = 'general' | 'network' | 'server' | 'timeout';

export type ErrorAlertProps = {
  title?: string;
  message?: string;
  type?: ErrorAlertType;
  className?: string;
};

export const ErrorAlert = ({
  title,
  message,
  type = 'general',
  className,
}: ErrorAlertProps) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: Wifi,
          defaultTitle: 'Připojení selhalo',
          defaultMessage:
            'Zkontrolujte připojení k internetu a zkuste to znovu.',
        };
      case 'server':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Chyba serveru',
          defaultMessage:
            'Naše servery mají momentálně potíže. Zkuste to prosím znovu později.',
        };
      case 'timeout':
        return {
          icon: RefreshCw,
          defaultTitle: 'Vypršel časový limit požadavku',
          defaultMessage:
            'Požadavek trval příliš dlouho. Zkuste to prosím znovu.',
        };
      default:
        return {
          icon: AlertCircle,
          defaultTitle: 'Něco se pokazilo',
          defaultMessage:
            'Došlo k neočekávané chybě. Zkuste to prosím znovu nebo kontaktujte podporu.',
        };
    }
  };

  const { icon: Icon, defaultTitle, defaultMessage } = getErrorConfig();

  return (
    <Alert variant="destructive" className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title ?? defaultTitle}</AlertTitle>
      <AlertDescription>{message ?? defaultMessage}</AlertDescription>
    </Alert>
  );
};

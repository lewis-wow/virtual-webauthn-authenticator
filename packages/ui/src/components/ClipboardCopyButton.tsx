import { Button, type ButtonProps } from '@repo/ui/components/Button';
import { cn } from '@repo/ui/lib/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ClipboardCopyButtonProps extends ButtonProps {
  text: string;
  successDuration?: number;
}

export const ClipboardCopyButton = ({
  text,
  successDuration = 2000,
  className,
  variant = 'ghost',
  size = 'sm',
  ...props
}: ClipboardCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    // Prevent event bubbling if used inside a clickable row/card
    e.stopPropagation();

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast('Copied to clipboard');

      setTimeout(() => {
        setIsCopied(false);
      }, successDuration);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast('Failed to copy to clipboard');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn('shrink-0 transition-all', className)}
      onClick={handleCopy}
      {...props}
    >
      {isCopied ? (
        <Check className="h-4 w-4 animate-in zoom-in duration-300" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      <span className="sr-only">Copy</span>
    </Button>
  );
};

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/ui/alert-dialog';
import { cn } from '@repo/ui/lib/utils';
import type { ReactNode } from 'react';

export type DeleteConfirmDialogProps = {
  trigger?: ReactNode; // Made optional for controlled mode
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
  isPending?: boolean; // Good to have for loading states
  // Add these two:
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const DeleteConfirmDialog = ({
  trigger,
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone. This will permanently delete this item from our servers.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  isDestructive = true,
  isPending = false,
  open,
  onOpenChange,
}: DeleteConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* Only render trigger if provided */}
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(e) => {
              // Prevent default closing if you want to wait for a promise
              // But simpler here is to just fire the function
              if (isPending) {
                e.preventDefault();
                return;
              }
              onConfirm();
            }}
            className={cn('cursor-pointer', {
              'bg-destructive text-destructive-foreground hover:bg-destructive/90':
                isDestructive,
            })}
          >
            {isPending ? 'Processing...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

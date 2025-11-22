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
  trigger: ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isDestructive?: boolean;
};

export const DeleteConfirmDialog = ({
  trigger,
  title = 'Are you absolutely sure?',
  description = 'This action cannot be undone. This will permanently delete this item from our servers.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  isDestructive = true, // Defaults to red button
}: DeleteConfirmDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
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
            onClick={() => {
              // Prevent the dialog from closing immediately if you want to handle async logic manually,
              // but usually, we just fire the function.
              onConfirm();
            }}
            className={cn('cursor-pointer', {
              'bg-destructive text-destructive-foreground hover:bg-destructive/90':
                isDestructive,
            })}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

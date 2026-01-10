import type { DialogPortalProps } from '@radix-ui/react-dialog';
import { DialogPortal as DialogPortalUI } from '@repo/ui/components/ui/dialog';
import { useShadowRoot } from '@repo/ui/context/ShadowRootContext';

export type { DialogPortalProps };

export const DialogPortal = ({
  container,
  children,
  ...props
}: DialogPortalProps) => {
  // 1. Try to get the container from props
  // 2. Fallback to the Context
  // 3. Fallback to document.body (default behavior)
  const shadowRoot = useShadowRoot();
  const finalContainer = container ?? shadowRoot ?? document.body;

  return (
    <DialogPortalUI container={finalContainer} {...props}>
      {children}
    </DialogPortalUI>
  );
};

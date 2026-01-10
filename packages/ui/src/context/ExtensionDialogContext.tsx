import { createContext, useContext, useState, type ReactNode } from 'react';

export type ExtensionDialogContextType = {
  openDialog: (component: ReactNode) => void;
  closeDialog: () => void;
};

export const ExtensionDialogContext = createContext<
  ExtensionDialogContextType | undefined
>(undefined);

export const ExtensionDialogProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [activeModal, setActiveModal] = useState<ReactNode | null>(null);

  const openDialog = (component: ReactNode) => setActiveModal(component);
  const closeDialog = () => setActiveModal(null);

  return (
    <ExtensionDialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      {/* Render the active modal if one exists */}
      {activeModal}
    </ExtensionDialogContext.Provider>
  );
};

export const useExtensionDialog = () => {
  const context = useContext(ExtensionDialogContext);

  if (!context) {
    throw new Error(
      'useExtensionDialog must be used within ExtensionDialogProvider',
    );
  }

  return context;
};

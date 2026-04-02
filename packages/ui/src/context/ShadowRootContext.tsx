import { createContext, useContext, type ReactNode } from 'react';

const ShadowRootContext = createContext<HTMLElement | null>(null);

export const useShadowRoot = () => useContext(ShadowRootContext);

type ShadowRootProviderProps = {
  container: HTMLElement;
  children: ReactNode;
};

export const ShadowRootProvider = ({
  container,
  children,
}: ShadowRootProviderProps) => {
  return (
    <ShadowRootContext.Provider value={container}>
      {children}
    </ShadowRootContext.Provider>
  );
};

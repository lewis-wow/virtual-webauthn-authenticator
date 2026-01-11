import { createContext, useContext } from 'react';

const ShadowRootContext = createContext<HTMLElement | null>(null);

export const useShadowRoot = () => useContext(ShadowRootContext);

export const ShadowRootProvider = ({
  container,
  children,
}: {
  container: HTMLElement;
  children: React.ReactNode;
}) => {
  return (
    <ShadowRootContext.Provider value={container}>
      {children}
    </ShadowRootContext.Provider>
  );
};

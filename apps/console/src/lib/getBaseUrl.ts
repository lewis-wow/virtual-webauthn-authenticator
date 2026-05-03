export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser: use relative path
    return '';
  }

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

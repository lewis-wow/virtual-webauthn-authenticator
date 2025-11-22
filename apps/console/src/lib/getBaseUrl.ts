export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Browser: use relative path
    return '';
  }

  return `http://localhost:${process.env.PORT ?? 3000}`;
};

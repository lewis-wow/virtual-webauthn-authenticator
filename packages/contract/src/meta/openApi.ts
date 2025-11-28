export const openApi = (opts: { id: string }) => {
  const { id } = opts;

  return {
    id,
    title: id,
  };
};

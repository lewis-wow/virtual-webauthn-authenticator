module.exports = function (options) {
  return {
    ...options,
    externals: ['@repo/enums', '@repo/types', '@repo/utils'],
  };
};

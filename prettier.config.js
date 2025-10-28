/** @typedef  {import("@trivago/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig*/
/** @typedef  {import("prettier").Config} PrettierConfig*/

/** @type { PrettierConfig | SortImportsConfig } */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  importOrderSeparation: true,
  importOrder: ['^@core/(.*)$', '___', '__', '<THIRD_PARTY_MODULES>', '^[./]'],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};

export default config;

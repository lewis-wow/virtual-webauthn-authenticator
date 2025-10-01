/* eslint-disable @typescript-eslint/no-require-imports */
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  node: {
    // required for __dirname to properly resolve
    // Also required for `bull` to work, see https://github.com/OptimalBits/bull/issues/811
    __dirname: true,
  },
  output: {
    filename: 'main.js',
  },
  externals: [
    nodeExternals({
      allowlist: [/^@repo/],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: (_) =>
          /node_modules/.test(_) && !/node_modules\\\/(@repo)/.test(_),
        use: {
          loader: 'swc-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
    plugins: [new TsconfigPathsPlugin()],
  },
};

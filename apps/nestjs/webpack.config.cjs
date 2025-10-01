const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  output: {
    filename: '[name].cjs',
  },
  externals: {},
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          // By removing the 'options' key, swc-loader will automatically
          // search for and use the .swcrc file we created.
          loader: 'swc-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    extensionAlias: {
      '.js': ['.ts', '.js'],
    },
  },
};

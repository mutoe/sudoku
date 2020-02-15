const path = require('path')
const { VueLoaderPlugin } = require('vue-loader')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env = { prod: false }) => ({
    mode: env.prod ? 'production' : 'development',
    devtool: env.prod ? 'source-map' : 'eval-cheap-module-source-map',
    entry: path.resolve(__dirname, './src/main.ts'),
    output: {
      path: path.resolve(__dirname, './dist'),
      publicPath: '/',
    },
    resolve: {
      extensions: [ '.ts', '.js' ],
      alias: {
        'vue': '@vue/runtime-dom',
        '@': path.resolve('src'),
      },
    },
    devServer: {
      host: '0.0.0.0',
      port: 3000,
      inline: true,
      hot: true,
      stats: 'minimal',
      overlay: true,
      contentBase: path.join(__dirname, 'public'),
      historyApiFallback: true,
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: 'vue-loader',
        },
        {
          test: /\.tsx?/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'ts-loader',
              options: {
                appendTsxSuffixTo: [ /\.vue$/ ],
                transpileOnly: true,
              },
            },
          ],
        },
        {
          test: /\.png$/,
          use: {
            loader: 'url-loader',
            options: { limit: 8192 },
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: { hmr: !env.prod },
            },
            'css-loader',
          ],
        },
        {
          test: /\.s[ac]ss$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: { hmr: !env.prod },
            },
            'css-loader',
            'sass-loader',
            {
              loader: 'style-resources-loader',
              options: {
                patterns: [ './src/theme.scss' ],
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].css',
      }),
      new HtmlWebpackPlugin({
        title: 'vue-next-test',
        template: path.join(__dirname, '/public/index.html'),
      }),
    ],
  }
)

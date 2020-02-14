const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle-[hash].js'
  },
  devtool: 'cheap-eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    hot: true,
    host: '0.0.0.0',
    port: 3000,
    open: false
  },
  plugins: [
    new HTMLPlugin({
      filename: 'index.html',
      template: 'src/index.html',
      inject: 'head'
    }),
    new ExtractTextPlugin({
      filename: 'css/app.css'
    }),
  ],
  module: {
    rules: [
      {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'stylus-loader'
          ]
        })
      },
    ]
  }
}

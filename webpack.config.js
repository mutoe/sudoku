const webpack = require('webpack')
const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './src/entry.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/bundle-[hash].js'
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HTMLPlugin({
      filename: 'index.html',
      template: 'src/index.pug',
      inject: 'head'
      // minify: {
      //   removeComments: true,
      //   collapseWhitespace: true
      // }
    }),
    new ExtractTextPlugin({
      filename: 'css/bundle.css'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /(node_modules|bower_components)/,
        include: path.resolve(__dirname, 'src/'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['env'],
            }
          }
        ]
      },
      {
        test: /\.styl$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            {
              loader: 'postcss-loader',
              options: { 
                plugins: [ require('autoprefixer')() ],
                sourceMap: 'inline', 
              }
            },
            'stylus-loader'
          ]
        })
      },
      {
        test: /\.pug$/,
        use: [
          'html-loader',
          { loader: 'pug-html-loader', options: { pretty: true } }
        ]
      }
    ]
  }
}

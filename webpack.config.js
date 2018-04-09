let path = require('path');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let UglifyJSPlugin = require('uglifyjs-webpack-plugin');
let FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let MakeDirWebpackPlugin = require('make-dir-webpack-plugin');


module.exports = env => {

  let plugins = [
    new CopyWebpackPlugin([
      { from: 'index.html', to: 'dist/index.html' },
      { from: 'data.json', to: 'dist/data.json' },
      { from: 'src/img', to: env && env.production ? 'dist/img' : 'img' },
      { from: 'src/js', to: env && env.production ? 'dist/js' : 'js' },
      { from: 'src/main.js', to: env && env.production ? 'dist/js' : 'js' },
      { from: 'src/css', to: env && env.production ? 'dist/css' : 'css' }
      // { from: 'src/main.css', to: env && env.production ? 'dist/css' : 'css' }
    ])
  ];

  if (env && env.production) {
    plugins = [
        new CleanWebpackPlugin('dist/'),
        new MakeDirWebpackPlugin({
            dirs: [
                { path: './dist/js' },
                { path: './dist/css' },
                { path: './dist/img' }
            ]
        }),
        ...plugins
    ]
  }

  let devServer = {
    overlay: {
      warning: false,
      error: true
    }
  };

  if (env && env.production) {
    plugins.push(new UglifyJSPlugin({
      comments: false,
      sourceMap: true
    }));
  }
  else {
    plugins.push(new FriendlyErrorsPlugin())
  }

  return {
    entry: './src/main.js',
    output: {
      filename: env && env.production ? 'dist/js/main.js' : 'js/main.js',
      sourceMapFilename: '[file].map'
    },
    devtool: env && env.production ? '' : 'cheap-eval-source-map',
    devServer: devServer,
    resolve: {
      extensions: ['.js']
    },
    module: {
      rules: [
        {
          enforce: 'pre',
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'eslint-loader',
          options: {
            quiet: !(env && env.production),
            formatter: require('eslint-friendly-formatter')
          }
        },
        { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
        {
          test: /\.css$/, exclude: /node_modules/, use: ['style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          }, 'postcss-loader']
        },
        {
          test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
          loader: 'url-loader',
          options: {
            limit: 10000,
          }
        }
      ]
    },
    plugins: plugins
  }
};

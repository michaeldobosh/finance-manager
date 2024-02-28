// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
// import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mode = process.env.NODE_ENV || 'development';

export default {
  mode,
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  module: {
    rules: [
      // {
      //   test: /\.pug$/,
      //   loader: '@webdiscus/pug-loader',
      // },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'assets',
        },
      },
    ],
  },
  plugins: [new MiniCssExtractPlugin(),
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, './server/views/index.pug'),
    //   filename: 'index.html',
    // }),
  ],
};

// @ts-check
import path from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import PugPlugin from 'pug-plugin';
// import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mode = process.env.NODE_ENV || 'development';

export default {
  mode,
  // entry: {
  //   index: './server/views/index.pug',
  // },
  output: {
    path: path.join(__dirname, 'dist/'),
  },
  module: {
    rules: [
      // {
      //   test: /\.pug$/,
      //   loader: PugPlugin.loader,
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
  plugins: [
    // new PugPlugin(),
    new MiniCssExtractPlugin(),
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, './server/views/layouts/application.pug'),
    //   filename: 'index.html',
    // }),
  ],
};

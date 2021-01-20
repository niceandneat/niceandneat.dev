import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import posthtml from 'posthtml';
import posthtmlInclude from 'posthtml-include';

import { loadPages, loadPosts } from './utils';

const devMode = process.env.NODE_ENV !== 'production';
const projectRoot = path.resolve(__dirname, '../');
const fromRootTo = (p: string) => path.resolve(projectRoot, p);
const sourceDir = 'src';
const jsDist = 'js';
const cssDist = 'css';

const pages = loadPages(devMode);
const posts = loadPosts(devMode);
const entry = { ...pages.entry, ...posts.entry };
const html = [...pages.html, ...posts.html];
console.log({ entry, html });

const HTMLLoaderOptions = {
  attributes: {
    root: fromRootTo(`./${sourceDir}`),
  },
  // Just for including static html files. (mostly for header)
  // I'd really like to write plain old html files, but I am too lazy to duplicate same header tags.
  preprocessor(content: string, loaderContext: any) {
    try {
      const result: any = posthtml([
        posthtmlInclude({ root: sourceDir }),
      ]).process(content, { sync: true });

      return result.html;
    } catch (error) {
      loaderContext.emitError(error);

      return content;
    }
  },
};

const config: webpack.Configuration = {
  context: projectRoot,
  entry,
  output: {
    filename: devMode
      ? `${jsDist}/[name].js`
      : `${jsDist}/[name].[contenthash].js`,
    assetModuleFilename: 'assets/[hash][ext][query]',
    path: fromRootTo('./dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      pages: fromRootTo(`./${sourceDir}/pages/`),
      utils: fromRootTo(`./${sourceDir}/utils/`),
      styles: fromRootTo(`./${sourceDir}/styles/`),
      assets: fromRootTo(`./${sourceDir}/assets/`),
    },
  },
  optimization: {
    runtimeChunk: 'single',
    minimizer: [
      '...',
      new CssMinimizerPlugin() as webpack.WebpackPluginInstance,
    ],
    splitChunks: {
      cacheGroups: {
        verdor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new BundleAnalyzerPlugin(),
    // new MiniCssExtractPlugin({
    //   filename: devMode
    //     ? `${cssDist}/[name].css`
    //     : `${cssDist}/[name].[contenthash].css`,
    //   chunkFilename: devMode
    //     ? `${cssDist}/[id].css`
    //     : `${cssDist}/[id].[contenthash].css`,
    //   // TODO : wait until new updates for type of MiniCssExtractPlugin
    // }) as any,
    ...html.map((options) => new HtmlWebpackPlugin(options)),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        options: HTMLLoaderOptions,
      },
      {
        test: /\.s[ac]ss$/i,
        type: 'asset/resource',
        generator: {
          filename: devMode
            ? `${cssDist}/[name].css`
            : `${cssDist}/[name].[contenthash].css`,
        },
        use: [
          // MiniCssExtractPlugin.loader,
          // {
          //   loader: 'css-loader',
          //   options: {
          //     importLoaders: 1,
          //   },
          // },
          // for Autoprefixer
          'postcss-loader',
          // for scss parsing
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [fromRootTo(`./${sourceDir}/styles/`)],
              },
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        type: 'asset/resource',
        generator: {
          filename: devMode
            ? `${cssDist}/[name].css`
            : `${cssDist}/[name].[contenthash].css`,
        },
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: 'html-loader',
            options: HTMLLoaderOptions,
          },
          {
            loader: fromRootTo('./config/loaders/markdown.ts'),
            options: {
              templatePath: fromRootTo(
                `./${sourceDir}/templates/markdown.html`,
              ),
            },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb
          },
        },
      },
    ],
  },
};

export default config;

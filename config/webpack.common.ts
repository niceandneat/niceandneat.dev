import webpack from 'webpack';
import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';

import { fromRootTo, loadPages, loadPosts, HTMLPreprocessor } from './utils';
import {
  PROJECT_ROOT,
  SOURCE_DIR,
  ASSET_DIR,
  IMAGE_DIR,
  POST_DIR,
  JS_DIST,
  CSS_DIST,
  IMAGE_DIST,
} from './settings';

const CI = !!process.env.CI;
const urlRoot = process.env.SITE_URL || 'https://niceandneat.dev/';
const devMode = process.env.NODE_ENV !== 'production';

const pages = loadPages(devMode);
const posts = loadPosts(devMode);
const entry = { ...pages.entry, ...posts.entry };
const html = [...pages.html, ...posts.html];
console.log({ entry, html });

const HTMLLoaderOptions = {
  attributes: {
    root: fromRootTo(`./${SOURCE_DIR}`),
    // https://github.com/webpack-contrib/html-loader#list
    list: [
      '...',
      {
        tag: 'meta',
        attribute: 'content',
        type: 'src',
        filter: (
          tag: string,
          attribute: string,
          attributes: Record<string, string>,
        ) => {
          if (
            attributes.property &&
            attributes.property.trim().toLowerCase() === 'og:image'
          ) {
            return true;
          }

          return false;
        },
      },
    ],
  },
  preprocessor: HTMLPreprocessor(urlRoot, SOURCE_DIR),
};

const config: webpack.Configuration = {
  context: PROJECT_ROOT,
  entry,
  output: {
    filename: devMode
      ? `${JS_DIST}/[name].js`
      : `${JS_DIST}/[name].[contenthash].js`,
    path: fromRootTo('./dist'),
    publicPath: '/',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      pages: fromRootTo(`./${SOURCE_DIR}/pages/`),
      utils: fromRootTo(`./${SOURCE_DIR}/utils/`),
      styles: fromRootTo(`./${SOURCE_DIR}/styles/`),
      assets: fromRootTo(`./${SOURCE_DIR}/assets/`),
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
    new BundleAnalyzerPlugin({ analyzerMode: CI ? 'disabled' : 'server' }),
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
            ? `${CSS_DIST}/[name].css`
            : `${CSS_DIST}/[name].[contenthash].css`,
        },
        use: [
          // for Autoprefixer
          'postcss-loader',
          // for scss parsing
          {
            loader: 'sass-loader',
            options: {
              sassOptions: {
                includePaths: [fromRootTo(`./${SOURCE_DIR}/styles/`)],
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
            ? `${CSS_DIST}/[name].css`
            : `${CSS_DIST}/[name].[contenthash].css`,
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
            loader: fromRootTo('./config/loaders/htmlBridge.ts'),
            options: {
              templatePath: fromRootTo(
                `./${SOURCE_DIR}/templates/markdown.html`,
              ),
            },
          },
          {
            loader: fromRootTo('./config/loaders/markdown.ts'),
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
        generator: {
          filename(pathData: any) {
            const paths = pathData.filename.split(path.sep);

            // for posts images
            if (paths[1] === POST_DIR) {
              return `${IMAGE_DIST}/posts/${paths[2]}/[name][ext]`;
            }

            // for assets images
            if (paths[1] === ASSET_DIR) {
              const imageRoot = path.join(SOURCE_DIR, ASSET_DIR, IMAGE_DIR);
              const imagePath = path.relative(imageRoot, pathData.filename);

              return `${IMAGE_DIST}/${imagePath}`;
            }

            return `${IMAGE_DIST}/[name][ext]`;
          },
        },
      },
    ],
  },
};

export default config;

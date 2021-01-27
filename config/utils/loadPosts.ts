import fs from 'fs';
import path from 'path';
import { Options as HTMLWebpackPluginOptions } from 'html-webpack-plugin';

import { PROJECT_ROOT, POST_ROOT } from '../settings';
import { getRoute, getEntryKey } from './common';

export function loadPosts(devMode: boolean) {
  const entry: { [key: string]: string } = {};
  const html: HTMLWebpackPluginOptions[] = [];
  const htmlDist = devMode ? 'posts/' : 'html/posts/';

  function findEntry(directory: string, filename: string) {
    if (!/^index\.tsx?$/.test(filename)) return;

    const key = `posts/${getEntryKey(POST_ROOT, directory)}`;
    const value = `./${path.relative(
      PROJECT_ROOT,
      path.resolve(directory, filename),
    )}`;

    entry[key] = value;
  }

  function findHTML(directory: string, filename: string) {
    const directoryName = path.basename(directory);
    if (filename !== `${directoryName}.md`) return;

    const route = getRoute(POST_ROOT, directory);

    const htmlOptions: HTMLWebpackPluginOptions = {
      filename: path.join(`${htmlDist}${route}`, 'index.html'),
      template: path.relative(PROJECT_ROOT, path.resolve(directory, filename)),
      chunks: [`posts/${getEntryKey(POST_ROOT, directory)}`],
      favicon: path.resolve(PROJECT_ROOT, 'src/assets/images/favicon.ico'),
      // minify: { collapseWhitespace: true },
    };

    html.push(htmlOptions);
  }

  const directories = fs.readdirSync(POST_ROOT, { withFileTypes: true });
  for (const directory of directories) {
    if (directory.isDirectory()) {
      const directoryPath = path.resolve(POST_ROOT, directory.name);
      const children = fs.readdirSync(directoryPath, { withFileTypes: true });

      for (const child of children) {
        if (child.isDirectory()) {
          continue;
        }

        findEntry(directoryPath, child.name);
        findHTML(directoryPath, child.name);
      }
    }
  }

  return { entry, html };
}

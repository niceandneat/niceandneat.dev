import fs from 'fs';
import path from 'path';
import { Options as HTMLWebpackPluginOptions } from 'html-webpack-plugin';

import { PROJECT_ROOT, PAGE_ROOT, SOURCE_DIR } from '../settings';
import { getRoute, getEntryKey } from './common';

type LoopDirsCallback = (directory: string, child: fs.Dirent) => void;

export function loadPages(devMode: boolean) {
  const entry: { [key: string]: string } = {};
  const html: HTMLWebpackPluginOptions[] = [];
  const htmlDist = devMode ? '' : 'html/';

  function findEntry(directory: string, filename: string) {
    if (!/^index\.tsx?$/.test(filename)) return;

    const key = getEntryKey(PAGE_ROOT, directory);
    const value = `./${path.relative(
      PROJECT_ROOT,
      path.resolve(directory, filename),
    )}`;
    entry[key] = value;
  }

  function findHTML(directory: string, filename: string) {
    if (filename !== 'index.html') return;

    const route = getRoute(PAGE_ROOT, directory);

    const htmlOptions: HTMLWebpackPluginOptions = {
      filename: path.join(`${htmlDist}${route}`, 'index.html'),
      template: path.relative(PROJECT_ROOT, path.resolve(directory, filename)),
      chunks: [getEntryKey(PAGE_ROOT, directory)],
      favicon: path.resolve(PROJECT_ROOT, 'src/assets/images/favicon.ico'),
      minify: { collapseWhitespace: true },
    };

    html.push(htmlOptions);
  }

  function findEntryAndHTML(directory: string, child: fs.Dirent) {
    if (child.isFile()) {
      findEntry(directory, child.name);
      findHTML(directory, child.name);
    }
  }

  makeLoopDirs(findEntryAndHTML)(PAGE_ROOT);

  return { entry, html };
}

/**
 * mics private functions
 */

function makeLoopDirs(func: LoopDirsCallback) {
  function loopDirs(directory: string) {
    const children = fs.readdirSync(directory, { withFileTypes: true });

    for (const child of children) {
      func(directory, child);
      if (child.isDirectory() && path.basename(child.name) !== SOURCE_DIR) {
        loopDirs(path.resolve(directory, child.name));
      }
    }
  }

  return loopDirs;
}

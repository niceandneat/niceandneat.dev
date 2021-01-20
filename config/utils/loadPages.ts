import fs from 'fs';
import path from 'path';
import { Options as HTMLWebpackPluginOptions } from 'html-webpack-plugin';

const indexPage = 'main';
const sourceDir = 'src';

const root = path.resolve(__dirname, '../../');
const pageRoot = path.resolve(root, './src/pages');

type LoopDirsCallback = (parent: string, child: fs.Dirent) => void;

export function loadPages(devMode: boolean) {
  const entry: { [key: string]: string } = {};
  const html: HTMLWebpackPluginOptions[] = [];
  const htmlDist = devMode ? '' : 'html/';

  function findEntry(parent: string, child: string) {
    if (!/^index\.tsx?$/.test(child)) return;

    const entryKey = getEntryKey(pageRoot, parent);
    const entryValue = `./${path.relative(root, path.resolve(parent, child))}`;
    entry[entryKey] = entryValue;
  }

  function findHTML(parent: string, child: string) {
    if (child !== 'index.html') return;

    const htmlFileName =
      path.basename(parent) === indexPage
        ? 'index.html'
        : path
            .relative(pageRoot, path.resolve(parent, child))
            .replace(/\.+[/\\]/g, '');

    const htmlOptions: HTMLWebpackPluginOptions = {
      filename: `${htmlDist}${htmlFileName}`,
      template: path.relative(root, path.resolve(parent, child)),
      chunks: [getEntryKey(pageRoot, parent)],
      favicon: path.resolve(root, 'src/assets/images/favicon.ico'),
      minify: { collapseWhitespace: true },
    };

    html.push(htmlOptions);
  }

  function findEntryAndHTML(parent: string, child: fs.Dirent) {
    if (child.isFile()) {
      findEntry(parent, child.name);
      findHTML(parent, child.name);
    }
  }

  makeLoopDirs(findEntryAndHTML)(pageRoot);

  return { entry, html };
}

/**
 * mics private functions
 */

function makeLoopDirs(func: LoopDirsCallback) {
  function loopDirs(parent: string) {
    const children = fs.readdirSync(parent, { withFileTypes: true });

    for (const child of children) {
      func(parent, child);
      if (child.isDirectory() && path.basename(child.name) !== sourceDir) {
        loopDirs(path.resolve(parent, child.name));
      }
    }
  }

  return loopDirs;
}

function getEntryKey(root: string, target: string) {
  return path.relative(root, target).toString().replace(/\//g, '.');
}

import fs from 'fs';
import path from 'path';
import { Options as HTMLWebpackPluginOptions } from 'html-webpack-plugin';

const root = path.resolve(__dirname, '../../');
const postRoot = path.resolve(root, './src/posts');

export function loadPosts(devMode: boolean) {
  const entry: { [key: string]: string } = {};
  const html: HTMLWebpackPluginOptions[] = [];
  const htmlDist = devMode ? 'posts/' : 'html/posts/';
  const directories = fs.readdirSync(postRoot, { withFileTypes: true });

  for (const directory of directories) {
    if (directory.isDirectory()) {
      const directoryPath = path.resolve(postRoot, directory.name);
      const children = fs.readdirSync(directoryPath, { withFileTypes: true });

      for (const child of children) {
        if (child.isDirectory()) {
          continue;
        }

        findEntry(directory.name, child.name);
        findHTML(directory.name, child.name);
      }
    }
  }

  function findEntry(directory: string, filename: string) {
    if (!/^index\.tsx?$/.test(filename)) return;

    const key = getEntryKey(directory);
    const value = `./${path.relative(
      root,
      path.resolve(postRoot, directory, filename),
    )}`;

    entry[key] = value;
  }

  function findHTML(directory: string, filename: string) {
    if (filename !== `${directory}.md`) return;

    const htmlOptions: HTMLWebpackPluginOptions = {
      filename: `${htmlDist}${directory}/index.html`,
      template: path.relative(
        root,
        path.resolve(postRoot, directory, filename),
      ),
      chunks: [getEntryKey(directory)],
      favicon: path.resolve(root, 'src/assets/images/favicon.ico'),
      minify: { collapseWhitespace: true },
    };

    html.push(htmlOptions);
  }

  return { entry, html };
}

function getEntryKey(directory: string) {
  return `post-${directory}`;
}

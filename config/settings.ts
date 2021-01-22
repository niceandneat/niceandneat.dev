import path from 'path';

export const SOURCE_DIR = 'src';
export const POST_DIR = 'posts';
export const PAGE_DIR = 'pages';
export const ASSET_DIR = 'assets';
export const IMAGE_DIR = 'images';
export const JS_DIST = 'js';
export const CSS_DIST = 'css';
export const IMAGE_DIST = 'images';
export const INDEX_PAGE = 'main';

export const PROJECT_ROOT = path.resolve(__dirname, '../');
export const POST_ROOT = path.resolve(
  PROJECT_ROOT,
  `${SOURCE_DIR}/${POST_DIR}`,
);
export const PAGE_ROOT = path.resolve(
  PROJECT_ROOT,
  `${SOURCE_DIR}/${PAGE_DIR}`,
);

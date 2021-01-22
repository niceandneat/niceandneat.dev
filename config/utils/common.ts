import path from 'path';
import { INDEX_PAGE, PROJECT_ROOT } from '../settings';

export function fromRootTo(p: string) {
  return path.resolve(PROJECT_ROOT, p);
}

export function onlyName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '');
}

export function changeExt(fileName: string, ext: string) {
  return `${onlyName(fileName)}.${ext}`;
}

export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/([{}[\]/?.,;:|)*~`!^+<>@#$%&\\=('"-]|\s)+/gi, '-');
}

export function getRoute(root: string, directory: string) {
  const relative = path.relative(root, directory);

  if (relative === INDEX_PAGE) {
    return '';
  }

  return relative.replace(/\.+[/\\]/g, '');
}

export function getEntryKey(root: string, directory: string) {
  return path.relative(root, directory).toString();
}

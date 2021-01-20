export function onlyName(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '');
}

export function changeExt(fileName: string, ext: string) {
  return `${onlyName(fileName)}.${ext}`;
}

export function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/([{}[\]/?.,;:|)*~`!^+<>@#$%&\\=('"]|\s)+/gi, '-');
}

import fs from 'fs';
import path from 'path';
import posthtml from 'posthtml';
import posthtmlExpressions from 'posthtml-expressions';

import { onlyName, getPostImageDist } from '../utils';

interface HtmlBridgeLoaderOptions {
  templatePath?: string;
  postImage?: string;
}

export default function htmlBridgeLoader(
  this: any,
  source: string,
  map: any,
  meta: any,
) {
  const { templatePath }: HtmlBridgeLoaderOptions = this.getOptions();
  const { frontMatter } = meta;
  // const postName = onlyName(path.basename(this.resourcePath));
  // const postImage = path.basename(frontMatter.image);
  // frontMatter.image = getPostImageDist(postName, postImage);

  this.addDependency(templatePath);

  const template = templatePath && fs.readFileSync(templatePath).toString();
  const html = replaceAttrs(frontMatter, template);

  this.callback(null, html, map, meta);
  return;
}

function replaceAttrs(frontMater: Record<string, string>, template?: string) {
  if (!template) {
    return frontMater.markdown;
  }

  const result: any = posthtml([
    posthtmlExpressions({ locals: frontMater }),
  ]).process(template, { sync: true });

  return result.html;
}

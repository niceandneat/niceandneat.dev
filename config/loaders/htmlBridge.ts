import fs from 'fs';
import posthtml from 'posthtml';
import posthtmlExpressions from 'posthtml-expressions';

interface HtmlBridgeLoaderOptions {
  templatePath?: string;
}

export default function htmlBridgeLoader(
  this: any,
  source: string,
  map: any,
  meta: any,
) {
  const callback = this.async();
  const { templatePath }: HtmlBridgeLoaderOptions = this.getOptions();
  const { frontMatter } = meta;

  this.addDependency(templatePath);

  const template = templatePath && fs.readFileSync(templatePath).toString();
  const html = replaceAttrs(frontMatter, template);

  callback(null, html, map, meta);
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

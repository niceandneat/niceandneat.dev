import path from 'path';
import posthtml from 'posthtml';
import posthtmlInclude from 'posthtml-include';
import posthtmlExpressions from 'posthtml-expressions';

import { PAGE_ROOT, POST_ROOT, IMAGE_DIST } from '../settings';
import { getRoute } from './common';

// Just for including static html files. (mostly for header)
// I'd really like to write plain old html files, but I am too lazy to duplicate same header tags.
export function HTMLPreprocessor(urlRoot: string, sourceDir: string) {
  return function preprocessor(content: string, loaderContext: any) {
    const url = `${urlRoot}${route(loaderContext.resourcePath)}`;
    const imageUrl = `${urlRoot}${IMAGE_DIST}/`;

    const expressions = {
      delimiters: ['[[', ']]'],
      unescapeDelimiters: ['[[[', ']]]'],
      locals: {
        url,
        imageUrl,
      },
    };

    try {
      const afterInclude: any = posthtml([
        posthtmlInclude({ root: sourceDir }),
      ]).process(content, { sync: true });

      const result: any = posthtml([
        posthtmlExpressions(expressions),
      ]).process(afterInclude.html, { sync: true });

      return result.html;
    } catch (error) {
      loaderContext.emitError(error);

      return content;
    }
  };
}

function route(resource: string) {
  const ext = path.extname(resource);
  const directory = path.dirname(resource);

  if (ext === '.md') {
    return `posts/${getRoute(POST_ROOT, directory)}`;
  } else {
    return getRoute(PAGE_ROOT, directory);
  }
}

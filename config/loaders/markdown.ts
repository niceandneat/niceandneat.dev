import fs from 'fs';
import marked from 'marked';
import fm from 'front-matter';
import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/';
import { slug } from '../utils';

const supportLanguages = [
  'html',
  'css',
  'scss',
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'bash',
];

loadLanguages(supportLanguages);

const defaultOptions: marked.MarkedOptions = {
  langPrefix: 'language-',
  highlight(code, lang) {
    if (!lang) {
      return code;
    }

    lang = lang.toLowerCase();

    if (!supportLanguages.includes(lang)) {
      throw new Error(
        `unsupported language [${lang}]\nPlease use languages in ${supportLanguages}`,
      );
    }

    return Prism.highlight(code, Prism.languages[lang], lang);
  },
};

const extendOptions: any = {
  renderer: {
    heading(text: string, level: number) {
      const escapedText = slug(text);

      return `
            <h${level}>
              ${text}
              <a name="${escapedText}" class="anchor" href="#${escapedText}">
                <span class="header-link"></span>
              </a>
            </h${level}>`;
    },
    // Modification of https://github.com/markedjs/marked/blob/master/src/Renderer.js#L15
    code(this: any, code: string, infostring: string) {
      const lang = (infostring || '').match(/\S*/)?.[0];

      if (this.options.highlight) {
        const out = this.options.highlight(code, lang);
        if (out != null && out !== code) {
          code = out;
        }
      }

      const className = this.options.langPrefix + lang;

      return (
        '<div class="blog-highlight">' +
        '<pre class="' +
        className +
        '">' +
        '<code class="' +
        className +
        '">' +
        code +
        '</code></pre></div>'
      );
    },
    codespan(this: any, text: string) {
      const className = this.options.langPrefix;

      return `<code class="${className}">${text}</code>`;
    },
  },
};

// Set marked options & renderers
marked.setOptions(defaultOptions);
marked.use(extendOptions);

interface MarkdownLoaderOptions extends marked.MarkedOptions {
  templatePath?: string;
}

export default function markdownLoader(this: any, source: string) {
  const {
    templatePath,
    ...markedOptions
  } = this.getOptions() as MarkdownLoaderOptions;
  this.addDependency(templatePath);

  const frontMatter = fm<Record<string, string>>(source);
  const markdown = marked(frontMatter.body, markedOptions);
  const attributes = { ...frontMatter.attributes, markdown };
  const template = templatePath && fs.readFileSync(templatePath).toString();
  const html = replaceAttrs(attributes, template);

  return html;
}

function replaceAttrs(attributes: Record<string, string>, template?: string) {
  if (!template) {
    return attributes.markdown;
  }

  return Object.entries(attributes).reduce((res, [key, value]) => {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    return res.replace(regex, value);
  }, template);
}
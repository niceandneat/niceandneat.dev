---
title: (불편하게) 블로그 만들기
date: '2021-01-18'
description: 웹의 뿌리를 느끼기 위해 HTML 파일 생성부터 배포까지 일부러 불편하게 만들었던 블로그 이야기입니다.
---

> 이 글은 독자가 Webpack, Docker등 여기서 다루는 기술에 어느정도 익숙하다 가정하고 작성되었습니다.

> 제가 글솜씨가 부족하기도 하고 생각보다 다룰 내용이 많아 코드와 내용을 많이 생략했습니다. 중간중간 걸어둔 링크와 [Github](https://github.com/niceandneat/niceandneat.dev)을 참조해주세요!

## 선택

힘들었던 한 학기가 끝나고 모처럼 여유로운 방학이 생겼다. 미루고 미뤘던 블로그를 만들어 보고싶어졌다.

블로그를 만드는 방법은 정말 다양하다. Node.js로 **Server Side Rendering** 서버 ([Next.js](https://nextjs.org/), [Express + Template Engine](https://expressjs.com/en/resources/template-engines.html))를 만들어 **PaaS** ([Netlify](https://www.netlify.com/), [Heroku](https://www.heroku.com/), [Firebase](https://firebase.google.com/))에 올려두면 된다. 아니면 **Static Site Generator** ([Gatsby](https://www.gatsbyjs.com/), [Hugo](https://gohugo.io/), [Jekyll](https://jekyllrb.com/))를 이용해 static file들을 만든 뒤 [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html), [Github Pages](https://pages.github.com/) 등을 이용해 간단히 호스팅해도 된다. 사실 이런거 저런거 만들 필요없이 이미 잘 만들어진 [티스토리](https://www.tistory.com/), [Velog](https://velog.io/), [Medium](https://medium.com/) 등을 이용해도 된다.

이렇게 많은 선택지를 보다보니 오히려 좀 더 다르게 만들어보고 싶다는 생각이 들었다. 회사에서는 React를 주로 사용해서 HTML, CSS를 직접 다룰일이 거의 없었다. 게다가 CRA나 Next.js를 사용하면 번들링을 신경쓸 일도 별로 없다. 그렇다보니 HTML, CSS, Javascript 3인방에게 너무 소홀해진 감이 있다. 이번 기회에 웹페이지 만드는 과정을 최대한 온전히 느끼면서 **불편하게** 블로그를 만들면, 이것이 다시 웹의 근본을 찾을 수 있는 기회가 되지 않을까.

하지만 이 생각만이 불편하게 만드는 이유의 전부는 아니었다. 블로그 만들기에 앞서서 스스로 여러가지 요구사항이 있었다.

1. 블로그이긴 하지만 글을 많이 쓸 것 같지는 않다. 글보다는 앞으로 만들 작은 프로젝트들의 링크를 모아두는 게 주요목적이다. 개별 프로젝트 레포지토리들이 블로그의 도메인을 사용해 배포되면 좋겠다.

2. 그래도 글을 쓸 수는 있어야한다. HTML이 아닌 별도의 문서 파일을 이용해 포스트들을 관리하지만 포스트 내부에서 스크립트도 실행할 수 있어야한다. 스크립트는 해당 문서 파일 내부가 아닌 별도의 코드 파일로 관리하고 싶다.

3. 간단한 자기소개 페이지가 있으면 좋겠다. 또 앞으로 여러 페이지가 추가될 수 있으므로 쉽게 원하는 route를 생성할 수 있어야 한다.

힙스터 감성과 위 요구사항을 동시에 만족시키기 위해 어떤 시행착오를 겪었는지 적어보려고 한다.

## Bundling : Webpack

모든 과정중에서 가장 많은 시간을 들였던 부분이다. 번들링 작업 없이 블로그의 각 페이지에 들어갈 HTML와 Asset들을 손으로 구성해서 넣어도 된다. 하지만 중복되는 코드 재사용, 외부 라이브러리 사용, Minify 나 Autoprefix 등의 post process, Typescript 빌드 등 일일이 하기엔 손이 많이 가는 작업들을 줄이기 위해서 자동화된 번들링 시스템이 필요했다. [Webpack](https://webpack.js.org/)을 이용해 블로그의 번들링 시스템을 만들었다.

### HTML

이 블로그에서 HTML을 만드는 방법은 두가지가 있다. `.html` 파일에서 만드는 방법과 `.md` 파일에서 만드는 방법이다. `.md` 파일은 포스트 문서를 위해 사용하고 나머지 페이지는 `.html` 파일로부터 만들어 진다. 먼저 `.html` 파일에서 만드는 방법을 살펴보고자 한다. 여기에도 여러가지 선택지가 있었다.

#### HTML 첫번째 시도 : Template Engine

먼저 [EJS](https://github.com/mde/ejs)나 [Handlebars](https://github.com/handlebars-lang/handlebars.js) 같은 template engine을 사용해보려고 했다. 각각 webpack loader도 제공해서 [HTML Webpack Plugin](https://github.com/jantimon/html-webpack-plugin)의 `template` option을 작성한 파일로 설정하면 어렵지 않게 HTML을 생성할 수 있었다. 특히 Handlebars같은 경우 Prtials, Helpers같은 다양한 편의 기능을 제공해 코드 재사용이 쉬웠다.

하지만 문제점들도 있었다.

1. 추가된 문법이 기존 HTML과 많이 다르다.

2. VSCode에서 Extension Support가 좋지 못하다.

3. 머리속에 훨씬 좋은 대안이 자꾸 떠오른다... JSX!

#### HTML 두번째 시도 : React

[이 포스트](https://dev.to/jantimon/html-webpack-plugin-4-has-been-released-125d)에서 template engine으로 React를 사용하는 것을 보고 당장 시도해봤다. `ReactDOMServer.renderToString()`을 이용해 React component를 HTML string으로 바꿔서 사용한다. 묘하게 어색한 template engine들을 쓰다가 component들로 착착 분리해서 만드니까 행복했다.

하지만 여기에도 문제점이 있었다. 아래 코드를 보자.

```tsx
import React from 'react';

import './awesomeStyle.css';

export function AwesomeComponent() {
  return <div className="awesome-class">AWESOME!!!</div>;
}
```

만약 이 코드가 Client Side Rendering을 하는 component였다면 전혀 이상할 것이 없다. `MiniCssExtractPlugin`이 마법같이 `./awesomeStyle.css`를 찾아 output 폴더에 넣어줄 것이다. 하지만 위의 코드는 빌드과정에서 HTML string을 만들기 위해 실행된다. 즉 이 코드는 `entry` 파일이 아니라 `HTMLWebpackPlugin`의 `template`으로 사용된다. `HTMLWebpackPlugin`으로 위 파일을 컴파일 하면 다음과 같은 에러가 발생한다.

```
CodeGenerationError: No template for dependency: CssDependency
```

`template` 실행과정에서 만난 `.css` 파일을 처리할 때 어떤 이유인지 `HTMLWebpackPlugin`과 `MiniCssExtractPlugin`이 충돌을 일으킨다. 아마 `MiniCssExtractPlugin`을 사용하면 JS 파일이 아닌 곳에서 CSS 파일을 `import`할 경우 webpack이 어떻게 처리할 지 모르는 것 같지만 정확한 건 코드를 까봐야 알 것 같다. CSS파일들을 component별로 import하지 않고 따로 작성하고 파일의 경로를 HTML string에 직접 `<link>` 태그로 넣어두면, `file-loader`나 Webpack 5의 `type: 'asset/resource'` 옵션을 통해 빌드할 수 있다.

> 뒤에서 설명하겠지만 SCSS를 사용하게 되면서 위와 같이 스타일 파일들을 문서와 따로 관리하는 방식을 채택했다.

하지만 component의 코드와 스타일이 따로 관리되는 것은 React 스럽지 않다고 판단해 이 방법은 보류하기로 했다. 이후에 loader나 plugin을 더 깊게 이해한 뒤에 건드려볼 수 있을 것 같다.

#### HTML 세번째 시도 : HTML?

처음에 `.html` 파일에서 HTML을 만든다는게 무슨말인가 의아할 수도 있었을 것이다. 어차피 마음에 드는 template engine도 없으니 그냥 HTML을 직접 작성하는 편이 좋다고 생각했다. 그래서 HTML Webpack Plugin의 `template` 옵션을 직접 작성한 `.html` 파일로 지정했다.

두번째 `.html`을 작성하려고 할 때 바로 문제가 발생했다. 같은 내용의 `<head>` 태그를 넣기가 너무 귀찮았다. `html-loader`의 [공식문서](https://github.com/webpack-contrib/html-loader#posthtml)에서 [PostHTML](https://github.com/posthtml/posthtml)을 사용하는 것을 보고 시도해봤다. Plugin은 HTML 태그 재사용을 위한 [Include Plugin](https://github.com/posthtml/posthtml-include)과 [Expressions Plugin](https://github.com/posthtml/posthtml-include)을 사용했다. 기존 HTML의 문법을 해치지 않는 선에서 HTML 코드를 재사용할 수 있었다. 앞서 Template Engine의 단점이었던 부분을 보완해 꽤 괜찮다고 느껴 이 방법을 채택하기로 했다. 이렇게 결국 `.html` 파일에서 HTML을 만들게 되었다.

### Markdown

블로그 포스트 내용을 기록하기 위해 Markdown(`.md`)파일을 사용했다. Gatsby를 사용할 때 Markdown 파일을 HTML 파일로 바꿔주는 [Plugin](https://www.gatsbyjs.com/plugins/gatsby-transformer-remark/?=mark)이 정말 좋았었는데 비슷한 것을 구현해보고 싶었다. 최소한 다음과 같은 기능이 있었으면 했다.

1. Markdown 파일을 HTML 파일로 변환한다.

2. 이때 각 markdown 토큰 별로 생성되는 HTML 태그를 설정 가능하다.

3. 포스트 내부의 코드를 스타일링 한다.

4. [frontmatter](https://jekyllrb.com/docs/front-matter/)를 사용한다.

5. 이미 존재하는 template을 사용할 수 있다. (같은 내용의 `<head>` 태그를 넣기가 귀찮다.)

1번 기능을 제공하는 [markdown-loader](https://github.com/peerigon/markdown-loader)가 이미 존재했다. 하지만 나머지 기능들을 위해 새로 markdown loader를 만들기로 했다.

**config/loaders/markdown.ts**

```typescript
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

// ...아래에 이어서
```

[Prismjs](https://prismjs.com/)를 이용한 코드 하이라이팅 로직과 code, codespan, heading 토큰에 대한 HTML 태그 렌더링 로직을 설정하는 부분이다. 렌더러를 작성할 때 [소스코드](https://github.com/markedjs/marked/blob/master/src/Renderer.js)를 참고했다. 맨마지막의 `marked.setOptions(defaultOptions)`와 `marked.use(extendOptions)`를 통해 marked에 기본 옵션과 렌더러를 설정해준다. 앞으로 marked를 통해 코드를 렌더링할 때 Prism으로 하이라이트 처리된다.

**config/loaders/markdown.ts**

```typescript
// ...위에 이어서

import marked from 'marked';
import fm from 'front-matter';

export default function markdownLoader(
  this: any,
  source: string,
  map: any,
  meta: any = {},
) {
  const options = (this.getOptions() as marked.MarkedOptions) || {};
  const frontMatter = fm<Record<string, string>>(source);
  const markdown = marked(frontMatter.body, options);
  meta.frontMatter = { ...frontMatter.attributes, markdown };

  this.callback(null, markdown, map, meta);
  return;
}
```

Loader 코드부분이다. 현재 Webpack 5에서 loader의 `this` type을 제공해주지 않아 `any`로 설정해 두었다.

Loader 함수 내부에서는 우선 [front-matter](https://github.com/jxson/front-matter)를 사용해 markdown `source`에서 `attributes`와 `body`를 분리한다. `body` 부분 만을 [marked](https://github.com/markedjs/marked)를 이용해 HTML string으로 변환했다. 이때 loader 옵션을 marked의 추가 옵션으로 사용한다. 만들어진 HTML string을 기존 `frontMatter.attribute`와 함께 `meta`에 넣어준다. `meta`는 loader의 실행과정에서 임의로 다음 loader로 전달할 수 있는 인자이다. 여기에 `frontMatter`를 담아 다음 loader에서 `frontMatter`결과를 사용할 수 있게한다.

위 작업만으로는 그저 HTML string만 결과로 나올 뿐이다. 렌더링된 string 결과와 `frontMatter`를 이용해 실제 HTML을 만들어줄 필요가 있다. 현재 PostHTML을 사용하고 있으므로 이에 맞춘 htmlBridge loader를 작성했다. 앞으로 PostHTML을 계속 쓰게되지 않을 수도 있으므로 앞의 markdown loader와 일부러 분리해서 만들었다.

**config/loaders/htmlBridge.ts**

```typescript
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
```

`MarkdownLoaderOptions`은 webpack에서 loader를 사용할 때 받는 옵션의 타입이다. loader가 전달받은 HTML string을 사용할 template의 경로인 `templatePath`를 추가했다. 불러온 template 파일에 `meta.frontMatter`의 값들을 넣어 `html-laoder`에 넘길 최종 HTML string을 만들었다.

**config/loaders/htmlBridge.ts**

```typescript
function replaceAttrs(frontMater: Record<string, string>, template?: string) {
  if (!template) {
    return frontMater.markdown;
  }

  const result: any = posthtml([
    posthtmlExpressions({ locals: frontMater }),
  ]).process(template, { sync: true });

  return result.html;
}
```

`replaceAttrs()`에서는 `posthtml-expressions`을 사용해 frontmatter의 값들과 markdown 변환 결과를 template 파일의 해당하는 부분에 넣어준다. 아래는 template 파일의 예시이다.

**src/templates/markdown.html**

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <include src="templates/meta.html">
      { "title": "@{{ title }}", "description": "@{{ description }}" }
    </include>
  </head>
  <body>
    <include src="templates/header.html"></include>
    <main class="main">
      <div class="markdown-front">
        <h1 class="markdown-front__title">@{{ title }}</h1>
        <div class="markdown-front__date">@{{ date }}</div>
      </div>
      <div class="markdown">@{{ markdown }}</div>
    </main>
    <include src="templates/footer.html"></include>
  </body>
</html>
```

위에서 `@{{ key }}` 이렇게 중괄호 두개로 묶인 부분을 `frontmatter`의 각 `key`에 해당하는 `value`로 변경해준다. 즉 frontmatter와 markdown의 HTML 변환 결과를 가지고 새로운 HTML string을 만들게 된다. 이렇게 생성된 string은 `html-lodaer`로 흘러들어가 다른 HTML 파일들과 같은 과정을 거치게 된다.

### SCSS

CSS대신에 [SCSS(SASS)](https://sass-lang.com/)를 사용했다. SCSS의 variable, mixin, nesting 등의 기능이 매력적으로 다가왔고 이번 기회에 써보자는 생각이 들었다. 이미 [sass-loader](https://github.com/webpack-contrib/sass-loader)도 존재했으므로 사용 자체는 쉬웠다. 문제는 생성된 CSS 파일을 HTML에 연결하는 방법이다. 여기에도 여러가지 방법이 존재한다.

1. [style-loader](https://github.com/webpack-contrib/style-loader)

   CSS를 DOM을 통해 `<style>` 태그로 넣어준다.

2. [asset/resource](https://webpack.js.org/guides/asset-modules/)

   CSS를 내용 그대로 파일로 만들어 준다.

3. [MiniCssExtractPlugin](https://github.com/webpack-contrib/mini-css-extract-plugin)

   JS 파일마다 import 한 CSS들을 묶어서 파일로 만들어주고 `HTMLWebpackPlugin` 함께 사용하면 HTML 파일에 넣어주기까지 한다.

분명 더 많지만 대표적으로 위 세가지가 존재한다. 처음에는 당연히 있어보이는 `MiniCssExtractPlugin`으로 HTML에 CSS를 넣었다. 하지만 이러면 스크립트가 필요하지 않은 페이지도 `index.ts`를 만들어서 SCSS 파일을 import 해줘야만 했다. 이게 싫어서 HTML 파일에 직접 `<link>` 태그를 만들어서 넣으면 [HTML React](#html-두번째-시도-react)에서와 같은 에러가 발생한다.

Sass Guideline의 [Architecture](https://sass-guidelin.es/#architecture) 항목을 보고 스타일(SCSS)파일을 문서와 따로 관리하는 방법도 좋아보였다. React로 개발하면서 항상 스타일과 마크업이 같이 묶여서 다녀야 한다는 고정관념이 있었다. 하지만 지금 이 블로그 같이 비슷한 디자인이 항상 나타나고(예: Header, Footer) 페이지 수도 적을 때에는 스타일을 따로 관리해 빌드할 때 하나의 파일로 합치는 것도 괜찮다고 생각했다.

**src/styles/index.scss**

```scss
@import './reset';
@import './common';
@import './colors';
@import './utils';

@import './components/header.scss';
@import './components/footer.scss';
@import './components/markdown.scss';

@import './pages/main.scss';
@import './pages/about.scss';
```

**src/templates/meta.html**

```html
<!-- 생략 -->

<link rel="stylesheet" href="/styles/index.scss" />
```

따라서 위와 같이 모든 SCSS파일을 불러오는 하나의 root 파일(`index.scss`)을 만들어 두고 이 파일을 HTML 파일에서 `<link>` 태그로 포함시켰다.

**config/webpack.common.ts**

```typescript
// 설명을 위해 간략화한 코드이다.

{
  test: /\.s[ac]ss$/i,
  type: 'asset/resource',
  generator: {
    filename: '[name].[contenthash].css',
  },
  use: [
    'postcss-loader',
    'sass-loader'
  ],
},
```

Loader는 위처럼 `sass-loader`와 Autoprefix를 위한 `postcss-loader`만 사용했다. `type: 'asset/resource'` 옵션이 loader 실행 결과로 나온 string을 파일로 저장해준다. 이제 SCSS 파일의 경로를 HTML 파일에 직접 `<link>` 태그를 만들어서 넣으면 빌드 결과 만들어진 파일의 경로로 바뀌어 잘 동작한다.

### Routing

Next.js의 [pages](https://nextjs.org/docs/routing/introduction)와 같이 폴더구조가 그대로 Routing에 반영되는 기능을 만들고 싶었다. Webpack의 `entry` 옵션과 [HtmlWebpackPlugin](https://github.com/jantimon/html-webpack-plugin) 들을 지정된 `pages` 폴더에 존재하는 디렉토리와 파일에 따라 적절하게 만들어 주는 유틸함수를 만들어 보았다.

**config/utils/loadPages.ts**

```typescript
import fs from 'fs';

// ...생략

const sourceDir = 'src';
type LoopDirsCallback = (parent: string, child: fs.Dirent) => void;

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
```

여기서 먼저 볼 함수는 위의 `makeLoopDirs()`이다. 특정 parent path에서 시작해 해당 디렉토리에 있는 모든 파일과 디렉토리를 재귀적으로 돌며 인자로 받은 함수를 실행시킨다.

**config/utils/loadPages.ts**

```typescript
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
```

`PAGE_ROOT`와 같이 대문자로 된 변수들은 폴더 구조나 배포 경로 구성을 설정값으로 관리하기 위해 따로 설정해둔 것이다. `getEntryKey()`와 `getRoute()`는 각각 파일의 디렉토리에 따라 `entry`에서 사용할 key값과 빌드 후 위치하게될 경로를 알려주는 함수이다. 마지막 줄 처럼 위의 `findEntryAndHTML()`을 `makeLoopDirs()`에 넣어서 나온 함수에 `pageRoot`을 넣고 실행시키면 폴더/파일 구조에 따라 webpack `entry`옵션과 `HTMLWebpackPlugin` constructor에 넣을 인자들이 생긴다. 이를 webpack configuration에 사용하면 다음과 같이 HTML파일과 JS파일 들이 빌드되어 나온다.

**from**

```
src
  |- /pages
    |- /main
      |- index.html
    |- /a
      |- index.html
      |- index.ts
      |- /b
        |- index.html
        |- index.ts
```

**to**

```
dist
  |- /html
    |- index.html
    |- /a
      |- index.html
      |- /b
        |- index.html
  |- /js
    |- a.js
    |- a.b.js
```

`HTMLWebpackPlugin`의 `chunks` 옵션 덕분에 `src`에서 `index.html`과 같은 폴더에 있던 `index.ts`는 빌드 후에 생긴 `index.html`에 `<script>` 태그로 들어간다.

포스트들의 Routing과 스트립트 파일 관리도 위와 비슷한 방법으로 해결했다.

## Server : Nginx

static 파일들을 만들었으니 이제 호스팅해줄 서버만 있으면 된다. 앞서 말한것 처럼 [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html), [Github Pages](https://pages.github.com/) 등을 사용하면 편하겠지만 이 이상의 욕심이 있었다. 나중에 프로젝트를 위한 API 서버를 만들 필요가 있을지도 모르니 Reverse Proxy 서버가 하나 있으면 좋겠다는 생각이 들었다. 그래서 평소에 사용해보고 싶었던 [Nginx](https://nginx.org/)로 웹서버를 구성하기로 했다.

### Nginx Configuration

[nginx-admins-handbook](https://github.com/trimstray/nginx-admins-handbook) 와 같이 nginx에 대한 좋은 자료는 많았다. 하지만 너무 많은게 문제였고 내가 이걸 다 보더라도 Server Admin이 아닌 이상 다 까먹을 것 같았다. 한번 적은 코드도 잘 안보는데 Nginx 설정파일은 얼마나 볼까. 그래서 [nginxconfig.io](https://github.com/digitalocean/nginxconfig.io)를 사용하기로 했다. 원하는 기능만 골라주면 자동으로 적절한 Configuration 파일들을 만들어 주는 착한 서비스이다. 여기서 생성한 파일에서 살짝만 수정해 사용하기로 했다.

**niceandneat.dev.conf**

```
server {
    # ...생략

    root                    /var/www/niceandneat.dev;

    # index.html fallback
    location / {
        try_files $uri $uri/index.html /html$uri /html$uri/index.html =404;
    }
}
```

빌드과정에서 HTML 파일들을 `html/` 폴더로 분리해 놨기때문에 이를 고려해 위 location block을 수정했다. 앞으로 만들 개별 프로젝트들은 `/projects` 폴더 안에서 별도의 파일 구조를 가질 예정이므로 `html/` 내부가 아닌 곳에 존재하는 파일도 체크하게끔 했다.

**niceandneat.dev.conf**

```
# api reverse proxy 예시

upstream docker-api {
    server api:3000;
}

server {
    server_name             api.niceandneat.dev;

    # ...생략

    location / {
        proxy_pass http://docker-api:3000;
        include    nginxconfig.io/proxy.conf;
        # return 404;
    }
}
```

`api.niceandneat.dev` 서브 도메인으로 api reverse proxy 설정을 했다. 위 내용은 예시이며 `upstream` block의 내용은 이후 프로젝트 배포상태에 따라 변경될 수 있다. 현재는 돌아가야 할 API가 없어서 `return 404;` 로만 처리했다.

### Docker Compose

앞으로 API 서버들이 늘어날 수 있고 서비스들과의 원활한 소통과 쉬운 ~~리셋 버튼~~ 배포를 위해 [Docker](https://www.docker.com/)를 사용하기로 했다. 하지만 내 블로그 정도를 호스팅하기엔 볼륨 바인딩정도면 충분하다고 판단해 별도의 Dockerfile 없이 [docker-compose](https://docs.docker.com/compose/)로만 처리했다.

[Let's Encrypt](https://letsencrypt.org/) 인증서 발급을 위해 [certbot](https://certbot.eff.org/)을 사용했다. Nginx와 certbot 서비스를 돌리는 `docker-compose` 파일은 다음과 같다.

**docker-compose.yaml**

```
version: '3.9'
services:
  nginx:
    image: nginx:latest
    restart: always
    volumes:
      - ./dist:/var/www/niceandneat.dev
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites-available:/etc/nginx/sites-available
      - ./nginx/sites-enabled:/etc/nginx/sites-enabled
      - ./nginx/nginxconfig.io:/etc/nginx/nginxconfig.io
      - ./certbot/keys:/etc/nginx/keys
      - ./certbot/letsencrypt:/etc/letsencrypt
      - ./certbot/www:/var/www/_letsencrypt
    ports:
      - 80:80
      - 443:443
    entrypoint: '/bin/sh -c ''while :; do sleep 6h & wait $${!}; nginx -s reload; done & nginx -g "daemon off;"'''
  certbot:
    image: certbot/certbot
    restart: always
    volumes:
      - ./certbot/keys:/etc/keys
      - ./certbot/letsencrypt:/etc/letsencrypt
      - ./certbot/www:/var/www/_letsencrypt
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

추가할 nginx config 파일들과 certbot 파일들을 각 container의 내부 경로에 바인딩했다. 이제 container들은 해당 파일들을 마치 바인딩한 경로에 존재하는 것 처럼 사용할 수 있다. 또한 `dist` 디렉토리를 nginx의 `root` 디렉토리와 바인딩해 `dist` 내의 파일들이 호스팅될 수 있도록 했다. 볼륨 바인딩 부분이 꽤 많은데 깔끔하게 하는 방법을 찾지 못했다. Certbot의 `entrypoint`는 유효기간이 90일인 Let's Encrypt의 인증서를 12시간마다 갱신해주는 스크립트이다. Nginx의 `entrypoint`는 갱신된 인증서를 반영하기위해 6시간마다 configuration을 reload해주는 스크립트이다.

이 docker-compose 파일을 이용해 실제로 Diffie-Hellman key를 발급받고 Let's Encrypt 인증서를 받는 스크립트를 작성했다. 스크립트는 [nginxconfig.io](https://github.com/digitalocean/nginxconfig.io)와 [https://github.com/wmnnd/nginx-certbot](https://github.com/wmnnd/nginx-certbot)를 참조했다.

```bash
#!/bin/bash
set -e
domains=(niceandneat.dev api.niceandneat.dev)
certificates_path="./certbot"
email="niceaneat@gmail.com"

if [ ! -e "$certificates_path/keys/dhparam.pem" ]; then
  echo "# Generate Diffie-Hellman keys..."
  docker-compose run --rm --entrypoint "\
    openssl dhparam \
      -out '/etc/keys/dhparam.pem' 2048" certbot
else
  echo "# Found Diffie-Hellman keys on \"$certificates_path\"! Using the existing one..."
fi
echo

if [ ! -d "$certificates_path/letsencrypt/csr" ]; then
  echo "# Start to Get certificates with certbot..."

  echo "## Comment out SSL related directives in the nginx configuration"
  sed -i -r 's/(listen .*443)/\1;#/g; s/(ssl_(certificate|certificate_key|trusted_certificate) )/#;#\1/g' nginx/sites-enabled/niceandneat.dev.conf

  echo "## Start nginx server without https settings"
  docker-compose up -d nginx

  #Join $domains to -d args
  domain_args=""
  for domain in "${domains[@]}"; do
    domain_args="$domain_args -d $domain"
  done

  echo "## Obtain SSL certificates from Let's Encrypt using Certbot"
  docker-compose run --rm --entrypoint "\
    certbot certonly --webroot \
      $domain_args \
      --email $email \
      -w /var/www/_letsencrypt \
      -n \
      --agree-tos \
      --force-renewal" certbot

  echo "## Stop and remove nginx (without https) container"
  docker-compose down

  echo "## Uncomment SSL related directives in the configuration"
  sed -i -r 's/#?;#//g' /etc/nginx/sites-enabled/niceandneat.dev.conf
else
  echo "# Found certificates on \"$certificates_path\"! Using the existing one..."
fi
echo

echo "# Finished settings! Run 'docker-compose up -d"
echo
```

위 스크립트를 실행하고 `docker-compose up -d`를 입력하면 서버가 실행된다!

### AWS Lightsail

Docker를 돌릴 서버는 [AWS Lightsail](https://lightsail.aws.amazon.com/)로 선택했다. 이유는 사용하기 쉽고 저렴해서이다. 가격으로만 보자면 비슷한 클라우스 서비스들이 많았지만 서울리전이 있다는 점이 마음에 들어 결정했다. 월 20$짜리 요금으로 시작했다.

## CI/CD : Jenkins

Github에 푸쉬할 때마다 자동으로 webpack을 실행시키고 nginx를 reload해주는 CI 툴이 필요했다. [Jenkins](https://www.jenkins.io/), [Travis CI](https://www.travis-ci.com/), [Github Actions](https://github.com/features/actions) 들 중 고민했었다. Travis CI와 Github Actions는 서버구축이 필요없지만 오픈소스에만 무료이다. Jenkins는 서버만 있다면 마음껏 사용할 수 있다. 바로 위에서 서버를 만들었는데 Jenkins를 쓰지 않을 이유가 없었다. (귀여운 콧수염 아저씨는 덤이다.) 이 블로그에서 사용하는 Jenkinsfile은 다음과 같다.

**Jenkinsfile**

```
// Reference https://issues.jenkins.io/browse/JENKINS-57269
def remote = [:]
remote.name = 'web'
remote.host = '13.125.62.25'
remote.allowAnyHosts = true

pipeline {
  agent {
    docker {
      image 'node:lts'
    }
  }

  environment {
    CI = 'true'
    DIST_PATH = '/home/ubuntu/projects/niceandneat.dev'
  }

  stages {
    stage('Build') {
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }
    stage('Deploy') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'lightsail-rsa', keyFileVariable: 'identity', passphraseVariable: '', usernameVariable: 'userName')]) {
          script {
            remote.user = userName
            remote.identityFile = identity
          }
          sshCommand remote: remote, command: "mkdir -p $DIST_PATH/temp"
          sshPut remote: remote, from: 'docker-compose.yaml', into: "$DIST_PATH/docker-compose.yaml"
          sshPut remote: remote, from: 'dist', into: "$DIST_PATH/temp"
          sshScript remote: remote, script: "deploy.sh"
        }
      }
    }
  }
}
```

편한 ssh 요청을 위해 [ssh-steps](https://github.com/jenkinsci/ssh-steps-plugin) 플러그인을 사용했다. 미리 Jenkins에 등록해놓은 `lightsail-rsa` private key를 사용해 lightsail 서버에 접근할 수 있게했다. 플러그인을 사용해 서버내의 블로그 디렉토리에 `temp` 임시 디렉토리를 만들어 그 안에 빌드된 파일들을 옮겼다.

> 여기서 기존에 사용하던 RSA key가 플러그인에서 지원하는 포맷과 달라 오류가 발생해 [(issue)](https://issues.jenkins.io/browse/JENKINS-57495) 지원하는 포맷의 key를 새로 만들었다.

**deploy.sh**

```bash
#!/bin/bash
export DIST_PATH='/home/ubuntu/projects/niceandneat.dev'

# enable invert or negative wildcards
shopt -s extglob

rm -rfv $DIST_PATH/dist/!(projects)
mv -v $DIST_PATH/temp/dist/* $DIST_PATH/dist
rm -rfv $DIST_PATH/temp
```

마지막으로 위의 간단한 스크립트를 실행해 임시 디렉토리 내부의 파일을 실제 `dist` 디렉토리로 옮겼다. 위 `docker-compose.yaml` 파일에서 `dist` 디렉토리를 nginx의 `root` 디렉토리와 바인딩해 `dist` 내의 파일들이 호스팅될 수 있도록 했다. 또한 앞으로 배포가 필요한 프로젝트들을 `dist/projects` 디렉토리 안에 넣어서 nginx가 호스팅 할 수 있도록 할 예정이다. 만약 `dist` 디렉토리 자체를 삭제하면 docker volume 바인딩도 풀리고 그 안의 `projects` 폴더도 지워진다. 따라서 `dist` 내부에 `projects`를 제외한 파일과 디렉토리들만 삭제했다. Nginx configuration을 수정하고 docker volume 바인딩을 추가해 아예 블로그 디렉토리와 프로젝트 디렉토리를 분리하는 것도 방법이 될 수 있을 것 같다.

이제 원하는 코드나 글을 작성하고 푸시만 하면 블로그 홈페이지에 자동으로 반영된다!

## 마치며

코드 작성부터 배포까지 한계단 한계단씩 밟아가며 불편하게 블로그를 만들어봤다. 물론 더 불편하게 만드는 것도 가능하다. 돌이켜보니 부족한 부분도 많았다. 그래도 만들면서 배우는 점도 많고 욕심도 생기는 좋은 경험이었다. 생각보다 작업량이 많아서 글로 한번에 담기가 힘들었다. 더 보완하고 싶은 아쉬운 점이나 아이디어도 많다. 몇 가지만 나열해 보자면...

1. PostHTML도 불편하다. 이미 스타일도 따로 관리하는 판에 React를 Template엔진으로 다시 사용하고 싶다.

2. 카카오톡이나 SNS에 게시글 링크를 첨부했을 때 사용되는 이미지인 og:image 태그를 게시글마다 따로 설정하고 싶다. `CopyPlugin`으로도 시도해보고 `loaderContext`의 API들도 사용해 봤지만 마음에드는 방법이 없었다. React를 사용하면 좀 더 괜찮을지도...

3. markdown 파일을 loader로 처리하지 않고 webpack 빌드 플로우와는 별개로 처리하는 것도 좋을 것 같다. 지금 `loadPosts()`에서 함께 처리하면 되지 않을까.

4. 꾸안꾸 디자인을 원했는데 너무 안꾸 같다. 메인 페이지라도 [three.js](https://threejs.org/) 같은걸로 멋지게 만들고 싶다.

언젠가 위 내용으로도 또 글을 쓸 수 있었으면 좋겠다.

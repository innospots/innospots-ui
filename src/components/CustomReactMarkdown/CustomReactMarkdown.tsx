/*
 * Copyright © 2021-2023 Innospots (http://www.innospots.com)
 *  Licensed to the Apache Software Foundation (ASF) under one or more
 *  contributor license agreements.  See the NOTICE file distributed with
 *  this work for additional information regarding copyright ownership.
 *  The ASF licenses this file to You under the Apache License, Version 2.0
 *  (the "License"); you may not use this file except in compliance with
 *  the License. You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import remarkRaw from 'rehype-raw';
import remarkToc from 'remark-toc';
// import remarkParse from 'remark-parse';
// import remarkRehype from 'remark-rehype';
// import rehypeDocument from 'rehype-document';
// import rehypeStringify from 'rehype-stringify';
// import rehypeHighlight from 'rehype-highlight';
// import rehypeStarryNight from 'rehype-starry-night';

import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter'
// import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism'

const dd =
  "# A demo of `react-markdown`\n\n`react-markdown` is a markdown component for React.\n\n👉 Changes are re-rendered as you type.\n\n👈 Try writing some markdown on the left.\n\n## Overview\n\n* Follows [CommonMark](https://commonmark.org)\n* Optionally follows [GitHub Flavored Markdown](https://github.github.com/gfm/)\n* Renders actual React elements instead of using `dangerouslySetInnerHTML`\n* Lets you define your own components (to render `MyHeading` instead of `'h1'`)\n* Has a lot of plugins\n\n## Contents\n\nHere is an example of a plugin in action\n([`remark-toc`](https://github.com/remarkjs/remark-toc)).\n**This section is replaced by an actual table of contents**.\n\n## Syntax highlighting\n\nHere is an example of a plugin to highlight code:\n[`rehype-starry-night`](https://github.com/rehypejs/rehype-starry-night).\n\n```js\nimport React from 'react'\nimport ReactDom from 'react-dom'\nimport {MarkdownHooks} from 'react-markdown'\nimport rehypeStarryNight from 'rehype-starry-night'\n\nconst markdown = `\n# Your markdown here\n`\n\nReactDom.render(\n  <MarkdownHooks rehypePlugins={[rehypeStarryNight]}>{markdown}</MarkdownHooks>,\n  document.querySelector('#content')\n)\n```\n\nPretty neat, eh?\n\n## GitHub flavored markdown (GFM)\n\nFor GFM, you can *also* use a plugin:\n[`remark-gfm`](https://github.com/remarkjs/react-markdown#use).\nIt adds support for GitHub-specific extensions to the language:\ntables, strikethrough, tasklists, and literal URLs.\n\nThese features **do not work by default**.\n👆 Use the toggle above to add the plugin.\n\n| Feature    | Support              |\n| ---------: | :------------------- |\n| CommonMark | 100%                 |\n| GFM        | 100% w/ `remark-gfm` |\n\n~~strikethrough~~\n\n* [ ] task list\n* [x] checked item\n\nhttps://example.com\n\n## HTML in markdown\n\n⚠️ HTML in markdown is quite unsafe, but if you want to support it, you can\nuse [`rehype-raw`](https://github.com/rehypejs/rehype-raw).\nYou should probably combine it with\n[`rehype-sanitize`](https://github.com/rehypejs/rehype-sanitize).\n\n<blockquote>\n  👆 Use the toggle above to add the plugin.\n</blockquote>\n\n## Components\n\nYou can pass components to change things:\n\n```js\nimport React from 'react'\nimport ReactDom from 'react-dom'\nimport Markdown from 'react-markdown'\nimport MyFancyRule from './components/my-fancy-rule.js'\n\nconst markdown = `\n# Your markdown here\n`\n\nReactDom.render(\n  <Markdown\n    components={{\n      // Use h2s instead of h1s\n      h1: 'h2',\n      // Use a component instead of hrs\n      hr(props) {\n        const {node, ...rest} = props\n        return <MyFancyRule {...rest} />\n      }\n    }}\n  >\n    {markdown}\n  </Markdown>,\n  document.querySelector('#content')\n)\n```\n\n## More info?\n\nMuch more info is available in the\n[readme on GitHub](https://github.com/remarkjs/react-markdown)!\n\n***\n\nA component by [Espen Hovlandsdal](https://espen.codes/)";

const CodeBlock = (props) => {
  const { children, className, node, ...rest } = props;
  const match = /language-(\w+)/.exec(className || '');
  return match ? (
    <SyntaxHighlighter
      {...rest}
      PreTag="div"
      children={String(children).replace(/\n$/, '')}
      language={match[1]}
    />
  ) : (
    <code {...rest} className={className}>
      {children}
    </code>
  );
};

const CustomReactMarkdown: React.FC<{
  value: string;
}> = ({ value }) => {
  const renderReactMarkdown = useMemo(() => {
    return (
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkToc]}
          components={{
            code: CodeBlock,
          }}
        >
          {value}
        </ReactMarkdown>
      </div>
    );
  }, [value]);

  return <div>{renderReactMarkdown}</div>;
};

export default CustomReactMarkdown;

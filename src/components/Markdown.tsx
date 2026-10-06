import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import type { Element, Root } from 'hast';

function rehypeAiMathFallback() {
  return (tree: Root) => {
    const visit = (node: Root | Element) => {
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type !== 'element') continue;
        if (Array.isArray(child.properties.className) && child.properties.className.includes('katex-error')) {
          const original = child.children.filter(part => part.type === 'text').map(part => part.value).join('')
            .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'));
          // 只改变显示方式，不猜测乱码对应的数学符号。
          node.children[i] = {
            type: 'element', tagName: 'span', properties: { className: ['math-original'] },
            children: [
              { type: 'text', value: '公式原文（请核对）：' },
              { type: 'element', tagName: 'code', properties: {}, children: [{ type: 'text', value: original }] },
            ],
          };
        } else visit(child);
      }
    };
    visit(tree);
  };
}

export function Md({ children, inline = false, preserveBadMath = false }: { children: string; inline?: boolean; preserveBadMath?: boolean }) {
  return (
    <div className={inline ? 'md md-inline' : 'md'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }], ...(preserveBadMath ? [rehypeAiMathFallback] : [])]}
        components={{ img: ({ src, alt }) => <a href={src} target="_blank" rel="noreferrer" aria-label={'打开大图：' + (alt ?? '图示')}><img src={src} alt={alt} /></a> }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

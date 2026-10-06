import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

export function Md({ children, inline = false }: { children: string; inline?: boolean }) {
  return (
    <div className={inline ? 'md md-inline' : 'md'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: 'ignore' }]]}
        components={{ img: ({ src, alt }) => <a href={src} target="_blank" rel="noreferrer" aria-label={'打开大图：' + (alt ?? '图示')}><img src={src} alt={alt} /></a> }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

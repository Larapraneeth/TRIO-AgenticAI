import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ExecutionTimeline from '../agents/ExecutionTimeline';

function CopyButton({ text }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        padding: '3px 8px', fontSize: 11,
        background: copied ? '#10b981' : 'rgba(255,255,255,0.08)',
        border: 'none', borderRadius: 4,
        color: '#fff', cursor: 'pointer', transition: 'background 0.2s',
      }}
    >{copied ? '✓ Copied' : 'Copy'}</button>
  );
}

function CodeBlock({ children, className }) {
  const lang = /language-(\w+)/.exec(className || '')?.[1] || 'text';
  const code = String(children).replace(/\n$/, '');
  return (
    <div style={{ margin: '10px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid #2a2a2a' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 12px', background: '#161b22',
        borderBottom: '1px solid #2a2a2a',
      }}>
        <span style={{ fontSize: 11, color: '#555', fontFamily: 'monospace' }}>{lang}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: 13 }}
        showLineNumbers={code.split('\n').length > 5}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const mdComponents = {
  code({ node, className, children, ...props }) {
    const isBlock = /language-(\w+)/.test(className || '');
    return isBlock
      ? <CodeBlock className={className}>{children}</CodeBlock>
      : <code style={{ background: '#1e1e1e', padding: '2px 6px', borderRadius: 4, fontSize: 13, fontFamily: 'monospace', color: '#c084fc' }} {...props}>{children}</code>;
  },
  table: ({ children }) => (
    <div style={{ overflowX: 'auto', margin: '10px 0' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>{children}</table>
    </div>
  ),
  th: ({ children }) => <th style={{ padding: '7px 12px', background: '#1e1e1e', textAlign: 'left', fontSize: 12, color: '#8e8ea0', borderBottom: '1px solid #2a2a2a' }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: '7px 12px', borderBottom: '1px solid #1e1e1e', color: '#d4d4d4' }}>{children}</td>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #7c3aed', paddingLeft: 14, color: '#8e8ea0', margin: '8px 0' }}>{children}</blockquote>,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', textDecoration: 'none' }}>{children}</a>,
  h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 600, margin: '16px 0 8px', color: '#ececec' }}>{children}</h1>,
  h2: ({ children }) => <h2 style={{ fontSize: 17, fontWeight: 600, margin: '14px 0 6px', color: '#ececec' }}>{children}</h2>,
  h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, margin: '12px 0 4px', color: '#ececec' }}>{children}</h3>,
  ul: ({ children }) => <ul style={{ paddingLeft: 20, margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: 20, margin: '6px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>{children}</ol>,
  li: ({ children }) => <li style={{ color: '#d4d4d4', lineHeight: 1.65 }}>{children}</li>,
  p: ({ children }) => <div style={{ margin: '4px 0', lineHeight: 1.75, color: '#d4d4d4' }}>{children}</div>,
  strong: ({ children }) => <strong style={{ color: '#ececec', fontWeight: 600 }}>{children}</strong>,
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <div style={{
          maxWidth: '78%', padding: '11px 15px',
          background: '#7c3aed',
          borderRadius: '18px 18px 4px 18px',
          color: '#fff', fontSize: 14, lineHeight: 1.6,
        }}>
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'flex-start' }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, flexShrink: 0,
        background: '#7c3aed',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, color: '#fff', marginTop: 2,
      }}>⚡</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {message.execution_steps?.length > 0 && (
          <ExecutionTimeline
            steps={message.execution_steps}
            agents={message.agents_used || []}
            intent={message.intent || ''}
            isLive={false}
          />
        )}

        <div style={{ fontSize: 14, lineHeight: 1.75, color: '#d4d4d4' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {message.content}
          </ReactMarkdown>
        </div>

        <div style={{ marginTop: 6, fontSize: 11, color: '#333' }}>
          {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

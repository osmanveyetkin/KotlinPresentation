
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { type Message, Sender } from '../types';
import { GeminiIcon } from './icons/GeminiIcon';
import { UserIcon } from './icons/UserIcon';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  const markdownComponents = {
    h1: (props: any) => <h1 className="text-2xl font-bold my-4" {...props} />,
    h2: (props: any) => <h2 className="text-xl font-bold my-3" {...props} />,
    h3: (props: any) => <h3 className="text-lg font-semibold my-2" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside my-2 pl-4 space-y-1" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-inside my-2 pl-4 space-y-1" {...props} />,
    li: (props: any) => <li className="mb-1" {...props} />,
    p: (props: any) => <p className="mb-2 leading-relaxed" {...props} />,
    code: ({node, inline, className, children, ...props}: any) => {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <div className="bg-gray-900/80 my-4 rounded-md overflow-hidden">
          <div className="bg-gray-700/50 text-gray-300 px-4 py-1.5 text-sm flex justify-between items-center">
            <span>{match[1]}</span>
            <button 
                onClick={() => navigator.clipboard.writeText(String(children))}
                className="text-xs text-gray-400 hover:text-white transition-colors">
                Kopyala
            </button>
          </div>
          <pre className="p-4 text-sm overflow-x-auto"><code className={className} {...props}>{children}</code></pre>
        </div>
      ) : (
        <code className="bg-gray-700 text-purple-300 rounded-md px-1.5 py-0.5 text-sm font-mono" {...props}>
          {children}
        </code>
      )
    },
    a: (props: any) => <a className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
    blockquote: (props: any) => <blockquote className="border-l-4 border-gray-600 pl-4 my-2 italic text-gray-400" {...props} />,
    strong: (props: any) => <strong className="font-bold text-gray-50" {...props} />,
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-1">
          <GeminiIcon className="w-5 h-5 text-white" />
        </div>
      )}

      <div
        className={`max-w-2xl w-full rounded-xl px-5 py-3 ${
          isUser
            ? 'bg-purple-700 text-white'
            : 'bg-gray-800 text-gray-200'
        }`}
      >
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {message.text}
          </ReactMarkdown>
          {message.isLoading && !isUser && (
            <div className="flex items-center justify-start pt-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150 mx-1"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
            </div>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
          <UserIcon className="w-5 h-5 text-gray-300" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

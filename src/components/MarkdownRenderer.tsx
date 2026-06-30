import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "./ui/CopyButton";
import { extractTextFromNode, generateId } from "../utils/stringUtils";

export interface MarkdownRendererProps {
  content: string;
  isDark: boolean;
  ripple: any;
  showToast: (msg: string) => void;
}

export const MarkdownRenderer = ({
  content,
  isDark,
  ripple,
  showToast,
}: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ node, children, ...props }: any) => {
          const text = extractTextFromNode(node);
          return (
            <h1
              id="introduction"
              title={text}
              className="text-3xl md:text-4xl font-extrabold mb-8 line-clamp-1 scroll-mt-24"
              {...props}
            >
              {children}
            </h1>
          );
        },
        h2: ({ node, children, ...props }: any) => {
          const text = extractTextFromNode(node);
          const id = generateId(text);

          return (
            <h2
              id={id}
              className="scroll-mt-24 text-2xl font-bold mt-16 md:mt-20 mb-6 border-b border-neutral-200 dark:border-neutral-800 pb-3"
              {...props}
            >
              {children}
            </h2>
          );
        },
        h3: (props: any) => (
          <h3 className="text-xl font-semibold mt-10 mb-3" {...props} />
        ),
        p: (props: any) => (
          <p
            className="mb-5 text-neutral-600 dark:text-neutral-400 leading-relaxed text-base"
            {...props}
          />
        ),
        a: (props: any) => (
          <a
            className="text-indigo-500 hover:underline font-medium"
            target="_blank"
            {...props}
          />
        ),
        ul: (props: any) => (
          <ul
            className="list-disc pl-6 mb-6 text-neutral-600 dark:text-neutral-400 space-y-2 text-base"
            {...props}
          />
        ),
        li: (props: any) => <li {...props} />,
        blockquote: (props: any) => (
          <blockquote
            className="border-l-4 border-indigo-500 pl-5 my-6 italic text-neutral-500 bg-indigo-50/50 dark:bg-indigo-950/20 py-3 rounded-r-xl text-base"
            {...props}
          />
        ),
        code: (props: any) => {
          const { node, inline, className, children, ...rest } = props;
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <div className="relative flex flex-col my-8 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700/50 shadow-sm bg-white dark:bg-[#1e1e1e] ring-1 ring-black/5 dark:ring-white/10 group">
              {/* แถบหัวหน้าต่าง macOS */}
              <div className="flex items-center justify-between px-4 py-3 bg-neutral-100/80 dark:bg-[#252526] border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/90 shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400/90 shadow-inner"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-inner"></div>
                </div>
                <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-2 font-semibold">
                  {match[1]}
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute right-3 top-3 z-10 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <CopyButton
                    text={String(children).replace(/\n$/, "")}
                    onCopy={() => showToast("Copied code from docs!")}
                    ripple={ripple}
                  />
                </div>
                <SyntaxHighlighter
                  style={isDark ? (vscDarkPlus as any) : (vs as any)}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "1.25rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.5",
                    background: "transparent",
                  }}
                  {...rest}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            </div>
          ) : (
            <code
              className="bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-md text-sm font-mono text-pink-500 dark:text-pink-400"
              {...rest}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

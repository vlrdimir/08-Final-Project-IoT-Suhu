import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

export const MemoizedMarkdown = memo(
  ({ content }: { content: string; id: string }) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          p: ({ node, ...props }) => <p className="mb-4" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";

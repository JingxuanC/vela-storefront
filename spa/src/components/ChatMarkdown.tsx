import { useMemo } from "react";

interface Props {
  text: string;
  className?: string;
}

/**
 * Shared Markdown renderer for AI chat messages.
 * Supports: bold, italic, inline code, headings, lists, blockquotes, linebreaks.
 */
export function ChatMarkdown({ text, className = "chat-md" }: Props) {
  const html = useMemo(() => {
    let out = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      // bold and italic
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      // inline code
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      // headings
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      // ordered lists
      .replace(/^(\d+)\. (.+)$/gm, '<li data-num="$1">$2</li>')
      .replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, m =>
        m.includes("data-num")
          ? '<ol class="md-list">' + m + "</ol>"
          : '<ul class="md-list">' + m + "</ul>"
      )
      // unordered lists
      .replace(/^[-*] (.+)$/gm, "<li>$1</li>")
      // blockquotes
      .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
      // paragraphs and linebreaks
      .replace(/\n\n/g, "<br/><br/>")
      .replace(/\n/g, "<br/>");
    return out;
  }, [text]);

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

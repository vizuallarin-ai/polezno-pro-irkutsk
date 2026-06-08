import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type LexicalContentProps = {
  data: SerializedEditorState | null | undefined;
  className?: string;
};

export function LexicalContent({ data, className }: LexicalContentProps) {
  if (!data) return null;

  const html = convertLexicalToHTML({ data });

  if (!html) return null;

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

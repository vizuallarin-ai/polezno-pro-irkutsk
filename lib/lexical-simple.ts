import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

type Section = {
  heading?: string;
  paragraphs: string[];
};

function textNode(text: string) {
  return {
    type: "text" as const,
    text,
    format: 0,
    detail: 0,
    mode: "normal" as const,
    style: "",
    version: 1,
  };
}

function paragraph(text: string) {
  return {
    type: "paragraph" as const,
    children: [textNode(text)],
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
    textFormat: 0,
    textStyle: "",
  };
}

function heading(text: string, tag: "h2" | "h3" = "h2") {
  return {
    type: "heading" as const,
    tag,
    children: [textNode(text)],
    direction: "ltr" as const,
    format: "" as const,
    indent: 0,
    version: 1,
  };
}

/** Минимальный Lexical-документ из секций (для seed и статического fallback). */
export function lexicalFromSections(sections: Section[]): SerializedEditorState {
  const children = sections.flatMap((section) => {
    const nodes = [];
    if (section.heading) nodes.push(heading(section.heading));
    for (const p of section.paragraphs) nodes.push(paragraph(p));
    return nodes;
  });

  return {
    root: {
      type: "root",
      children,
      direction: "ltr",
      format: "",
      indent: 0,
      version: 1,
    },
  } as SerializedEditorState;
}

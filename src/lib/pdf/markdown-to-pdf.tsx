import React from "react";
import { Text, View, StyleSheet } from "@react-pdf/renderer";

// PDF styles for markdown elements
// Using Roboto font (registered in summary-pdf-document.tsx) for Czech character support
const styles = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    fontFamily: "Roboto",
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 10,
    fontFamily: "Roboto",
  },
  h3: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    fontFamily: "Roboto",
  },
  // Paragraphs
  paragraph: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 10,
    fontFamily: "Roboto",
    textAlign: "justify",
  },
  // Lists
  listItem: {
    fontSize: 12,
    lineHeight: 1.6,
    marginBottom: 6,
    marginLeft: 20,
    fontFamily: "Roboto",
  },
  listNumber: {
    marginRight: 8,
    fontFamily: "Roboto",
  },
  listBullet: {
    marginRight: 8,
    fontFamily: "Roboto",
  },
  // Code
  codeBlock: {
    fontSize: 10,
    fontFamily: "Courier",
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginVertical: 8,
    borderRadius: 4,
  },
  inlineCode: {
    fontSize: 11,
    fontFamily: "Courier",
    backgroundColor: "#f5f5f5",
    padding: "2 4",
  },
  // Text styles
  bold: {
    fontFamily: "Roboto",
    fontWeight: "bold",
  },
  italic: {
    fontFamily: "Roboto",
    fontStyle: "italic",
  },
  boldItalic: {
    fontFamily: "Roboto",
    fontWeight: "bold",
    fontStyle: "italic",
  },
  // Blockquote
  blockquote: {
    fontSize: 12,
    fontFamily: "Roboto",
    fontStyle: "italic",
    borderLeftWidth: 3,
    borderLeftColor: "#666",
    paddingLeft: 12,
    marginVertical: 10,
    color: "#555",
  },
  // Horizontal rule
  hr: {
    marginVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

interface MarkdownLine {
  type:
    | "h1"
    | "h2"
    | "h3"
    | "paragraph"
    | "ul"
    | "ol"
    | "code"
    | "blockquote"
    | "hr"
    | "empty";
  content: string;
  level?: number;
  index?: number;
}

/**
 * Parse markdown text into structured lines
 */
function parseMarkdown(markdown: string): MarkdownLine[] {
  const lines = markdown.split("\n");
  const parsed: MarkdownLine[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let listCounter = 0;
  let lastListType: "ul" | "ol" | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        parsed.push({
          type: "code",
          content: codeBlockContent.join("\n"),
        });
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Horizontal rule
    if (line.trim().match(/^[-*_]{3,}$/)) {
      parsed.push({ type: "hr", content: "" });
      lastListType = null;
      listCounter = 0;
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      parsed.push({ type: "h1", content: line.substring(2) });
      lastListType = null;
      listCounter = 0;
      continue;
    }
    if (line.startsWith("## ")) {
      parsed.push({ type: "h2", content: line.substring(3) });
      lastListType = null;
      listCounter = 0;
      continue;
    }
    if (line.startsWith("### ")) {
      parsed.push({ type: "h3", content: line.substring(4) });
      lastListType = null;
      listCounter = 0;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      parsed.push({ type: "blockquote", content: line.substring(2) });
      lastListType = null;
      listCounter = 0;
      continue;
    }

    // Unordered list
    if (line.match(/^[\s]*[-*+]\s/)) {
      const content = line.replace(/^[\s]*[-*+]\s/, "");
      if (lastListType !== "ul") {
        listCounter = 0;
      }
      parsed.push({ type: "ul", content, index: listCounter++ });
      lastListType = "ul";
      continue;
    }

    // Ordered list
    if (line.match(/^[\s]*\d+\.\s/)) {
      const content = line.replace(/^[\s]*\d+\.\s/, "");
      if (lastListType !== "ol") {
        listCounter = 0;
      }
      parsed.push({ type: "ol", content, index: listCounter++ });
      lastListType = "ol";
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      parsed.push({ type: "empty", content: "" });
      lastListType = null;
      listCounter = 0;
      continue;
    }

    // Regular paragraph
    parsed.push({ type: "paragraph", content: line });
    lastListType = null;
    listCounter = 0;
  }

  return parsed;
}

/**
 * Process inline markdown (bold, italic, code)
 */
function processInlineMarkdown(text: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  let currentText = "";
  let i = 0;
  let key = 0;

  while (i < text.length) {
    // Inline code
    if (text[i] === "`") {
      if (currentText) {
        elements.push(
          <Text key={key++} style={styles.paragraph}>
            {currentText}
          </Text>
        );
        currentText = "";
      }
      let codeContent = "";
      i++;
      while (i < text.length && text[i] !== "`") {
        codeContent += text[i];
        i++;
      }
      elements.push(
        <Text key={key++} style={styles.inlineCode}>
          {codeContent}
        </Text>
      );
      i++;
      continue;
    }

    // Bold and Italic (**text** or __text__)
    if (
      (text[i] === "*" && text[i + 1] === "*") ||
      (text[i] === "_" && text[i + 1] === "_")
    ) {
      if (currentText) {
        elements.push(
          <Text key={key++} style={styles.paragraph}>
            {currentText}
          </Text>
        );
        currentText = "";
      }
      const marker = text[i];
      let boldContent = "";
      i += 2;
      while (
        i < text.length - 1 &&
        !(text[i] === marker && text[i + 1] === marker)
      ) {
        boldContent += text[i];
        i++;
      }
      elements.push(
        <Text key={key++} style={styles.bold}>
          {boldContent}
        </Text>
      );
      i += 2;
      continue;
    }

    // Italic (*text* or _text_)
    if (text[i] === "*" || text[i] === "_") {
      if (currentText) {
        elements.push(
          <Text key={key++} style={styles.paragraph}>
            {currentText}
          </Text>
        );
        currentText = "";
      }
      const marker = text[i];
      let italicContent = "";
      i++;
      while (i < text.length && text[i] !== marker) {
        italicContent += text[i];
        i++;
      }
      elements.push(
        <Text key={key++} style={styles.italic}>
          {italicContent}
        </Text>
      );
      i++;
      continue;
    }

    currentText += text[i];
    i++;
  }

  if (currentText) {
    elements.push(
      <Text key={key++} style={styles.paragraph}>
        {currentText}
      </Text>
    );
  }

  return elements.length > 0 ? elements : [<Text key="empty"></Text>];
}

/**
 * Convert parsed markdown lines to PDF components
 */
export function MarkdownToPDF({ content }: { content: string }) {
  const lines = parseMarkdown(content);

  return (
    <>
      {lines.map((line, index) => {
        switch (line.type) {
          case "h1":
            return (
              <Text key={index} style={styles.h1}>
                {line.content}
              </Text>
            );

          case "h2":
            return (
              <Text key={index} style={styles.h2}>
                {line.content}
              </Text>
            );

          case "h3":
            return (
              <Text key={index} style={styles.h3}>
                {line.content}
              </Text>
            );

          case "paragraph":
            return (
              <Text key={index} style={styles.paragraph}>
                {processInlineMarkdown(line.content)}
              </Text>
            );

          case "ul":
            return (
              <View key={index} style={{ flexDirection: "row" }}>
                <Text style={[styles.listItem, styles.listBullet]}>•</Text>
                <Text style={styles.listItem}>
                  {processInlineMarkdown(line.content)}
                </Text>
              </View>
            );

          case "ol":
            return (
              <View key={index} style={{ flexDirection: "row" }}>
                <Text style={[styles.listItem, styles.listNumber]}>
                  {(line.index || 0) + 1}.
                </Text>
                <Text style={styles.listItem}>
                  {processInlineMarkdown(line.content)}
                </Text>
              </View>
            );

          case "code":
            return (
              <View key={index} style={styles.codeBlock}>
                <Text style={{ fontFamily: "Courier", fontSize: 10 }}>
                  {line.content}
                </Text>
              </View>
            );

          case "blockquote":
            return (
              <View key={index} style={styles.blockquote}>
                <Text>{line.content}</Text>
              </View>
            );

          case "hr":
            return <View key={index} style={styles.hr} />;

          case "empty":
            return <Text key={index} style={{ height: 5 }} />;

          default:
            return null;
        }
      })}
    </>
  );
}

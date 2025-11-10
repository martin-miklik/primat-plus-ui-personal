import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { MarkdownToPDF } from "@/lib/pdf/markdown-to-pdf";

// Register Roboto font from Google Fonts for Czech character support
// Using fonts.gstatic.com which serves fonts in compatible format
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf",
      fontWeight: "bold",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu52xPKTM1K9nz.ttf",
      fontStyle: "italic",
    },
    {
      src: "https://fonts.gstatic.com/s/roboto/v30/KFOjCnqEu92Fr1Mu51TzBhc9AMX6lJBP.ttf",
      fontWeight: "bold",
      fontStyle: "italic",
    },
  ],
});

// PDF Document styles
const styles = StyleSheet.create({
  page: {
    padding: "40 50",
    fontFamily: "Roboto",
    fontSize: 12,
  },
  header: {
    marginBottom: 30,
    borderBottom: "2pt solid #333",
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Roboto",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#666",
    fontFamily: "Roboto",
  },
  content: {
    flexGrow: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: "center",
    fontSize: 9,
    color: "#666",
    borderTop: "1pt solid #ccc",
    paddingTop: 8,
  },
  pageNumber: {
    fontFamily: "Roboto",
  },
});

interface SummaryPDFDocumentProps {
  sourceName: string;
  content: string;
  createdAt: string;
}

/**
 * PDF Document component for source summaries
 * Renders markdown content with proper formatting, headers, and page numbers
 */
export function SummaryPDFDocument({
  sourceName,
  content,
  createdAt,
}: SummaryPDFDocumentProps) {
  const formattedDate = format(new Date(createdAt), "d. MMMM yyyy", {
    locale: cs,
  });

  return (
    <Document
      title={`${sourceName} - Souhrn`}
      author="Primat+"
      subject={`Souhrn materiálu: ${sourceName}`}
      creator="Primat+ Learning Platform"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{sourceName}</Text>
          <Text style={styles.subtitle}>Souhrn • {formattedDate}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <MarkdownToPDF content={content || "Obsah není k dispozici."} />
        </View>

        {/* Footer with page numbers */}
        <View style={styles.footer} fixed>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Strana ${pageNumber} z ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

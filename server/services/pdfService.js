import pdfParse from "pdf-parse";

/**
 * Extracts plain text from an uploaded document buffer
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - MIME type of the file
 * @param {string} originalName - Original filename
 * @returns {Promise<string>} Cleaned extracted text
 */
export const extractTextFromBuffer = async (buffer, mimetype = "", originalName = "") => {
  try {
    let extractedText = "";

    const isPdf = mimetype === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");

    if (isPdf) {
      const parsed = await pdfParse(buffer);
      extractedText = parsed.text || "";
    } else {
      // Plain text, markdown, etc.
      extractedText = buffer.toString("utf-8");
    }

    // Clean whitespace and normalize linebreaks
    const cleaned = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleaned || cleaned.length < 10) {
      throw new Error("Unable to extract sufficient readable text from the document. Please ensure the file is not empty or scanned without OCR.");
    }

    return cleaned;
  } catch (error) {
    console.error("[Text Extraction Error]", error);
    throw new Error(error.message || "Failed to extract text from document");
  }
};

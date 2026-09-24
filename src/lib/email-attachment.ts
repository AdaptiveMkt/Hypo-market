export type SmtpPublicStatus = {
  configured: boolean;
  from: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  passwordSet: boolean;
  transport: "smtp" | "resend" | "none";
};

/** Step 1 — email attachment settings for the advisor PDF copy. */

export const EMAIL_FROM_NAME = "Adaptive Marketing Group";
export const EMAIL_FROM_ADDRESS = "info@fundingltcmarketplace.com";
export const EMAIL_FROM = `${EMAIL_FROM_NAME} <${EMAIL_FROM_ADDRESS}>`;
export const EMAIL_INBOX = EMAIL_FROM_ADDRESS;
/** Contact-request form. Shown on the dialog and used as the recipient. */
export const CONTACT_EMAIL = "Info@preserve-your-assets.com";

export const PDF_MIME = "application/pdf";
export const PDF_CONTENT_DISPOSITION = "attachment";

/** Resend limit is 40MB after Base64. Host JSON bodies are smaller — keep under ~3MB of Base64. */
export const MAX_ATTACH_BASE64_CHARS = 2_800_000;

export function pdfFilename(state: string, date = new Date()) {
  const stamp = date.toISOString().slice(0, 10);
  const place = (state || "model").replace(/\s+/g, "-").replace(/[^\w.\-]+/g, "");
  return `asset-utilization-${place}-${stamp}.pdf`;
}

export function resendPdfAttachment(filename: string, pdfBase64: string) {
  const name = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  return {
    filename: name,
    content: pdfBase64.replace(/\s+/g, ""),
    content_type: PDF_MIME,
    content_disposition: PDF_CONTENT_DISPOSITION,
  };
}

export function canAttachPdf(base64: string) {
  return base64.length > 80 && base64.length <= MAX_ATTACH_BASE64_CHARS;
}

export const TEST_MAIL_TO = "kim@adaptivesolutionsonline.com";

/** Tiny one-page PDF used only for a mail-attachment test. */
export const TEST_PDF_BASE64 =
  "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkc1szIDAgUl0+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyA0IDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNSAwIFI+Pj4+Pj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDEyMj4+CnN0cmVhbQpCVAovRjEgMTQgVGYKNzIgNzIwIFRkCChGdW5kaW5nIExUQyBNYXJrZXRwbGFjZSkgVGoKNzIgNjk4IFRkCihUZXN0IFBERiBhdHRhY2htZW50IC0gYXBwbGljYXRpb24vcGRmKSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjMgMDAwMDAgbiAKMDAwMDAwMDI1OSAwMDAwMCBuIAowMDAwMDAwNDMxIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNTA4CiUlRU9GCg==";

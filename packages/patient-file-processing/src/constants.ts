/** ~1 crore words design: chunk plain text and merge summaries hierarchically. */
export const PATIENT_FILE_TEXT_CHUNK_CHARS = 120_000;

/** Cap stored extracted text (~50M chars) while still supporting very large inputs via chunking. */
export const PATIENT_FILE_MAX_STORED_EXTRACTED_CHARS = 50_000_000;

/** Batch partial summaries per merge call to stay within context limits. */
export const PATIENT_FILE_MERGE_BATCH = 18;

export const DEFAULT_PATIENT_FILE_GEMINI_MODEL = "gemini-3-flash-preview";

/** Inline PDF request cap (bytes) before refusing (Gemini inline limits). */
export const PATIENT_FILE_MAX_INLINE_PDF_BYTES = 18 * 1024 * 1024;

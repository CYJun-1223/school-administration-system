export const MAX_CSV_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_CSV_MIME_TYPES = [
  'text/csv',
  'application/csv',
  'text/plain',
  'application/vnd.ms-excel',
] as const;

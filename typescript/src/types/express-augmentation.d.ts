import type { CsvItem } from './CsvItem';

declare global {
  namespace Express {
    interface Request {
      validatedCsvRows?: CsvItem[];
    }
  }
}

export {};

import { MAX_CSV_UPLOAD_BYTES } from '../../const/CsvUpload';
import { csvUploadFileSchema } from '../schemas/CsvUploadFileSchema';

describe('csvUploadFileSchema', () => {
  it('parses and trims a valid CSV upload file object', () => {
    const parsed = csvUploadFileSchema.parse({
      path: ' /tmp/upload.csv ',
      originalname: ' report.csv ',
      mimetype: 'text/csv',
      size: 128,
    });

    expect(parsed).toEqual({
      path: '/tmp/upload.csv',
      originalname: 'report.csv',
      mimetype: 'text/csv',
      size: 128,
    });
  });

  it('rejects a missing file', () => {
    expect(() => csvUploadFileSchema.parse(undefined)).toThrow(
      'CSV file is required',
    );
  });

  it('rejects unsupported mime types', () => {
    expect(() =>
      csvUploadFileSchema.parse({
        path: '/tmp/upload.csv',
        originalname: 'upload.csv',
        mimetype: 'application/json',
        size: 128,
      }),
    ).toThrow('mimetype must be a supported CSV file type');
  });

  it('rejects files that exceed the maximum size', () => {
    expect(() =>
      csvUploadFileSchema.parse({
        path: '/tmp/upload.csv',
        originalname: 'upload.csv',
        mimetype: 'text/csv',
        size: MAX_CSV_UPLOAD_BYTES + 1,
      }),
    ).toThrow(`CSV file must be ${MAX_CSV_UPLOAD_BYTES} bytes or less`);
  });

  it('rejects non-csv file names', () => {
    expect(() =>
      csvUploadFileSchema.parse({
        path: '/tmp/upload.csv',
        originalname: 'upload.txt',
        mimetype: 'text/csv',
        size: 128,
      }),
    ).toThrow('originalname must end with .csv');
  });
});

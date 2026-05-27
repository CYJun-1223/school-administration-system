import ErrorBase from '../../errors/ErrorBase';
import { classStudentsRequestSchema, classUpdateRequestSchema } from '../RequestSchemas';
import { validate } from '../validate';

describe('request schemas', () => {
  it('parses and trims class students request values', () => {
    const parsed = validate(classStudentsRequestSchema, {
      params: {
        classCode: ' P1-1 ',
      },
      query: {
        offset: '2',
        limit: '5',
      },
    });

    expect(parsed).toEqual({
      params: {
        classCode: 'P1-1',
      },
      query: {
        offset: 2,
        limit: 5,
      },
    });
  });

  it('parses and trims class update request values', () => {
    const parsed = validate(classUpdateRequestSchema, {
      params: {
        classCode: ' P1-2 ',
      },
      body: {
        className: ' P1 Integrity Updated ',
      },
    });

    expect(parsed).toEqual({
      params: {
        classCode: 'P1-2',
      },
      body: {
        className: 'P1 Integrity Updated',
      },
    });
  });

  it('rejects an invalid offset with a friendly message', () => {
    expect(() =>
      validate(classStudentsRequestSchema, {
        params: {
          classCode: 'P1-1',
        },
        query: {
          offset: 'bad',
          limit: '5',
        },
      }),
    ).toThrow(ErrorBase);
  });
});

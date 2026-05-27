import {
  mergeAndPaginateStudents,
  toExternalStudentRecord,
  toInternalStudentRecord,
} from '../StudentListingHelpers';

describe('student listing helpers', () => {
  it('maps local and external student records to the public shape', () => {
    expect(
      toInternalStudentRecord({
        id: 11,
        name: 'Aaron',
        email: 'aaron@example.com',
      }),
    ).toEqual({
      id: 11,
      name: 'Aaron',
      email: 'aaron@example.com',
      isExternal: false,
    });

    expect(
      toExternalStudentRecord({
        id: 22,
        name: 'Beatrice',
        email: 'beatrice@example.com',
      }),
    ).toEqual({
      id: 22,
      name: 'Beatrice',
      email: 'beatrice@example.com',
      isExternal: true,
    });
  });

  it('sorts by name, then email, then id before paginating', () => {
    const response = mergeAndPaginateStudents(
      [
        {
          id: 4,
          name: 'Zara',
          email: 'zara@example.com',
          isExternal: false,
        },
        {
          id: 7,
          name: 'Beatrice',
          email: 'alpha@example.com',
          isExternal: false,
        },
      ],
      [
        {
          id: 1,
          name: 'Aaron',
          email: 'aaron@example.com',
          isExternal: true,
        },
        {
          id: 2,
          name: 'Beatrice',
          email: 'alpha@example.com',
          isExternal: true,
        },
        {
          id: 3,
          name: 'Beatrice',
          email: 'bravo@example.com',
          isExternal: true,
        },
      ],
      1,
      3,
    );

    expect(response).toEqual({
      count: 5,
      students: [
        {
          id: 2,
          name: 'Beatrice',
          email: 'alpha@example.com',
          isExternal: true,
        },
        {
          id: 7,
          name: 'Beatrice',
          email: 'alpha@example.com',
          isExternal: false,
        },
        {
          id: 3,
          name: 'Beatrice',
          email: 'bravo@example.com',
          isExternal: true,
        },
      ],
    });
  });
});

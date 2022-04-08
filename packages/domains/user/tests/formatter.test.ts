import { format, secureTrim } from '../formatter';

describe('[Packages | User-domain | Formatter] secureTrim', () => {
  test('secureTrim should remove fields that are not defined in the list of public fields', () => {
    return expect(
      secureTrim({
        id: 'whatever',
        firstName: 'John',
        lastName: 'Smith',
        companyName: 'Pleo',
        ssn: 1,
      })
    ).toEqual({
      firstName: 'John',
      lastName: 'Smith',
      companyName: 'Pleo',
    });
  });
});

describe('[Packages | User-domain | Formatter] format', () => {
  test('format should return an instance of users that fits the API model, based on the db raw value', () => {
    return expect(
      format({
        id: 'whatever',
        firstName: 'john',
        lastName: 'smith',
        companyName: 'Pleo',
        ssn: 1,
      })
    ).toEqual({
      id: 'whatever',
      firstName: 'John',
      lastName: 'Smith',
      companyName: 'Pleo',
      ssn: 1,
    });
  });
});

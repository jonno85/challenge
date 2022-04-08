import { format, secureTrim } from '../formatter';

describe('[Packages | Expense-domain | Formatter] secureTrim', () => {
  test('secureTrim should remove fields that are not defined in the list of public fields', () => {
    return expect(
      secureTrim([
        {
          amountInCents: 1000n,
          currency: 'DKK',
          dateCreated: new Date(),
          id: '123',
          merchantName: 'Tesco',
          status: 'pending',
          userId: 'user_1',
        },
      ])
    ).toEqual([
      {
        amountInCents: '1000',
        currency: 'DKK',
        dateCreated: expect.any(Date),
        merchantName: 'Tesco',
        status: 'pending',
      },
    ]);
  });
});

describe('[Packages | User-domain | Formatter] format', () => {
  test('format should return an instance of users that fits the API model, based on the db raw value', () => {
    return expect(
      format([
        {
          amountInCents: 1000n,
          currency: 'DKK',
          dateCreated: new Date(),
          id: '123',
          merchantName: 'tesco',
          status: 'pending',
          userId: 'user_1',
        },
      ])
    ).toEqual([
      {
        amountInCents: 1000n,
        currency: 'DKK',
        dateCreated: expect.any(Date),
        id: '123',
        merchantName: 'Tesco',
        status: 'pending',
        userId: 'user_1',
      },
    ]);
  });
});

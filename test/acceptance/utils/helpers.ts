import { randomUUID } from 'crypto';

export function createUserExpense(userId: string, amountInCents = BigInt(10000), currency = 'EUR', status = 'done') {
  return {
    id: randomUUID(),
    userId,
    merchantName: 'merchantName',
    currency,
    status,
    amountInCents,
    dateCreated: new Date(),
  };
}

export function createUser(userId: string, firstName = 'John', lastName = 'Doe', companyName = 'ACME', ssn = '01234') {
  return {
    id: userId,
    firstName,
    lastName,
    companyName,
    ssn,
  };
}

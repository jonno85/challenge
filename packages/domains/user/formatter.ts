import { capitalize } from '@nc/utils/capitalize';
import { User, UserTrim } from './types';

const trimmer = (user: User): UserTrim => ({
  firstName: user.firstName,
  lastName: user.lastName,
  companyName: user.companyName,
});

export function secureTrim(user: User): UserTrim {
  return trimmer(user);
}

export function format(rawUser: User): User {
  return {
    id: rawUser.id,
    firstName: capitalize(rawUser.firstName),
    lastName: capitalize(rawUser.lastName),
    companyName: rawUser.companyName,
    ssn: rawUser.ssn,
  };
}

export interface UserDbRecord {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  ssn: string;
}
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  ssn: number;
}

export interface UserTrim {
  firstName;
  lastName;
  companyName;
}

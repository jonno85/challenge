import { translation } from '../intl';
require('../intl');

describe('i18nextInit', () => {
  test('localize unavailable key returns the same word', () => {
    return expect(translation.localize('mario', 'en-US')).toEqual('mario');
  });
});

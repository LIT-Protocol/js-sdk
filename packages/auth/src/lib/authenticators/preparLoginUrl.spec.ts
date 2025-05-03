import { prepareLoginUrl } from './utils';

describe('prepareLoginUrl', () => {
  it('should return the correct login url', async () => {
    const loginUrl = await prepareLoginUrl('google', 'http://localhost:3000');
    console.log('loginUrl:', loginUrl);
  });
});

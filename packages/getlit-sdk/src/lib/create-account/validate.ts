import { LitAuthMethod } from '../types';
import { log } from '../utils';

export const validateCreateAccount = (credentials: Array<LitAuthMethod>) => {
  if (credentials.length <= 0) {
    log.throw(`credentials are required to create an account. here's an example of how to create an account:

    // this will redirect the user to a google sign in page
    document.getElementById('google-sign-in-button').addEventListener('click', async () => {
      await Lit.auth.google.signIn();
    });

    // once the user has signed in and returned to your app, you can authenticate with the obtained credentials
    const googleAuthData = await Lit.auth.google.authenticate();

    const pkp = await Lit.createAccount({
      credentials: [
        googleAuthData
      ]
    });

    // your pkp is now available and can be accessed via google auth. You can add multiple 

    `);
  }
};

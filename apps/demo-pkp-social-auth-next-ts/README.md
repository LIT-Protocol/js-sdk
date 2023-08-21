# lit-auth-client Web Example 🪢

This is an example web app that shows how you can mint and use programmable key pairs (PKPs) with social accounts, one-time passwords, and authenticators using the [@lit-protocol/lit-auth-client](https://github.com/LIT-Protocol/js-sdk/tree/master/packages/lit-auth-client) library.

## 💻 Getting Started

1. Clone this repo and install dependencies:

```bash
cd apps/demo-pkp-social-auth-next-ts

yarn install
```

1. Add your Stytch project's `project_id` and `public_token` to `.env.local`:

```bash
NEXT_PUBLIC_STYTCH_PROJECT_ID="<Your Stytch Project ID>"
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN="<Your Stytch Public Token>"
```

If you're not using Stytch, feel free to comment out the Stytch provider `StytchProvider` and Stytch component `StytchOTP`.

3. Start your development server:

```bash
yarn dev
```

4. Visit [http://localhost:3000](http://localhost:3000) to start playing with the app.

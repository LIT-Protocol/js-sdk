# PKP x Google OAuth Web Example 🪢

This is an example web app that shows how you can mint and use programmable key pairs (PKPs) with just Google account. With PKPs, you can build distributed and customizable MPC wallets. Learn more about PKPs [here](https://developer.litprotocol.com/pkp/wallets/intro).

Check out the [live demo](https://pkp-social-auth-example.vercel.app/).

## 💻 Getting Started

1. Clone this repo and install dependencies:

```bash
git clone git@github.com:LIT-Protocol/pkp-social-auth-example.git

cd pkp-social-auth-example

yarn install
```

2. Add your Stytch project's `project_id` and `public_token` to `.env.local`:

```bash
NEXT_PUBLIC_STYTCH_PROJECT_ID="<Your Stytch Project ID>"
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN="<Your Stytch Public Token>"
```

If you're not using Stytch, feel free to comment out the Stytch provider `StytchProvider` and Stytch component `StytchOTP`.

3. Start your development server:

```bash
yarn dev
```

3. Visit [http://localhost:3000](http://localhost:3000) to start playing with the app.

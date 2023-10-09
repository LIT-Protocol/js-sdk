# `checkAndSignAuthMessage` Example ✍️

This is an example web app that shows how you can easily obtain an `AuthSig` using the `checkAndSignAuthMessage` function.

When the function is called, it prompts a wallet selection pop-up in the user's browser. Once the user's wallet is connected, the user is asked to sign a message, thereby confirming the ownership of their crypto address. The `AuthSig` is then generated, which includes the signature of the user's signed message.

## 💻 Getting Started

1. Clone this repo, navigate to the project folder, and install the dependencies:

```bash
cd apps/demo-lit-connect-modal-next

npm install
```

2. Create a `.env.local` file and add your WalletConnect project ID. You can get one by visiting [WalletConnect](https://cloud.walletconnect.com/sign-in).

```bash
NEXT_PUBLIC_WC_PROJECT_ID="<Your WalletConnect Project ID>"
```

3. Start your development server:

```bash
npm run dev
```

4. Visit [http://localhost:3000](http://localhost:3000) to start playing with the app.

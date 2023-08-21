# `checkAndSignAuthMessage` Example ✍️

This is an example web app that shows how you can easily obtain an `AuthSig` using the `checkAndSignAuthMessage` function.

When the function is called, it prompts a wallet selection pop-up in the user's browser. Once the user's wallet is connected, the user is asked to sign a message, thereby confirming the ownership of their crypto address. The `AuthSig`` is then generated, which includes the signature of the user's signed message.

## 💻 Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
---
'@lit-protocol/auth': patch
---

Users will see fewer wallet signature prompts during EOA auth because the existing AuthSig is reused when present, with no new usage required and a smoother auth flow.

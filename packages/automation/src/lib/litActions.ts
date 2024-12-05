export const signWithLitActionCode = `(async () =>  {
            const signature = await Lit.Actions.signAndCombineEcdsa({
              toSign,
              publicKey,
              sigName,
            });

            Lit.Actions.setResponse({ response: signature });
          })();`;

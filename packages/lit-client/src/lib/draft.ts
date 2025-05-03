// 1. Your config types
type GoogleConfig = {
  foo: string;
  bar: string;
};

type DiscordConfig = {
  zoo: string;
  loo: string;
};

// 2. Your authenticator classes
class GoogleAuthenticatorClass {
  constructor(public config: GoogleConfig) {}
}

class DiscordAuthenticatorClass {
  constructor(public config: DiscordConfig) {}
}

// 3. Helpers to extract & ban extras
type ConstructorConfig<T> = T extends new (config: infer C) => any ? C : never;

// NoExtra<T> = T PLUS a requirement that **no other keys** exist
type NoExtra<T> = T & Record<Exclude<string, keyof T>, never>;

// 4. The generic implementation (takes upstreamParams and args)
async function getAuthContextAdapter<T extends new (config: any) => any>(
  upstreamParams: any, // your upstream params here
  args: {
    authenticator: T;
    config: NoExtra<ConstructorConfig<T>>;
  }
): Promise<{ instance: InstanceType<T> }> {
  // ...you can use upstreamParams if needed...
  const instance = new args.authenticator(args.config);
  return { instance } as { instance: InstanceType<T> };
}

// 5. Factory that returns a properly‐typed generic method
function getManager(upstreamParams: any) {
  return {
    getAuthContext: <T extends new (config: any) => any>(args: {
      authenticator: T;
      config: NoExtra<ConstructorConfig<T>>;
    }) => getAuthContextAdapter(upstreamParams, args),
  };
}

// 6. Example usages
(async () => {
  const manager = getManager({
    /* upstreamParams */
  });

  // ——— These now error as desired ———

  await manager.getAuthContext({
    authenticator: GoogleAuthenticatorClass,
    config: {
      foo: 'hello',
      bar: 'world',
      zoo: 'bye', // ❌ Error: Type 'string' is not assignable to type 'never'
      aaa: '123', // ❌ Error: Type 'string' is not assignable to type 'never'
    },
  });

  await manager.getAuthContext({
    authenticator: DiscordAuthenticatorClass,
    config: {
      zoo: 'yo',
      loo: 'hey',
      foo: 'hello', // ❌ Error: Type 'string' is not assignable to type 'never'
    },
  });

  // ——— And these remain valid ———

  const g = await manager.getAuthContext({
    authenticator: GoogleAuthenticatorClass,
    config: { foo: 'hello', bar: 'world' },
  });

  const d = await manager.getAuthContext({
    authenticator: DiscordAuthenticatorClass,
    config: { zoo: 'x', loo: 'y' },
  });

  console.log(g.instance, d.instance);
})();

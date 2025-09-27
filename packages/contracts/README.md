# Configurations

All configs are in the `./src/config` directory

```bash
.
├── env.ts // 👈 to modify env vars
├── methods.ts // 👈 to add new ABI methods to extract
└── networks.ts // 👈 to add or modify a network
```

# Syncing Contract Addresses and ABIs

```shell
tsx ./src/sync.ts
```

or from monorepo root

```shell
nx run contracts:start
```

# PKP Auth Service

This package contains the PKP Authentication Service for the Lit Protocol.

## Running (pnpm + Nx)

Development targets:

```bash
pnpm nx run auth-services:serve:auth    # Auth server
pnpm nx run auth-services:serve:login   # Login server
```

Build:

```bash
pnpm nx run auth-services:build
```

## No static UI

This package no longer serves static pages. Clients must provide their own UI and pass a return URL via the `app_redirect` query parameter when starting an OAuth flow.

## OAuth flow (headless)

1. Start a provider flow by redirecting the user to:

```
GET {ORIGIN}/auth/google?state={STATE}&app_redirect={ENCODED_RETURN_URL}&caller={OPTIONAL}
GET {ORIGIN}/auth/discord?state={STATE}&app_redirect={ENCODED_RETURN_URL}&caller={OPTIONAL}
```

2. On callback, the server will redirect the user to your `app_redirect` URL:

- Google success: `?provider=google&id_token=...&access_token=...&state=...&caller=...`
- Discord success: `?provider=discord&access_token=...&state=...&caller=...`
- Error (both): `?error={error_code}`

If the initial request is invalid or misconfigured, the endpoints respond with JSON errors (HTTP 400/500) rather than serving HTML.

## Configuration

- `PORT` (default: derived from config)
- `HOST` (default: `0.0.0.0`)
- `ORIGIN` (default: `http://localhost:{PORT}`)

Provider credentials are supplied via `LitLoginServerConfig` when instantiating the server.

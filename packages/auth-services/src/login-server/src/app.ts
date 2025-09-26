import express, { Express } from 'express';
import cors from 'cors';
import { OAuth2Client } from 'google-auth-library';
import path from 'node:path';

// Prefer Node's CJS globals when available; fallback to process.cwd()
// Note: Tried to use "import { fileURLToPath } from 'node:url';", but got the following error:
// TypeError: The "path" argument must be of type string or an instance of URL. Received undefined
//     at fileURLToPath (node:internal/url:1606:11)
//     at Object.<anonymous> (/Users/js-sdk/dist/apps/lit-auth-server/main.cjs:490211:90)
const resolvedDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

type DiscordTokenResponse = {
  access_token?: string;
  token_type?: string;
  scope?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
};

export type LoginAppConfig = {
  origin: string;
  stateExpirySeconds: number;
  socialProviders: {
    google?: { clientId: string; clientSecret: string };
    discord?: { clientId: string; clientSecret: string };
  };
};

export const createLoginApp = (config: LoginAppConfig): Express => {
  const { origin, stateExpirySeconds } = config;

  const stateStore = new Map<
    string,
    { appRedirect: string; caller?: string; timeoutId: NodeJS.Timeout }
  >();

  const googleClient = new OAuth2Client(
    config.socialProviders.google?.clientId,
    config.socialProviders.google?.clientSecret,
    `${origin}/auth/google/callback`
  );

  const app = express();
  app.use(cors({ origin: true, credentials: true }));

  const staticDir = path.join(resolvedDirname, 'public');
  app.use(express.static(staticDir, { index: 'index.html', maxAge: '1h' }));

  // error page /error goes to /error.html
  app.get('/error', (req, res) => {
    res.sendFile(path.join(resolvedDirname, 'public', 'error.html'));
  });

  app.get('/auth/google', (req, res) => {
    const appRedirect = req.query['app_redirect'] as string;
    const state = req.query['state'] as string;
    const caller = req.query['caller'] as string;
    if (!state || !appRedirect)
      return res.status(400).json({ error: 'invalid_params' });
    try {
      new URL(appRedirect);
      const timeoutId = setTimeout(
        () => stateStore.delete(state),
        stateExpirySeconds * 1000
      );
      stateStore.set(state, {
        appRedirect,
        caller,
        timeoutId: timeoutId as unknown as NodeJS.Timeout,
      });
    } catch {
      return res.status(400).json({ error: 'invalid_params_url_validation' });
    }
    try {
      const authorizationUrl = googleClient.generateAuthUrl({
        scope: 'https://www.googleapis.com/auth/userinfo.email',
        state,
        include_granted_scopes: true,
        prompt: 'consent',
      });
      return res.redirect(authorizationUrl);
    } catch {
      return res.status(500).json({ error: 'auth_setup_failed' });
    }
  });

  app.get('/auth/google/callback', async (req, res) => {
    const state = req.query['state'] as string;
    if (!state) return res.status(400).json({ error: 'missing_state' });
    const stateData = stateStore.get(state);
    if (!stateData)
      return res.status(400).json({ error: 'missing_or_expired_state' });
    clearTimeout(stateData.timeoutId);
    const { caller, appRedirect } = stateData;
    const code = req.query['code'] as string;
    try {
      const tokenReq = await googleClient.getToken(code);
      if (!tokenReq.res || tokenReq.res.status !== 200) {
        const url = new URL(appRedirect);
        url.searchParams.set('error', 'token_error');
        stateStore.delete(state);
        return res.redirect(url.toString());
      }
      const idToken = tokenReq.tokens.id_token;
      const accessToken = tokenReq.tokens.access_token;
      const url = new URL(appRedirect);
      url.searchParams.set('provider', 'google');
      if (idToken) url.searchParams.set('id_token', idToken);
      if (accessToken) url.searchParams.set('access_token', accessToken);
      url.searchParams.set('state', state);
      if (caller) url.searchParams.set('caller', caller);
      stateStore.delete(state);
      return res.redirect(url.toString());
    } catch {
      stateStore.delete(state);
      const url = new URL(appRedirect);
      url.searchParams.set('error', 'authentication_failed');
      return res.redirect(url.toString());
    }
  });

  app.get('/auth/discord', (req, res) => {
    const appRedirect = req.query['app_redirect'] as string;
    const state = req.query['state'] as string;
    const caller = req.query['caller'] as string;
    if (!state || !appRedirect)
      return res.status(400).json({ error: 'invalid_params' });
    if (!config.socialProviders.discord)
      return res.status(400).json({ error: 'discord_not_configured' });
    try {
      new URL(appRedirect);
      const timeoutId = setTimeout(
        () => stateStore.delete(state),
        stateExpirySeconds * 1000
      );
      stateStore.set(state, {
        appRedirect,
        caller,
        timeoutId: timeoutId as unknown as NodeJS.Timeout,
      });
    } catch {
      return res.status(400).json({ error: 'invalid_params_url_validation' });
    }
    try {
      const redirectURI = encodeURIComponent(`${origin}/auth/discord/callback`);
      const authorizationUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.socialProviders.discord.clientId}&redirect_uri=${redirectURI}&response_type=code&scope=identify&state=${state}`;
      return res.redirect(authorizationUrl);
    } catch {
      return res.status(500).json({ error: 'auth_setup_failed' });
    }
  });

  app.get('/auth/discord/callback', async (req, res) => {
    const err = req.query['error'] as string;
    const state = req.query['state'] as string;
    if (err && state) {
      const stateData = stateStore.get(state);
      if (stateData) {
        const url = new URL(stateData.appRedirect);
        url.searchParams.set('error', err);
        return res.redirect(url.toString());
      }
    }
    if (err) return res.status(400).json({ error: err });
    if (!state) return res.status(400).json({ error: 'missing_state' });
    const stateData = stateStore.get(state);
    if (!stateData)
      return res.status(400).json({ error: 'missing_or_expired_state' });
    clearTimeout(stateData.timeoutId);
    const { caller, appRedirect } = stateData;
    const code = req.query['code'] as string;
    try {
      if (!config.socialProviders.discord) {
        const url = new URL(appRedirect);
        url.searchParams.set('error', 'discord_not_configured');
        stateStore.delete(state);
        return res.redirect(url.toString());
      }
      const params = new URLSearchParams();
      params.append('client_id', config.socialProviders.discord.clientId);
      params.append(
        'client_secret',
        config.socialProviders.discord.clientSecret
      );
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('redirect_uri', `${origin}/auth/discord/callback`);
      const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: params,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const json = (await response.json()) as DiscordTokenResponse;
      if (!json.access_token) {
        const url = new URL(appRedirect);
        url.searchParams.set('error', 'invalid_access_token');
        stateStore.delete(state);
        return res.redirect(url.toString());
      }
      const url = new URL(appRedirect);
      url.searchParams.set('provider', 'discord');
      url.searchParams.set('access_token', json.access_token);
      url.searchParams.set('state', state);
      if (caller) url.searchParams.set('caller', caller);
      stateStore.delete(state);
      return res.redirect(url.toString());
    } catch {
      stateStore.delete(state);
      const url = new URL(appRedirect);
      url.searchParams.set('error', 'authentication_failed');
      return res.redirect(url.toString());
    }
  });

  return app;
};

import { Elysia } from 'elysia';
import { staticPlugin } from '@elysiajs/static';
import { cors } from '@elysiajs/cors';
import { OAuth2Client } from 'google-auth-library';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export interface LitLoginServerConfig {
  port?: number;
  host?: string;
  origin?: string;
  stateExpirySeconds?: number;
  socialProviders: {
    google?: {
      clientId: string;
      clientSecret: string;
    };
    discord?: {
      clientId: string;
      clientSecret: string;
    };
  };
}

export interface LitLoginServer {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  getOrigin: () => string;
  getApp: () => Elysia;
}

/**
 * Creates and configures a Lit Login Server instance.
 *
 * This function sets up an Elysia server with routes for Google OAuth authentication,
 * static file serving, and basic error handling. It manages authentication state
 * and provides methods to start and stop the server, as well as retrieve its
 * origin URL and the underlying Elysia application instance.
 *
 * @param config - Configuration options for the server, including port, host, origin,
 * state expiry, and social provider credentials.
 * @returns An object with methods to control and interact with the server.
 */
export const createLitLoginServer = (
  config: LitLoginServerConfig
): LitLoginServer => {
  // Configuration with defaults
  let port = 3300;
  if (config.port !== undefined && !isNaN(config.port)) {
    port = config.port;
  } else if (process.env.PORT && !isNaN(Number(process.env.PORT))) {
    port = Number(process.env.PORT);
  }
  const host = config.host || process.env.HOST || '0.0.0.0';
  const origin =
    config.origin || process.env.ORIGIN || `http://localhost:${port}`;
  const stateExpirySeconds = config.stateExpirySeconds || 30;

  // State storage (in-memory instead of Redis)
  const stateStore = new Map<
    string,
    { appRedirect: string; caller?: string; timeoutId: Timer }
  >();

  // Google OAuth2 client setup
  const googleClient = new OAuth2Client(
    config.socialProviders.google?.clientId,
    config.socialProviders.google?.clientSecret,
    `${origin}/auth/google/callback`
  );

  // Get current directory for static file serving
  const __dirname = dirname(fileURLToPath(import.meta.url));

  // Create Elysia app
  const app = new Elysia()
    // Add CORS support for all origins
    .use(cors({
      origin: true
    }))
    // Serve static files from the public directory
    .use(
      staticPlugin({
        assets: join(__dirname, 'public'),
        prefix: '/',
      })
    )

    // Home page route
    .get('/', ({ set }) => {
      set.headers = { Location: '/index.html' };
      set.status = 302;
      return '';
    })

    // Error page route
    .get('/error', ({ set }) => {
      set.headers = { Location: '/error.html' };
      set.status = 302;
      return '';
    })

    // Google auth route
    .get('/auth/google', ({ query, set }) => {
      const appRedirect = query.app_redirect as string;
      const state = query.state as string;
      const caller = query.caller as string;

      if (!state || !appRedirect) {
        set.headers = { Location: '/error?error=invalid_params' };
        set.status = 302;
        return '';
      }

      // Validate app redirect URL
      try {
        new URL(appRedirect);

        // Set expiry for the state - remove after stateExpirySeconds seconds
        const timeoutId = setTimeout(() => {
          if (stateStore.has(state)) {
            console.log(
              `State ${state} expired after ${stateExpirySeconds} seconds, deleting.`
            );
            stateStore.delete(state);
          }
        }, stateExpirySeconds * 1000);

        // Store state data along with the timeoutId
        stateStore.set(state, {
          appRedirect,
          caller,
          timeoutId,
        });
      } catch (err) {
        set.headers = {
          Location: '/error?error=invalid_params_url_validation',
        };
        set.status = 302;
        return '';
      }

      try {
        // Generate Google auth URL
        const authorizationUrl = googleClient.generateAuthUrl({
          scope: 'https://www.googleapis.com/auth/userinfo.email',
          state: state,
          include_granted_scopes: true,
          prompt: 'consent',
        });

        // Redirect to Google auth
        set.headers = { Location: authorizationUrl };
        set.status = 302;
        return '';
      } catch (error) {
        console.error('Error generating auth URL:', error);
        set.headers = { Location: '/error?error=auth_setup_failed' };
        set.status = 302;
        return '';
      }
    })

    // Google auth callback route
    .get('/auth/google/callback', async ({ query, set }) => {
      // Get state from query string
      const state = query.state as string;

      if (!state) {
        set.headers = { Location: '/error?error=missing_state' };
        set.status = 302;
        return '';
      }

      // Get stored state data
      const stateData = stateStore.get(state);

      if (!stateData) {
        // This could happen if the state expired and was cleaned up by the timeout
        console.log(
          `State ${state} not found in store. It might have expired.`
        );
        set.headers = { Location: '/error?error=missing_or_expired_state' };
        set.status = 302;
        return '';
      }

      // State found, clear the auto-cleanup timeout
      clearTimeout(stateData.timeoutId);

      const { appRedirect, caller } = stateData;

      // Get ID token from Google
      const code = query.code as string;

      try {
        // Exchange code for tokens
        const tokenReq = await googleClient.getToken(code);

        if (!tokenReq.res || tokenReq.res.status !== 200) {
          stateStore.delete(state); // Clean up state even on token error
          set.headers = { Location: '/error?error=token_error' };
          set.status = 302;
          return '';
        }

        const idToken = tokenReq.tokens.id_token;
        const accessToken = tokenReq.tokens.access_token;

        // Use index.html with the appropriate query parameters
        const url = new URL(`${origin}/index.html`);
        url.searchParams.set('provider', 'google');
        url.searchParams.set('id_token', idToken!);
        url.searchParams.set('state', state);
        url.searchParams.set('access_token', accessToken!);

        if (caller) {
          url.searchParams.set('caller', caller);
        }

        stateStore.delete(state); // Explicitly delete state after successful use

        // Redirect to index.html with tokens
        set.headers = { Location: url.toString() };
        set.status = 302;
        return '';
      } catch (error) {
        console.error('Google auth error:', error);
        stateStore.delete(state); // Clean up state on other errors during callback processing
        set.headers = { Location: '/error?error=authentication_failed' };
        set.status = 302;
        return '';
      }
    })

    // Discord auth route
    .get('/auth/discord', ({ query, set }) => {
      const appRedirect = query.app_redirect as string;
      const state = query.state as string;
      const caller = query.caller as string;

      if (!state || !appRedirect) {
        set.headers = { Location: '/error?error=invalid_params' };
        set.status = 302;
        return '';
      }

      // Check if Discord is configured
      if (!config.socialProviders.discord) {
        set.headers = { Location: '/error?error=discord_not_configured' };
        set.status = 302;
        return '';
      }

      // Validate app redirect URL
      try {
        new URL(appRedirect);

        // Set expiry for the state - remove after stateExpirySeconds seconds
        const timeoutId = setTimeout(() => {
          if (stateStore.has(state)) {
            console.log(
              `State ${state} expired after ${stateExpirySeconds} seconds, deleting.`
            );
            stateStore.delete(state);
          }
        }, stateExpirySeconds * 1000);

        // Store state data along with the timeoutId
        stateStore.set(state, {
          appRedirect,
          caller,
          timeoutId,
        });
      } catch (err) {
        set.headers = {
          Location: '/error?error=invalid_params_url_validation',
        };
        set.status = 302;
        return '';
      }

      try {
        // Generate Discord auth URL
        const redirectURI = encodeURIComponent(
          `${origin}/auth/discord/callback`
        );
        const authorizationUrl = `https://discord.com/api/oauth2/authorize?client_id=${config.socialProviders.discord.clientId}&redirect_uri=${redirectURI}&response_type=code&scope=identify&state=${state}`;

        // Redirect to Discord auth
        set.headers = { Location: authorizationUrl };
        set.status = 302;
        return '';
      } catch (error) {
        console.error('Error generating Discord auth URL:', error);
        set.headers = { Location: '/error?error=auth_setup_failed' };
        set.status = 302;
        return '';
      }
    })

    // Discord auth callback route
    .get('/auth/discord/callback', async ({ query, set }) => {
      // Check if error has occurred
      const error = query.error as string;
      if (error) {
        set.headers = { Location: `/error?error=${error}` };
        set.status = 302;
        return '';
      }

      // Get state from query string
      const state = query.state as string;

      if (!state) {
        set.headers = { Location: '/error?error=missing_state' };
        set.status = 302;
        return '';
      }

      // Get stored state data
      const stateData = stateStore.get(state);

      if (!stateData) {
        // This could happen if the state expired and was cleaned up by the timeout
        console.log(
          `State ${state} not found in store. It might have expired.`
        );
        set.headers = { Location: '/error?error=missing_or_expired_state' };
        set.status = 302;
        return '';
      }

      // State found, clear the auto-cleanup timeout
      clearTimeout(stateData.timeoutId);

      const { caller } = stateData; // appRedirect from stateData is not directly used for the redirect URL's base

      // Get code from query string
      const code = query.code as string;

      try {
        // Check if Discord is configured
        if (!config.socialProviders.discord) {
          stateStore.delete(state);
          set.headers = { Location: '/error?error=discord_not_configured' };
          set.status = 302;
          return '';
        }

        // Prepare params for token request
        const params = new URLSearchParams();
        params.append('client_id', config.socialProviders.discord.clientId);
        params.append(
          'client_secret',
          config.socialProviders.discord.clientSecret
        );
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', `${origin}/auth/discord/callback`);

        // Exchange code for token
        const response = await fetch('https://discord.com/api/oauth2/token', {
          method: 'POST',
          body: params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        const json = await response.json();
        
        if (!json.access_token) {
          stateStore.delete(state);
          set.headers = { Location: '/error?error=invalid_access_token' };
          set.status = 302;
          return '';
        }

        // Build redirect URL, always targeting the login server's own index.html
        const url = new URL(`${origin}/index.html`);
        url.searchParams.set('provider', 'discord');
        url.searchParams.set('access_token', json.access_token);
        url.searchParams.set('state', state);
        
        if (caller) {
          url.searchParams.set('caller', caller);
        }

        stateStore.delete(state); // Explicitly delete state after successful use

        // Redirect back to the app with tokens
        set.headers = { Location: url.toString() };
        set.status = 302;
        return '';
      } catch (error) {
        console.error('Discord auth error:', error);
        stateStore.delete(state); // Clean up state on other errors during callback processing
        set.headers = { Location: '/error?error=authentication_failed' };
        set.status = 302;
        return '';
      }
    });

  // Server handle
  let server: any = null;

  return {
    // Start the server
    start: async () => {
      if (server) {
        console.warn('Server is already running');
        return;
      }

      server = app.listen({
        port,
        hostname: host,
      });

      console.log(`
---------------------------------------------
🦊 Lit Login Server 
---------------------------------------------
Server URL: ${origin}

🔐 To authenticate with Google, open this URL in your application:
${origin}/auth/google?app_redirect=${encodeURIComponent(
        origin
      )}&state=example123&caller=${encodeURIComponent(origin)}

${
  config.socialProviders.discord
    ? `🔐 To authenticate with Discord, open this URL in your application:
${origin}/auth/discord?app_redirect=${encodeURIComponent(
        origin
      )}&state=example123&caller=${encodeURIComponent(origin)}`
    : ''
}

Press Ctrl+C to stop the server
---------------------------------------------
        `);
    },

    // Stop the server
    stop: async () => {
      if (!server) {
        console.warn('Server is not running');
        return;
      }

      await server.close();
      server = null;
      console.log('🦊 Lit Login Server stopped');
    },

    // Get the server's origin URL
    getOrigin: () => origin,

    // Get the Elysia app instance for further customization
    getApp: () => app,
  };
};

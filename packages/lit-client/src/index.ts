// Export our top-level consumer API and types for consumers of the entire lit-client package
// export `getLitClient({network, authManager, options? })` => { ...api }
import * as LitAuth from '@lit-protocol/auth';
interface LitClientConfig {
  network: 'naga-dev';
  authManager: ReturnType<typeof LitAuth.getAuthManager>;
}

export const getLitClient = (params: LitClientConfig) => {
  console.log(params);
};

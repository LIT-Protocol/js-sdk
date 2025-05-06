// Export our top-level consumer API and types for consumers of the entire lit-client package
// export `getLitClient({network, authManager, options? })` => { ...api }
interface LitClientConfig {
  network: 'naga-dev';
  // authManager: ReturnType<typeof LitAuth.getAuthManager>;
}

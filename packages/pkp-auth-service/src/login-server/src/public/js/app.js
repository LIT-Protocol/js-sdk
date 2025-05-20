function parseLoginParams(url) {
  const searchParams = new URLSearchParams(new URL(url).search);
  const caller = searchParams.get('caller');
  const provider = searchParams.get('provider');
  const accessToken = searchParams.get('access_token');
  const idToken = searchParams.get('id_token');
  const error = searchParams.get('error');

  return {
    caller,
    provider,
    accessToken,
    idToken,
    error,
  };
}

window.onload = async () => {
  // Style other pages
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    lightMode = false;
    document.body.setAttribute('data-lit-theme', 'dark');
  }

  // Sending oauth data back to the caller window
  const openerWindow = window.opener;
  if (openerWindow) {
    const params = parseLoginParams(window.location.href);
    const { caller, error, idToken, accessToken, provider } = params

    if (caller) {
      openerWindow.postMessage({ error, token: idToken || accessToken, provider }, caller);
    }
  }
};

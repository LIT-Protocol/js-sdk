const providerMethods = {
  walletconnect: (providerOptions, id) => {
    const walletConnectData = providerOptions.walletconnect;
    const walletConnectProvider = walletConnectData.provider;

    return walletConnectProvider;
  },
};

export default providerMethods;

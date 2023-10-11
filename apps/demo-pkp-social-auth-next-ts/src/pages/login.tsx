import { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthenticate from '../hooks/useAuthenticate';
import useSession from '../hooks/useSession';
import useAccounts from '../hooks/useAccounts';
import { ORIGIN, signInWithDiscord, signInWithGoogle } from '../utils/lit';
import Dashboard from '../components/Dashboard';
import Loading from '../components/Loading';
import LoginMethods from '../components/LoginMethods';
import AccountSelection from '../components/AccountSelection';
import CreateAccount from '../components/CreateAccount';

export default function LoginView() {
  const redirectUri = ORIGIN + '/login';

  const {
    authMethod,
    authWithEthWallet,
    authWithWebAuthn,
    authWithStytch,
    loading: authLoading,
    error: authError,
  } = useAuthenticate(redirectUri);
  const {
    fetchAccounts,
    setCurrentAccount,
    currentAccount,
    accounts,
    loading: accountsLoading,
    error: accountsError,
  } = useAccounts();
  const {
    initSession,
    sessionSigs,
    loading: sessionLoading,
    error: sessionError,
  } = useSession();
  const router = useRouter();

  const error = authError || accountsError || sessionError;

  async function handleGoogleLogin() {
    await signInWithGoogle(redirectUri);
  }

  async function handleDiscordLogin() {
    await signInWithDiscord(redirectUri);
  }

  function goToSignUp() {
    router.push('/');
  }

  useEffect(() => {
    // async function fetchDiscord(authMethod) {
    //   const meResponse = await fetch('https://discord.com/api/users/@me', {
    //     method: 'GET',
    //     headers: {
    //       authorization: `Bearer ${authMethod.accessToken}`,
    //     },
    //   });
    //   if (meResponse.ok) {
    //     const user = await meResponse.json();
    //     console.log(user);
    //     return user.id;
    //   } else {
    //     throw new Error('Unable to verify Discord account');
    //   }
    // }

    // If user is authenticated, fetch accounts
    if (authMethod) {
      router.replace(window.location.pathname, undefined, { shallow: true });
      // if (authMethod.authMethodType === AuthMethodType.Discord) {
      //   console.log('discord', authMethod);
      //   fetchDiscord(authMethod);
      // }
      fetchAccounts(authMethod);
    }
  }, [authMethod, fetchAccounts]);

  useEffect(() => {
    // If user is authenticated and has selected an account, initialize session
    if (authMethod && currentAccount) {
      initSession(authMethod, currentAccount);
    }
  }, [authMethod, currentAccount, initSession]);

  if (authLoading) {
    return (
      <Loading copy={'Authenticating your credentials...'} error={error} />
    );
  }

  if (accountsLoading) {
    return <Loading copy={'Looking up your accounts...'} error={error} />;
  }

  if (sessionLoading) {
    return <Loading copy={'Securing your session...'} error={error} />;
  }

  // If user is authenticated and has selected an account, initialize session
  if (currentAccount && sessionSigs) {
    return (
      <Dashboard currentAccount={currentAccount} sessionSigs={sessionSigs} />
    );
  }

  // If user is authenticated and has more than 1 account, show account selection
  if (authMethod && accounts.length > 0) {
    return (
      <AccountSelection
        accounts={accounts}
        setCurrentAccount={setCurrentAccount}
        error={error}
      />
    );
  }

  // If user is authenticated but has no accounts, prompt to create an account
  if (authMethod && accounts.length === 0) {
    return <CreateAccount signUp={goToSignUp} error={error} />;
  }

  // If user is not authenticated, show login methods
  return (
    <LoginMethods
      handleGoogleLogin={handleGoogleLogin}
      handleDiscordLogin={handleDiscordLogin}
      authWithEthWallet={authWithEthWallet}
      authWithWebAuthn={authWithWebAuthn}
      authWithStytch={authWithStytch}
      signUp={goToSignUp}
      error={error}
    />
  );
}

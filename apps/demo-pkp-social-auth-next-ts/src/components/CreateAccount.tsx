interface CreateAccountProp {
  signUp: any;
  error?: Error;
}

export default function CreateAccount({ signUp, error }: CreateAccountProp) {
  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        <h1>Need a PKP?</h1>
        <p>
          There doesn&apos;t seem to be a Lit wallet associated with your
          credentials. Create one today.
        </p>
        <div className="buttons-container">
          <button onClick={signUp} className="btn btn--primary">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

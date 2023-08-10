import { useState } from 'react';

import { sendOTPCode } from '../utils/lit';

type OtpMethod = 'email' | 'phone';
type OtpStep = 'submit' | 'verify';

interface EmailSMSAuthProps {
  method: OtpMethod;
  setView: React.Dispatch<React.SetStateAction<string>>;
  authWithOTP: any;
}

const EmailSMSAuth = ({ method, setView, authWithOTP }: EmailSMSAuthProps) => {
  const [step, setStep] = useState<OtpStep>('submit');
  const [userId, setUserId] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [sendLoading, setSendLoading] = useState<boolean>(false);
  const [sendError, setSendError] = useState<Error>();

  async function handleSendCode(event: any) {
    event.preventDefault();
    setSendLoading(true);
    setSendError(undefined);
    try {
      await sendOTPCode(userId);
      setStep('verify');
    } catch (err) {
      setSendError(err);
    } finally {
      setSendLoading(false);
    }
  }

  async function handleAuth(event: any) {
    event.preventDefault();
    setSendLoading(false);
    setSendError(undefined);
    await authWithOTP(code);
  }

  return (
    <>
      {step === 'submit' && (
        <>
          {sendError && (
            <div className="alert alert--error">
              <p>{sendError.message}</p>
            </div>
          )}
          <h1>Enter your {method}</h1>
          <p>A verification code will be sent to your {method}.</p>
          <div className="form-wrapper">
            <form className="form" onSubmit={handleSendCode}>
              <label htmlFor={method} className="sr-only">
                {method === 'email' ? 'Email' : 'Phone number'}
              </label>
              <input
                id={method}
                value={userId}
                onChange={e => setUserId(e.target.value)}
                type={method === 'email' ? 'email' : 'tel'}
                name={method}
                className="form__input"
                placeholder={
                  method === 'email' ? 'Your email' : 'Your phone number'
                }
                autoComplete="off"
              ></input>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={sendLoading}
              >
                Send code
              </button>
              <button
                onClick={() => setView('default')}
                className="btn btn--link"
              >
                Back
              </button>
            </form>
          </div>
        </>
      )}
      {step === 'verify' && (
        <>
          <h1>Check your {method}</h1>
          <p>Enter the 6-digit verification code to {userId}</p>
          <div className="form-wrapper">
            <form className="form" onSubmit={handleAuth}>
              <label htmlFor="code" className="sr-only">
                Code
              </label>
              <input
                id="code"
                value={code}
                onChange={e => setCode(e.target.value)}
                type="code"
                name="code"
                className="form__input"
                placeholder="Verification code"
                autoComplete="off"
              ></input>
              <button type="submit" className="btn btn--primary">
                Verify
              </button>
              <button
                onClick={() => setStep('submit')}
                className="btn btn--outline"
              >
                Try again
              </button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default EmailSMSAuth;

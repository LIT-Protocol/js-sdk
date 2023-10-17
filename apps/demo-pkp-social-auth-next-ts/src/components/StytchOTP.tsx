import { useCallback, useState } from 'react';
import { useStytch } from '@stytch/nextjs';

interface StytchOTPProps {
  authWithStytch: any;
  setView: React.Dispatch<React.SetStateAction<string>>;
}

type OtpStep = 'submit' | 'verify';

/**
 * One-time passcodes can be sent via phone number through Stytch
 */
const StytchOTP = ({ authWithStytch, setView }: StytchOTPProps) => {
  const [step, setStep] = useState<OtpStep>('submit');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [methodId, setMethodId] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const stytchClient = useStytch();

  async function sendPasscode(event: any) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await stytchClient.otps.sms.loginOrCreate(phoneNumber);
      setMethodId(response.method_id);
      setStep('verify');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  async function authenticate(event: any) {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await stytchClient.otps.authenticate(code, methodId, {
        session_duration_minutes: 60,
      });
      await authWithStytch(response.session_jwt, response.user_id);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {step === 'submit' && (
        <>
          {error && (
            <div className="alert alert--error">
              <p>{error.message}</p>
            </div>
          )}
          <h1>Enter your phone number</h1>
          <p>A verification code will be sent to your phone number.</p>
          <div className="form-wrapper">
            <form className="form" onSubmit={sendPasscode}>
              <label htmlFor="phone number" className="sr-only">
                Phone number
              </label>
              <input
                id="phone number"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                type="tel"
                name="phone number"
                className="form__input"
                placeholder="Your phone number"
                autoComplete="off"
              ></input>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
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
          <h1>Check your phone</h1>
          <p>Enter the 6-digit verification code to {phoneNumber}</p>
          <div className="form-wrapper">
            <form className="form" onSubmit={authenticate}>
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

export default StytchOTP;

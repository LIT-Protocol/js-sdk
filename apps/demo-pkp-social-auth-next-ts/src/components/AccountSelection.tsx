import * as RadioGroup from '@radix-ui/react-radio-group';

import { IRelayPKP } from '@lit-protocol/types';
import { useState } from 'react';

interface AccountSelectionProp {
  accounts: IRelayPKP[];
  setCurrentAccount: any;
  error?: Error;
}

export default function AccountSelection({
  accounts,
  setCurrentAccount,
  error,
}: AccountSelectionProp) {
  const [selectedValue, setSelectedValue] = useState<string>('0');

  async function handleSubmit(event: any) {
    event.preventDefault();
    const account = accounts[parseInt(selectedValue)];
    return setCurrentAccount(account);
  }

  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        <h1>Choose your account</h1>
        <p>Continue with one of your accounts.</p>
        <form onSubmit={handleSubmit} className="form">
          <RadioGroup.Root
            className="accounts-wrapper"
            defaultValue="0"
            onValueChange={setSelectedValue}
            aria-label="View accounts"
          >
            {accounts.map((account, index) => (
              <div
                key={`account-${index}`}
                className={`account-item ${
                  selectedValue === index.toString() && 'account-item--selected'
                }`}
              >
                <RadioGroup.Item
                  className="account-item__radio"
                  value={index.toString()}
                  id={account.ethAddress}
                >
                  {' '}
                  <RadioGroup.Indicator className="account-item__indicator" />
                </RadioGroup.Item>
                <label
                  className="account-item__label"
                  htmlFor={account.ethAddress}
                >
                  {account.ethAddress.toLowerCase()}
                </label>
              </div>
            ))}
          </RadioGroup.Root>
          <button type="submit" className="btn btn--primary">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

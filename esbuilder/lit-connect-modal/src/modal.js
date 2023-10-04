import MicroModal from 'micromodal';
import css from './modal.css';
import {
  rawListOfWalletsArray,
  metaMaskSingle,
  coinbaseSingle,
} from './helpers/walletList.js';
import providerMethods from './helpers/providerMethods.js';

export default class LitConnectModal {
  constructor({ providerOptions }) {
    this.dialog = MicroModal;
    this.closeAction = undefined;
    this.parent = document.body;
    this.filteredListOfWalletsArray = [];
    this.providerOptions = providerOptions;
    this._filterListOfWallets();
    this._instantiateLitConnectModal();

    // inject css
    var style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  getWalletProvider() {
    const currentProvider = localStorage.getItem('lit-web3-provider');

    this.dialog.show('lit-connect-modal');
    return new Promise((resolve, reject) => {
      // if there is a current provider, resolve with it
      if (!!currentProvider) {
        const foundProvider = this.filteredListOfWalletsArray.find(
          (w) => w.id === currentProvider
        );
        resolve(foundProvider.provider);
        this._destroy();
        return;
      }

      // otherwise, show the list of providers
      this.filteredListOfWalletsArray.forEach((w) => {
        let walletEntry = document.getElementById(w.id);
        walletEntry.addEventListener('click', () => {
          localStorage.setItem('lit-web3-provider', w.id);
          resolve(w.provider);
          this._destroy();
          return;
        });
      });

      this.closeAction.addEventListener('click', () => {
        resolve(false);
        this._destroy();
        return;
      });
    });
  }

  _filterListOfWallets() {
    const filteredListOfWalletsArray = [];

    // -- this would only work if user installed multiple wallet extensions
    // eg. when "ethereum.providers" is defined
    rawListOfWalletsArray.forEach((w) => {
      if (!!w['checkIfPresent'] && w['checkIfPresent']() === true) {
        filteredListOfWalletsArray.push(w);
      }
    });

    // -- try again, when user only installed a single wallet extension
    // eg. when "ethereums.provider" it undefined, and can only be access
    // via "ethereum.isMetaMask" or "ethereum.isCoinbaseWallet
    if (filteredListOfWalletsArray.length === 0) {
      if (globalThis.ethereum) {
        if (globalThis.ethereum.isMetaMask) {
          filteredListOfWalletsArray.push(metaMaskSingle);
        }

        if (globalThis.ethereum.isCoinbaseWallet) {
          filteredListOfWalletsArray.push(coinbaseSingle);
        }
      }
    }

    // -- if walletconnect is present, add it to the list
    if (!!this.providerOptions['walletconnect']) {
      const cloneWalletInfo = rawListOfWalletsArray.find(
        (w) => w.id === 'walletconnect'
      );
      cloneWalletInfo['provider'] = providerMethods['walletconnect'](
        this.providerOptions,
        'walletconnect'
      );
      filteredListOfWalletsArray.push(cloneWalletInfo);
    }

    // -- finally, throw an error if no wallets are present
    if (filteredListOfWalletsArray.length === 0) {
      alert('No wallets installed or provided.');
      throw new Error('No wallets installed or provided.');
    }

    this.filteredListOfWalletsArray = filteredListOfWalletsArray;
  }

  _instantiateLitConnectModal() {
    const connectModal = document.createElement('div');
    connectModal.setAttribute('id', 'lit-connect-modal-container');
    connectModal.innerHTML = `
        <div class="modal micromodal-slide" id="lit-connect-modal" aria-hidden="true">
            <div class="lcm-modal-overlay" id="lcm-modal-overlay" tabindex="-1" data-micromodal-close>
                <div class="lcm-modal-container" role="dialog" aria-modal="true" aria-labelledby="lit-connect-modal-title">
                    <main class="lcm-modal-content" id="lit-connect-modal-content">
                    </main>
                </div>
            </div>
        </div>
    `;
    this.parent.appendChild(connectModal);

    Object.assign(this, {
      trueButton: document.getElementById('lcm-continue-button'),
      closeAction: document.getElementById('lcm-modal-overlay'),
    });

    this._buildListOfWallets();

    this.dialog.init({
      disableScroll: true,
      disableFocus: false,
      awaitOpenAnimation: false,
      awaitCloseAnimation: false,
      debugMode: false,
    });
  }

  _buildListOfWallets() {
    const contentContainer = document.getElementById(
      'lit-connect-modal-content'
    );
    let walletListHtml = ``;
    this.filteredListOfWalletsArray.forEach((w) => {
      walletListHtml += `
        <div class="lcm-wallet-container" id="${w.id}">
          <img class="lcm-wallet-logo"  src='${w.logo}' />
          <div class="lcm-text-column">
            <p class="lcm-wallet-name" >${w.name}</p>
            <p class="lcm-wallet-synopsis" >${w.synopsis}</p>
          </div>
        </div>
      `;
    });
    contentContainer.innerHTML = walletListHtml;
  }

  _destroy() {
    const dialog = document.getElementById('lit-connect-modal-container');
    if (!!dialog) {
      dialog.remove();
    }
  }
}

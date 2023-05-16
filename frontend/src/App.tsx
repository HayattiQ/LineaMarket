import { Web3OnboardProvider, init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import ledgerModule from "@web3-onboard/ledger";
import trezorModule from "@web3-onboard/trezor";
import walletConnectModule from "@web3-onboard/walletconnect";
import trustModule from "@web3-onboard/trust";
import i18nJapanese from "./lib/ja.json";
import { MantineProvider } from "@mantine/core";
import { Page } from "./Page";
import config from "./lib/config.json";
import chains from "./lib/chainList.json";
import web3authModule from "@web3-onboard/web3auth";

const web3auth = web3authModule({
  // @ts-ignore
  clientId: config.Web3AuthClientID[config.NETWORK],
});

const injected = injectedModule();
const walletConnect = walletConnectModule();

const ledger = ledgerModule();
const trust = trustModule();

const trezorOptions = {
  email: "test@test.com",
  appUrl: "https://www.blocknative.com",
};

const trezor = trezorModule(trezorOptions);

const wallets = [injected, trust, ledger, trezor, walletConnect];

const web3Onboard = init({
  wallets,
  chains: chains.filter((val) => val.id === config.NETWORK),
  appMetadata: {
    name: "iPadmate Doodle",
    icon: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
    description: "iPadmate Doodle",
    recommendedInjectedWallets: [
      { name: "MetaMask", url: "https://metamask.io" },
      { name: "Ledger", url: "https://www.ledger.com/" },
    ],
  },
  apiKey: "7ea8f7f7-e81f-4eb1-a09e-259c993e3499",
  i18n: { ja: i18nJapanese },
});

function App() {
  let saleType: keyof typeof config.SALE_TYPE_LIST = "2";
  if (import.meta.env.VITE_SALE_TYPE) {
    saleType = import.meta.env.VITE_SALE_TYPE;
  } else {
    console.log("Sale type env is not found.");
  }
  return (
    <MantineProvider theme={{primaryColor: "red"}} withGlobalStyles withNormalizeCSS>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        <Page saleType={saleType} />
      </Web3OnboardProvider>
    </MantineProvider>
  );
}

export default App;

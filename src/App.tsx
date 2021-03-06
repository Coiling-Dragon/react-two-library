import * as React from "react";
import styled from "styled-components";

import Web3Modal from "web3modal";
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
import Column from "./components/Column";
import Wrapper from "./components/Wrapper";
import Header from "./components/Header";
import Loader from "./components/Loader";
import ConnectButton from "./components/ConnectButton";
import Library from "./components/library/Library";

import { Web3Provider } from "@ethersproject/providers";
import { getChainData } from "./helpers/utilities";

import { BOOK_LIBRARY_ADDRESS } from "./constants";
import { BOOK_LIBRARY_ABI } from "./constants";

import { LTOKEN_ADDRESS } from "./constants";
import { LTOKEN_ABI } from "./constants";

import { getContract } from "./helpers/ethers";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SLanding = styled(Column)`
  height: auto;
`;

// @ts-ignore
const SBalances = styled(SLanding)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

interface IAppState {
  fetching: boolean;
  address: string;
  library: any;
  connected: boolean;
  chainId: number;
  pendingRequest: boolean;
  result: any | null;
  electionContract: any | null;
  info: any | null;
  tokenContract: any | null;
  libraryContract: any | null;
  BOOK_LIBRARY_ADDRESS: string;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: "",
  library: null,
  connected: false,
  chainId: 1,
  pendingRequest: false,
  result: null,
  electionContract: null,
  info: null,
  tokenContract: null,
  libraryContract: null,
  BOOK_LIBRARY_ADDRESS,
};

class App extends React.Component<any, any> {
  // @ts-ignore
  public web3Modal: Web3Modal;
  public state: IAppState;
  public provider: any;

  constructor(props: any) {
    super(props);
    this.state = {
      ...INITIAL_STATE,
    };

    this.web3Modal = new Web3Modal({
      network: this.getNetwork(),
      cacheProvider: true,
      providerOptions: this.getProviderOptions(),
    });
  }

  public componentDidMount() {
    if (this.web3Modal.cachedProvider) {
      this.onConnect();
    }
  }

  public onConnect = async () => {
    this.provider = await this.web3Modal.connect();

    const library = new Web3Provider(this.provider);

    const network = await library.getNetwork();

    const address = this.provider.selectedAddress
      ? this.provider.selectedAddress
      : this.provider?.accounts[0];

    const tokenContract = getContract(
      LTOKEN_ADDRESS,
      LTOKEN_ABI,
      library,
      address
    );

    const libraryContract = getContract(
      BOOK_LIBRARY_ADDRESS,
      BOOK_LIBRARY_ABI,
      library,
      address
    );

    await this.setState({
      library,
      chainId: network.chainId,
      address,
      connected: true,
      tokenContract,
      libraryContract,
    });

    await this.subscribeToProviderEvents(this.provider);
  };

  public subscribeToProviderEvents = async (provider: any) => {
    if (!provider.on) {
      return;
    }

    provider.on("accountsChanged", this.changedAccount);
    provider.on("networkChanged", this.networkChanged);
    provider.on("close", this.close);

    await this.web3Modal.off("accountsChanged");
  };

  public async unSubscribe(provider: any) {
    // Workaround for metamask widget > 9.0.3 (provider.off is undefined);
    // @ts-ignore
    window.location.reload(false);
    if (!provider.off) {
      return;
    }

    provider.off("accountsChanged", this.changedAccount);
    provider.off("networkChanged", this.networkChanged);
    provider.off("close", this.close);
  }

  public changedAccount = async (accounts: string[]) => {
    if (!accounts.length) {
      // Metamask Lock fire an empty accounts array
      await this.resetApp();
    } else {
      await this.setState({ address: accounts[0] });
    }
  };

  public networkChanged = async (networkId: number) => {
    const library = new Web3Provider(this.provider);
    const network = await library.getNetwork();
    const chainId = network.chainId;
    await this.setState({ chainId, library });
  };

  public close = async () => {
    this.resetApp();
  };

  public getNetwork = () => getChainData(this.state.chainId).network;

  public getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID,
        },
      },
    };
    return providerOptions;
  };

  public resetApp = async () => {
    await this.web3Modal.clearCachedProvider();
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");
    localStorage.removeItem("walletconnect");
    await this.unSubscribe(this.provider);

    this.setState({ ...INITIAL_STATE });
  };

  public render = () => {
    const { address, connected, chainId, fetching } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1500} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.resetApp}
          />
          <SContent>
            {fetching ? (
              <Column center>
                <SContainer>
                  <Loader />
                </SContainer>
              </Column>
            ) : (
              <SLanding center>
                {!this.state.connected ? (
                  <ConnectButton onClick={this.onConnect} />
                ) : (
                  <>
                    <p>
                      <a
                        href={`https://ropsten.etherscan.io/address/${this.state.BOOK_LIBRARY_ADDRESS}`}
                        style={{ color: "blue" }}
                      >
                        Library address:
                      </a>{" "}
                      {this.state.BOOK_LIBRARY_ADDRESS}
                    </p>
                    <p>
                      <a
                        href={`https://ropsten.etherscan.io/address/${LTOKEN_ADDRESS}`}
                        style={{ color: "blue" }}
                      >
                        Token address:
                      </a>{" "}
                      {LTOKEN_ADDRESS}
                    </p>
                    <Library
                      connected={connected}
                      library={this.state.library}
                      address={this.state.address}
                      BOOK_LIBRARY_ADDRESS={this.state.BOOK_LIBRARY_ADDRESS}
                      tokenContract={this.state.tokenContract}
                      libraryContract={this.state.libraryContract}
                    />
                  </>
                )}
              </SLanding>
            )}
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;

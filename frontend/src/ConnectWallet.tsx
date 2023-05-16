import { useEffect, useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import MintNFT from "./MintNFT";
import { Alert, Button, Container, Grid, Text } from "@mantine/core";
import config from "./lib/config.json";
import { BigNumber, ethers } from "ethers";
import abi from "./lib/abi.json";

type Props = {
  stepChange: (num: number) => void;
  saleType: keyof typeof config.SALE_TYPE_LIST;
};

export type MerkleResult = {
  hexProof: string[];
  address: string;
  presaleMax: number;
};

export type ContractValue = {
  totalSupply: BigNumber;
  maxSupply: BigNumber;
  mintable: boolean;
  paused: boolean;
  phaseOpened: boolean;
  cost: BigNumber;
  maxPerTx: number;
};

export default function ConnectWallet({ stepChange, saleType }: Props) {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const [error, setError] = useState<string>("");
  const [merkle, setMerkle] = useState<MerkleResult>();
  const [contractValue, setContractValue] = useState<ContractValue>();

  const getMerkleData = (address: string) => {
    fetch(
      "/.netlify/functions/merkletree?phase=" +
        import.meta.env.VITE_SALE_TYPE +
        "&address=" +
        address
    )
      .then((res) => res.json())
      .then(
        (result: MerkleResult) => {
          console.log(result);
          setMerkle(result);
        },
        (error) => {
          console.log(error);
        }
      )
      .catch((error) => {
        console.error("通信に失敗しました", error);
      });
  };

  useEffect(() => {
    if (wallet?.provider) {
      stepChange(2);
      console.log(wallet);
      const provider = new ethers.providers.Web3Provider(
        wallet.provider,
        "any"
      );
      if (config["SALE_TYPE_LIST"][saleType]["AllowList"] && !merkle) {
        getMerkleData(wallet.accounts[0].address);
      }
      readContract(provider);
    } else {
      stepChange(1);
    }
  }, [wallet]);

  async function readContract(provider: ethers.providers.Web3Provider) {
    try {
      const signer = provider.getSigner();
      const nftContract = new ethers.Contract(
        config.CONTRACT_ADDRESS,
        abi,
        signer
      );
      let totalSupply: BigNumber,
        maxSupply: BigNumber,
        mintable: boolean,
        phaseOpened: boolean,
        cost: BigNumber,
        paused: boolean;
      totalSupply = await nftContract.callStatic.totalSupply();
      maxSupply = await nftContract.callStatic.MAX_SUPPLY();
      mintable = await nftContract.callStatic.mintable();
      paused = await nftContract.callStatic.paused();

      if (config.SALE_TYPE_LIST[saleType]["AllowList"]) {
        phaseOpened = await nftContract.callStatic.presalePhase(saleType);
        cost = await nftContract.callStatic.presaleCost(saleType);
      } else {
        phaseOpened = await nftContract.callStatic.publicSale();
        cost = await nftContract.callStatic.publicCost();
      }

      const contact = {
        totalSupply,
        maxSupply,
        mintable,
        paused,
        phaseOpened,
        cost,
        maxPerTx: config.MAX_MINT_AMOUNT_PUBLIC,
      };
      setContractValue(contact);
    } catch (e: unknown) {
      console.log(e);
    }
  }

  const MintNFTGrid = () => {
    if (config.SALE_TYPE_LIST[saleType]["AllowList"] && !merkle) {
      return (
        <Grid.Col xs={12}>
          <Text>You don't have AllowList</Text>
        </Grid.Col>
      );
    }
    return (
      <Grid.Col xs={12}>
        {contractValue?.mintable &&
          !contractValue.paused &&
          contractValue.phaseOpened && (
            <MintNFT
              stepChange={stepChange}
              setError={setError}
              ContractValue={contractValue}
              merkleData={merkle}
              saleType={saleType}
            />
          )}
      </Grid.Col>
    );
  };

  if (wallet?.provider) {
    return (
      <Container fluid>
        <Grid grow>
          <Grid.Col xs={12}>
            <Text align="center">Connected to {wallet.label}</Text>
            <Text align="center">{config.NETWORK_NAME} Network</Text>
            <Text
              align="center"
              fw={700}
              variant="gradient"
              size={60}
              gradient={{ from: "indigo", to: "cyan", deg: 45 }}
            >
              <span>
                {contractValue?.totalSupply.toString()} /{" "}
                {contractValue?.maxSupply.toString()}
              </span>
            </Text>
            <Text align="center">
              {contractValue?.mintable &&
              !contractValue.paused &&
              contractValue.phaseOpened
                ? "MINT LIVE"
                : "Mint is Closed"}
            </Text>
            {merkle && (
              <Text align="center">You have {merkle.presaleMax} AllowList</Text>
            )}
          </Grid.Col>
          <MintNFTGrid />
          {error && (
            <Grid.Col xs={12}>
              <Alert title="Failed!" color="red">
                <Text lineClamp={6} style={{ wordBreak: "break-all" }}>
                  {error}
                </Text>
              </Alert>
            </Grid.Col>
          )}
        </Grid>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Button
        radius="md"
        size="xl"
        disabled={connecting}
        onClick={() => (wallet ? disconnect(wallet) : connect())}
      >
        Connect wallet
      </Button>
    </Container>
  );
}

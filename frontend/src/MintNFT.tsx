import { useEffect, useRef, useState } from "react";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { BigNumber, ethers } from "ethers";
import abi from "./lib/abi.json";
import config from "./lib/config.json";
import {
  ActionIcon,
  Button,
  Text,
  Notification,
  Card,
  Group,
  NumberInput,
  NumberInputHandlers,
  Loader,
  SimpleGrid,
  Center,
  Anchor,
} from "@mantine/core";
import { Balances } from "@web3-onboard/core/dist/types";
import { ContractValue, MerkleResult } from "./ConnectWallet";

type Props = {
  stepChange: (num: number) => void;
  setError: (message: string) => void;
  ContractValue: ContractValue;
  saleType: keyof typeof config.SALE_TYPE_LIST;
  merkleData: MerkleResult | undefined;
};

export default function MintNFT({
  stepChange,
  setError,
  ContractValue,
  merkleData,
  saleType,
}: Props) {
  const [{ connectedChain }, setChain] = useSetChain();
  const [{ wallet }, connect, disconnect] = useConnectWallet();
  const [amount, setAmount] = useState(1);
  const [mintFee, setMintFee] = useState<BigNumber>(BigNumber.from(0));
  const [waitTX, setWaitTX] = useState(false);
  const [completeTX, setCompleteTX] = useState(false);
  const handlers = useRef<NumberInputHandlers>();
  const [account, setAccount] = useState<{
    address: string;
    balance: Balances;
  } | null>(null);

  const MaxPerMint = merkleData
    ? merkleData.presaleMax
    : ContractValue.maxPerTx;

  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>();
  useEffect(() => {
    if (wallet?.provider) {
      setProvider(new ethers.providers.Web3Provider(wallet.provider, "any"));
      setAccount({
        address: wallet.accounts[0].address,
        balance: wallet.accounts[0].balance,
      });
    }
  }, [wallet]);


  const readyToTransact = async () => {
    if (!wallet) {
      const walletSelected = await connect();
      if (!walletSelected) return false;
    }

    if (connectedChain && connectedChain.id !== "0x5") {
      await setChain({ chainId: config.NETWORK });
    }
    return true;
  };
  async function mint(amount: number) {
    try {
      const signer = provider?.getSigner();
      const nftContract = new ethers.Contract(
        config.CONTRACT_ADDRESS,
        abi,
        signer
      );

      if (!account) {
        throw new Error("Account can not find");
      }

      setWaitTX(true);
      setCompleteTX(false);
      stepChange(2);
      setError("");

      let nftTx;
      if (config.SALE_TYPE_LIST[saleType]["AllowList"]) {
        if (!merkleData) {
          throw new Error(
            "You don't have AllowList or connect AllowList Server is broken."
          );
        }

        const tx = (nftTx = await nftContract.callStatic.preMint(
          amount,
          merkleData.presaleMax,
          merkleData.hexProof,
          saleType
        ));


        nftTx = await nftContract.preMint(
          amount,
          merkleData.presaleMax,
          merkleData.hexProof,
          saleType
        );
      } else {
        nftTx = await nftContract.publicMint(account.address, amount);
      }
      console.log("Minting....", nftTx.hash);

      let tx = await nftTx.wait();
      stepChange(3);
      setCompleteTX(true);
      setWaitTX(false);
      console.log(tx);
    } catch (e: unknown) {
      setWaitTX(false);
      if (e instanceof Error) {
        setError(e.message);
      }
      console.log("Error Caught in Catch Statement: ", e);
    }
  }

  async function liveMint(amount: number) {
    const ready = await readyToTransact();
    if (!ready) return;
    mint(amount);
  }

  const MintButton = () => {
    return (
      <>
        {completeTX === true && (
          <>
            <Notification color="teal" title="Mint is success!" disallowClose>
              See{" "}
              <Anchor href={config.MARKETPLACE_LINK} target="_blank">
                {config.MARKETPLACE} to see your NFT
              </Anchor>
            </Notification>
          </>
        )}
        <Button
          radius="md"
          size="lg"
          fullWidth
          onClick={async () => {
            liveMint(amount);
          }}
          uppercase
        >
          mint now
        </Button>
        <Button
          onClick={() => {
            disconnect({ label: wallet!.label });
          }}
          variant="subtle"
          radius="xs"
          fullWidth
          size="md"
        >
          disconnect
        </Button>
      </>
    );
  };

  return (
    <>
      <Card shadow="sm" px="lg" my="lg" radius="md" withBorder>
        <Group position="apart" mb="xs">
          <Text weight={500}>Mint Amount</Text>
        </Group>

        <Group spacing={5} mt="md" position="center">
          <ActionIcon
            size={50}
            variant="default"
            onClick={() => handlers!.current!.decrement()}
          >
            –
          </ActionIcon>

          <NumberInput
            hideControls
            value={amount}
            onChange={(val) => setAmount(val!)}
            handlersRef={handlers}
            max={MaxPerMint}
            min={1}
            step={1}
            styles={{ input: { width: 70, height: 50, textAlign: "center" } }}
          />

          <ActionIcon
            size={50}
            variant="default"
            onClick={() => handlers!.current!.increment()}
          >
            +
          </ActionIcon>
        </Group>
        <Text mt="md" align="center">
          FreeMint
        </Text>
      </Card>
      {waitTX ? (
        <SimpleGrid cols={1}>
          <Center>
            <Loader size="lg" />
          </Center>
        </SimpleGrid>
      ) : (
        <MintButton />
      )}
    </>
  );
}

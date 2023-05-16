import {
  Paper,
  createStyles,
  Title,
  Text,
  Image,
  Stepper,
  Stack,
  MediaQuery,
  Box,
} from "@mantine/core";
import { useState } from "react";
import BackgroundImage from "./assets/background.jpg";
import BackgroundSPImage from "./assets/background_sp.jpg";
import BgLine from "./assets/bg_line.svg";
import ConnectWallet from "./ConnectWallet";
import config from "./lib/config.json";

const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: 900,
    height: "100vh",
    backgroundSize: "cover",
    backgroundImage: `url(${BackgroundImage})`,
  },

  form: {
    borderRight: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    minHeight: 900,
    maxWidth: 450,
    height: "100vh",
    paddingTop: 80,

    [`@media (max-width: ${theme.breakpoints.sm}px)`]: {
      maxWidth: "100%",
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  logo: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    width: 120,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

export function Page({
  saleType,
}: {
  saleType: keyof typeof config.SALE_TYPE_LIST;
}) {
  const { classes } = useStyles();
  const [active, setActive] = useState(1);

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} px={30} py="md">
        <Box mt="md" mb="xl">
          <Title order={2} className={classes.title} align="center">
            {config.NFT_NAME}
          </Title>
          <Image src={BgLine} pt={5} />
        </Box>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Image
            radius="md"
            mb="md"
            fit="cover"
            src={BackgroundSPImage}
            withPlaceholder
            alt={config.NFT_NAME}
          />
        </MediaQuery>
        <Stack align="center">
          <Text fz="xl">
            {config["SALE_TYPE_LIST"][saleType]["name"]} Mint Site
          </Text>
          <Stepper
            active={active}
            onStepClick={setActive}
            breakpoint="sm"
            my="lg"
            allowNextStepsSelect={false}
          >
            <Stepper.Step label="First" description="Connect Wallet" />
            <Stepper.Step label="Second" description="Minting" />
            <Stepper.Step label="Final" description="Complete" />
          </Stepper>
          <ConnectWallet stepChange={setActive} saleType={saleType} />
        </Stack>
      </Paper>
    </div>
  );
}

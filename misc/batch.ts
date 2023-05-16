const { execSync } = require('child_process')
import fs from 'fs'
import { ethers } from "ethers"

const CONTRACT_ADDRESS = "0x173edfdb54876b632c526f3d053417ab74726710";
const RPC_URL = process.env.MAINNET_RPC;
const PRIVATE_KEY = process.env.PRIVATE_KEY_NAYUTA_DEV3;

const addressList: [string, number][] = [
  ["0x32D248771d0B2b2B5dc1b8Ac97Fcf42a43A88f5C", 3],
  ["0xcaadFfF2cA8888039e95d1d7efCd682d52Fbb97B", 3],
  ["0x92EF52427910EB2a14F604026eE51ed45B959b33", 3],
  ["0x2A95c2c6AE0475e67B73E9E238F6746EE30a1C04", 3],
  ["0xCEA525eE12e751379e3B0e8fE4a737E8A8d15622", 3],
  ["0xEB09bB362247d83a95762e39C129D80EC32Dd94c", 20],
  ["0x65375f91a2159e472A9f3dF8884DD94C5d697703", 20],
  ["0x2d9925B4E2335B2f0a2921bC750Da9A3ca117bd3", 20],
  ["0xb23E1CF6AbB14353Eb5852a3ba9312DBCBC288cA", 20],
  ["0x4eF350148c799C468F1b838F8Bff591CF18956Ba", 18],
  ["0x197008a1D3e26A97A19f46C121482969cEF95b7d", 18],
  ["0xA1Ef694E2cE21f5Fa0E10b6247BE61C62606aa36", 18],
  ["0xAEc0ca82204e8927638aF11e9a5Be094E64A6901", 15],
  ["0xeb03AAeC3754c1C1953ad52B42Cd234bE78F03D0", 10],
  ["0x759E336d1d71Ab19f353ebd7e8F04f96C968F152", 10],
  ["0x984F7238713eFbE11750007eF49fd76Ad254511e", 10],
  ["0x4E2C7a9108707FEC76f0a973efac3fb81d5FAbC0", 10],
  ["0x7404FFd8ff702204495039e2143A640cC52726aB", 10],
  ["0x98BE6908C2E88886C137D73B97Ffe38a5877cf45", 3],
  ["0x6d6a605bcc6d81d0dbbc3fb124d0d89faf9bf311", 3],
]



async function main() {

  const records = addressList.filter((x) => { return ethers.utils.isAddress(x[0]) });

  if (records.length === 0)
    throw new Error('records have not value. please check column')


  for (let i = 0; i < records.length; i++) {

    const stdout = execSync(`cast send --private-key=${PRIVATE_KEY} \
  --rpc-url=${RPC_URL} \
  --gas-limit 150000 \
  --gas-price 35000000000 \
  ${CONTRACT_ADDRESS} \
  "ownerMint(address,uint256)" \
  ${records[i][0]} ${records[i][1]}`)
    console.log(stdout.toString())
    fs.writeFileSync('./mint.log', stdout.toString(), { flag: 'a' })
  }
}

main();
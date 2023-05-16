import keccak256 from 'keccak256'
import { MerkleTree } from 'merkletreejs'
import { ethers } from 'ethers'

const PROOF_ADDRESS = "0xb4b17085bac9b6968b53bdf0d9b08a61c0a9859f";

const addressList: [string, number][] = [
  ['0x1d96f2f6bef1202e4ce1ff6dad0c2cb002861d3e', 2], // bob
  ['0xb4b17085bac9b6968b53bdf0d9b08a61c0a9859f', 3], // alis
  ['0xea475d60c118d7058bef4bdd9c32ba51139a74e0', 3], // charlie
  ['0x701710ED9748Df7001C1551056a219a72a44eBF3', 4]
]

const leafNodes = addressList.map((x) => {
  return ethers.utils.solidityKeccak256(
    ['address', 'uint256'],
    [x[0], x[1]]
  )
})
const tree = new MerkleTree(leafNodes, keccak256, { sortPairs: true })

console.log('rootHash:', tree.getHexRoot())

const findedAddress: [string, number] =
  addressList.find((x) => x[0].toLowerCase() === PROOF_ADDRESS) ?? throwError('address can not find')

const hashedAddress = ethers.utils.solidityKeccak256(
  ['address', 'uint256'],
  [PROOF_ADDRESS, findedAddress[1]]
)
const hexProof = tree.getHexProof(hashedAddress)
console.log("hexProof:")
console.log(hexProof)
function throwError(errorString: string): any {
  throw new Error(errorString)
}

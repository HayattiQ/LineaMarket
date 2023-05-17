// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "forge-std/console2.sol";
import "forge-std/StdJson.sol";
import "forge-std/Script.sol";
import "../src/LineaNinja.sol";

contract Deploy is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_LINEA_DEV");
        vm.startBroadcast(deployerPrivateKey);
        LineaNinja nft = new LineaNinja();
        nft.publicMint(0x05f0c7DF3882549a08AB449e79eC9AA5D794ECDb, 1);
        vm.stopBroadcast();
    }
}

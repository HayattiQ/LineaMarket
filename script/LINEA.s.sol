// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "forge-std/console2.sol";
import "forge-std/StdJson.sol";
import "forge-std/Script.sol";
import "../src/LineaFox.sol";

contract Deploy is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_LINEA_DEV");
        vm.startBroadcast(deployerPrivateKey);
        LineaFox nft = new LineaFox();
        vm.stopBroadcast();
    }
}

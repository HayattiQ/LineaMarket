// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ENISHI.sol";

contract OwnerFunctionTest is Test {
    using stdStorage for StdStorage;

    ENISHI public nft;
    uint256 MAX_SUPPLY = 7000;

    function setUp() public {
        nft = new ENISHI(false);
        nft.setMintable(true);
        nft.setBaseURI("ar://predefine/");
    }

    function testSetBaseURI() public {
        nft.ownerMint(msg.sender, 2);
        assertEq(nft.tokenURI(1), "ar://predefine/1.json");
        nft.setBaseURI("ar://postdefine/");
        assertEq(nft.tokenURI(1), "ar://postdefine/1.json");
    }

    function testChangeMetadata() public {
        nft.ownerMint(msg.sender, 2);
        assertEq(nft.tokenURI(1), "ar://predefine/1.json");
        assertEq(nft.tokenURI(2), "ar://predefine/2.json");
        nft.setTokenMetadataURI(1, "ar://changed/1.jj");
        assertEq(nft.tokenURI(1), "ar://changed/1.jj");
        assertEq(nft.tokenURI(2), "ar://predefine/2.json");
    }

    function testOwnerMintMinterRole() public {
        // can not mint except MinterRole
        nft.revokeRole(keccak256("MINTER_ROLE"), nft.owner());
        vm.expectRevert();
        nft.ownerMint(msg.sender, 1);
    }

    function testOwnerMintProtect() public {
        // mint amount is zero
        vm.expectRevert();
        nft.ownerMint(msg.sender, 0);

        // mint success
        nft.ownerMint(msg.sender, 1);

        // mint renounced
        nft.renounceOwnerMint();
        vm.expectRevert(bytes("owner mint renounced"));
        nft.ownerMint(msg.sender, 1);
    }

    function setDefaultRoyality() public {
        nft.setDefaultRoyalty(makeAddr("bob"), 1000);
        (address receiver, uint256 royality) = nft.royaltyInfo(1, 1 ether);
        assertEq(receiver, makeAddr("bob"));
        assertEq(royality, 0.1 ether);

        nft.revokeRole(0x00, nft.owner());
        vm.expectRevert();
        nft.setDefaultRoyalty(makeAddr("alis"), 1000);
    }

    function testOwnerFuncionNeedAdminRole() public {
        nft.setBaseURI("test");
        nft.setTokenMetadataURI(1, "test");
        nft.setMerkleRoot(0x00, TicketID.AllowList);
        nft.setCallerIsUserFlg(false);
        nft.setPresalePhase(false, TicketID.AllowList);
        nft.setPublicCost(0.01 ether);
        nft.setPublicPhase(false);
        nft.setMintable(false);
        nft.setBaseURI("assertE");
        nft.pause();
        nft.unpause();
        nft.withdraw(false);
        nft.revokeRole(0x00, nft.owner());
        vm.expectRevert();
        nft.setBaseURI("test");
        vm.expectRevert();
        nft.setTokenMetadataURI(1, "test");
        vm.expectRevert();
        nft.setMerkleRoot(0x00, TicketID.AllowList);
        vm.expectRevert();
        nft.setCallerIsUserFlg(false);
        vm.expectRevert();
        nft.setPresalePhase(false, TicketID.AllowList);
        vm.expectRevert();
        nft.setPublicCost(0.01 ether);
        vm.expectRevert();
        nft.setPublicPhase(false);
        vm.expectRevert();
        nft.setMintable(false);
        vm.expectRevert();
        nft.setBaseURI("assertE");
        vm.expectRevert();
        nft.pause();
        vm.expectRevert();
        nft.unpause();
        vm.expectRevert();
        nft.withdraw(false);
    }
}

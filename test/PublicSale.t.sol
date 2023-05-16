// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/ENISHI.sol";

contract PublicSaleTest is Test {
    using stdStorage for StdStorage;

    ENISHI public nft;

    uint256 publicPrice = 0.04 ether;
    uint256 notEnoughBalance = 0.039 ether;
    uint8 publicMaxMint = 10;
    uint256 NFT_MAX_SUPPLY = 2000;

    address bob;

    function setUp() public {
        nft = new ENISHI(false);
        nft.setMintable(true);
        nft.setPublicPhase(true);

        bob = makeAddr("bob");
        deal(bob, 30000 ether);
    }

    function testBasic() public {
        assertEq(nft.publicCost(), publicPrice);
    }

    function testCannotPublicNotOpen() public {
        nft.setPublicPhase(false);
        vm.startPrank(bob);
        vm.expectRevert(NotMintable.selector);
        nft.publicMint{value: publicPrice}(bob, 1);
    }

    function testFailMintableOff() public {
        nft.setPublicPhase(true);
        nft.setMintable(false);
        nft.publicMint(msg.sender, 1);
    }

    function testFailNotEnoughBlanace() public {
        nft.publicMint{value: notEnoughBalance}(msg.sender, 1);
    }

    function testMaxSupply() public {
        nft.ownerMint(bob, NFT_MAX_SUPPLY - 1);
        assertEq(nft.totalSupply(), NFT_MAX_SUPPLY - 1);
        vm.startPrank(bob);
        nft.publicMint{value: publicPrice}(bob, 1);
        vm.expectRevert(MaxSupplyOver.selector);
        nft.publicMint{value: publicPrice}(bob, 1);
    }

    function testPublicMint() public {
        address alis = makeAddr("alis");
        deal(alis, 300 ether);
        vm.startPrank(bob);

        // mint amount is zero
        vm.expectRevert();
        nft.publicMint{value: publicPrice}(bob, 0);

        nft.publicMint{value: publicPrice}(bob, 1);
        assertEq(nft.ownerOf(1), bob);
        assertEq(nft.totalSupply(), 1);

        nft.publicMint{value: publicPrice}(alis, 1);
        assertEq(nft.ownerOf(2), alis);
        assertEq(nft.totalSupply(), 2);

        vm.stopPrank();
    }

    function testWithDraw() public {
        // todo
    }

    function testPublicSaleMaxMint() public {
        vm.startPrank(bob);
        nft.publicMint{value: publicPrice * publicMaxMint}(
            msg.sender,
            publicMaxMint
        );
        nft.publicMint{value: publicPrice * publicMaxMint}(
            msg.sender,
            publicMaxMint
        );
        vm.expectRevert(MintAmountOver.selector);
        nft.publicMint{value: publicPrice * (publicMaxMint + 1)}(
            msg.sender,
            (publicMaxMint + 1)
        );
        vm.stopPrank();
    }

    function testFailWhenPaused() public {
        nft.pause();
        nft.publicMint{value: publicPrice}(msg.sender, 1);
    }

    function testPriceChange() public {
        nft.setPublicCost(0.123 ether);
        nft.publicMint{value: 0.123 ether}(msg.sender, 1);
        vm.expectRevert(
            abi.encodeWithSelector(NotEnoughFunds.selector, 0.122 ether)
        );
        nft.publicMint{value: 0.122 ether}(msg.sender, 1);
    }
}

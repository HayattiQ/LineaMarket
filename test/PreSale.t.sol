// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "forge-std/console2.sol";
import "../src/ENISHI.sol";
import "openzeppelin-contracts/contracts/utils/cryptography/MerkleProof.sol";

contract PreSaleTest is Test {
    using stdStorage for StdStorage;

    ENISHI public nft;

    uint64 prePrice = 0.04 ether;
    uint64 notEnoughBalance = 0.039 ether;
    uint256 NFT_MAX_SUPPLY = 2000;

    address private bob;
    address private alis;
    address private charlie;

    bytes32[] leafBob = new bytes32[](2);
    bytes32[] leafAlis = new bytes32[](2);

    bytes32[] private proof = new bytes32[](4);
    bytes32 private root;

    function setUp() public {
        nft = new ENISHI(false);
        nft.setMintable(true);
        nft.setPresalePhase(true, TicketID.AllowList);
        nft.setPresaleCost(prePrice, TicketID.AllowList);

        bob = makeAddr("bob");
        deal(bob, 300 ether);
        alis = makeAddr("alis");
        deal(alis, 300 ether);
        charlie = makeAddr("charlie");
        deal(charlie, 300 ether);

        proof[0] = keccak256(abi.encodePacked(bob, uint256(2)));
        proof[1] = keccak256(abi.encodePacked(alis, uint256(3)));
        proof[2] = keccak256(abi.encodePacked(makeAddr("nicole"), uint256(3)));
        proof[3] = keccak256(abi.encodePacked(makeAddr("mommy"), uint256(4)));
        root = 0x445a4106ceccc4b87a5bc03b38b571e999e8a91f78e77dd87e691f1b24d5dea8;

        leafBob[0] = bytes32(
            0xf7d7bff9f98413d49ae1483c91b4261f101b5d1f8251493f62d9e0d507b84b80
        );
        leafBob[1] = bytes32(
            0xd4bba1e6f7f9d50ec584513e2ea483b8602f21f44b1f249449d176569fe5c75e
        );

        leafAlis[0] = bytes32(
            0xda04c109cbb9e411132014c6469cdfa0441880fb901d3c8ca4717f5b839e657b
        );
        leafAlis[1] = bytes32(
            0xd4bba1e6f7f9d50ec584513e2ea483b8602f21f44b1f249449d176569fe5c75e
        );

        nft.setMerkleRoot(root, TicketID.AllowList);
    }

    function testMerkleBasic() public {
        bool merkleAssert = MerkleProof.verify(leafBob, root, proof[0]);
        assertTrue(merkleAssert);
    }

    function testPresaleBuy() public {
        vm.startPrank(bob);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        address mintAddress = nft.ownerOf(1);
        assertEq(mintAddress, bob);
        assertEq(nft.totalSupply(), 1);
        vm.stopPrank();
    }

    function testNonWhiteListCanNotBuy() public {
        vm.prank(charlie);
        vm.expectRevert(InvalidMerkleProof.selector);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        vm.prank(alis);
        vm.expectRevert(InvalidMerkleProof.selector);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        vm.prank(bob);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        assertEq(nft.totalSupply(), 1);
    }

    function testUserCantBuyMoreThanLimit() public {
        vm.startPrank(bob);

        vm.expectRevert(AlreadyClaimedMax.selector);
        nft.preMint{value: prePrice * 3}(3, 2, leafBob, TicketID.AllowList);

        vm.expectRevert(InvalidMerkleProof.selector);
        nft.preMint{value: prePrice}(1, 3, leafBob, TicketID.AllowList);

        vm.expectRevert(InvalidMerkleProof.selector);
        nft.preMint{value: prePrice}(1, 1, leafBob, TicketID.AllowList);

        vm.expectRevert(NotMintable.selector);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.FamilySale);

        bytes32[] memory invalidProof = new bytes32[](3);
        vm.expectRevert(InvalidMerkleProof.selector);
        nft.preMint{value: prePrice * 4}(
            4,
            4,
            invalidProof,
            TicketID.AllowList
        );
        vm.stopPrank();
    }

    function testPresalePhase() public {
        nft.setPresalePhase(false, TicketID.AllowList);

        vm.prank(bob);
        vm.expectRevert(NotMintable.selector);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);

        nft.setPresalePhase(true, TicketID.AllowList);
        vm.prank(bob);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        assertEq(nft.totalSupply(), 1);
    }

    function testMaxCap() public {
        bytes32[] memory crackedLeafBob = new bytes32[](2);
        crackedLeafBob[
            0
        ] = 0x142f0ded024de566000bf6014d3d32471ecf85c634b5d1c40d772a54439c3d58;
        crackedLeafBob[
            1
        ] = 0x92ec922003390e1be3988c3cb61f3b2d0aa2c8c55acb709f0a0b4f3a14cde428;
        bytes32 crackedMerkleRoot = 0x75365b7ade6252d1039219fac8304b74e94202efa14584be98b970937de8711b;
        nft.setMerkleRoot(crackedMerkleRoot, TicketID.AllowList);
        vm.startPrank(bob);
        vm.expectRevert(abi.encodeWithSelector(PreMaxExceed.selector, 10000));
        nft.preMint{value: prePrice}(
            1,
            10000,
            crackedLeafBob,
            TicketID.AllowList
        );
    }

    function testMaxSupply() public {
        nft.ownerMint(bob, NFT_MAX_SUPPLY - 1);
        assertEq(nft.totalSupply(), NFT_MAX_SUPPLY - 1);
        vm.startPrank(bob);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        vm.expectRevert(MaxSupplyOver.selector);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
    }

    function testMintAmountIsCorrect() public {
        vm.startPrank(alis);
        // mint amount is zero
        vm.expectRevert();
        nft.preMint{value: prePrice}(0, 3, leafAlis, TicketID.AllowList);
        // claimed in Max
        nft.preMint{value: prePrice * 2}(2, 3, leafAlis, TicketID.AllowList);
        nft.preMint{value: prePrice}(1, 3, leafAlis, TicketID.AllowList);
        vm.expectRevert(AlreadyClaimedMax.selector);
        nft.preMint{value: prePrice}(1, 3, leafAlis, TicketID.AllowList);
        vm.stopPrank();
        vm.startPrank(bob);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        vm.expectRevert(AlreadyClaimedMax.selector);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        vm.stopPrank();
        assertEq(nft.totalSupply(), 5);
    }

    function testPresaleFreeIsInvalid() public {
        nft.setPresaleCost(0, TicketID.AllowList);
        vm.startPrank(bob);
        vm.expectRevert(abi.encodeWithSelector(NotEnoughFunds.selector, 0));
        nft.preMint{value: 0}(1, 2, leafBob, TicketID.AllowList);
        vm.stopPrank();
    }

    function testMintPriceBoundary() public {
        vm.startPrank(bob);
        nft.preMint{value: prePrice + 1}(1, 2, leafBob, TicketID.AllowList);
        vm.expectRevert(
            abi.encodeWithSelector(NotEnoughFunds.selector, notEnoughBalance)
        );
        nft.preMint{value: notEnoughBalance}(1, 2, leafBob, TicketID.AllowList);
        vm.stopPrank();
    }

    function testBlockOverAllocate() public {
        vm.startPrank(bob);
        nft.preMint{value: prePrice * 2}(2, 2, leafBob, TicketID.AllowList);
        assertEq(nft.balanceOf(bob), 2);
        nft.safeTransferFrom(bob, alis, 1);
        assertEq(nft.balanceOf(bob), 1);
        vm.expectRevert(AlreadyClaimedMax.selector);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        nft.safeTransferFrom(bob, alis, 2);
        assertEq(nft.balanceOf(bob), 0);
        assertEq(nft.balanceOf(alis), 2);
        vm.expectRevert(AlreadyClaimedMax.selector);
        nft.preMint{value: prePrice}(1, 2, leafBob, TicketID.AllowList);
        vm.stopPrank();
    }
}

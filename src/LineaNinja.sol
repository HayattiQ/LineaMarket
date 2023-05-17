// SPDX-License-Identifier: MIT
pragma solidity >=0.8.17;

import {ERC721AQueryable} from "ERC721A/extensions/ERC721AQueryable.sol";
import "ERC721A/ERC721A.sol";
import {IERC2981, ERC2981} from "openzeppelin-contracts/contracts/token/common/ERC2981.sol";
import "./IERC4906.sol";
import "openzeppelin-contracts/contracts/access/AccessControl.sol";

error PreMaxExceed(uint256 _presaleMax);
error MaxSupplyOver();
error NotEnoughFunds(uint256 balance);
error NotMintable();
error InvalidMerkleProof();
error AlreadyClaimedMax();
error MintAmountOver();

contract LineaNinja is
    ERC721A,
    IERC4906,
    ERC721AQueryable,
    AccessControl,
    ERC2981
{
    uint256 private constant PUBLIC_MAX_PER_TX = 1;
    uint256 public constant MAX_SUPPLY = 10000;
    string private constant BASE_EXTENSION = ".json";

    bool public callerIsUserFlg = false;
    bool public mintable = true;
    bool public renounceOwnerMintFlag = false;

    string private baseURI =
        "https://arweave.net/9O3lwzBeZ_NMYGBWwp1gNhuVYkz4D5PuCAGWDjrgFVo";

    mapping(uint256 => string) private metadataURI;

    constructor() ERC721A("LineaNinja", "LINEANINJA") {
        callerIsUserFlg = true;
        _grantRole(
            DEFAULT_ADMIN_ROLE,
            0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141
        );
    }

    modifier whenMintable() {
        if (mintable == false) revert NotMintable();
        _;
    }

    /**
     * @dev The modifier allowing the function access only for real humans.
     */
    modifier callerIsUser() {
        if (callerIsUserFlg == true) {
            require(tx.origin == msg.sender, "The caller is another contract");
        }
        _;
    }

    // internal
    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override(ERC721A, IERC721A) returns (string memory) {
        if (bytes(metadataURI[tokenId]).length == 0) {
            return string(abi.encodePacked(_baseURI(), BASE_EXTENSION));
        } else {
            return metadataURI[tokenId];
        }
    }

    function setTokenMetadataURI(
        uint256 tokenId,
        string memory metadata
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        metadataURI[tokenId] = metadata;
        emit MetadataUpdate(tokenId);
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    function setCallerIsUserFlg(
        bool flg
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        callerIsUserFlg = flg;
    }

    function publicMint(
        address _to,
        uint256 _mintAmount
    ) external callerIsUser whenMintable {
        if (_totalMinted() + _mintAmount > MAX_SUPPLY) revert MaxSupplyOver();
        if (_mintAmount > PUBLIC_MAX_PER_TX) revert MintAmountOver();

        _mint(_to, _mintAmount);
    }

    function ownerMint(
        address _address,
        uint256 count
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(!renounceOwnerMintFlag, "owner mint renounced");
        _safeMint(_address, count);
    }

    function setMintable(bool _state) external onlyRole(DEFAULT_ADMIN_ROLE) {
        mintable = _state;
    }

    function setBaseURI(
        string memory _newBaseURI
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        baseURI = _newBaseURI;
        emit BatchMetadataUpdate(_startTokenId(), totalSupply());
    }

    function withdraw(
        address _address
    ) external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        payable(_address).transfer(address(this).balance);
    }

    function renounceOwnerMint() external virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        renounceOwnerMintFlag = true;
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721A, IERC721A, ERC2981, AccessControl)
        returns (bool)
    {
        return
            ERC721A.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }

    function setDefaultRoyalty(
        address receiver,
        uint96 feeNumerator
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
}

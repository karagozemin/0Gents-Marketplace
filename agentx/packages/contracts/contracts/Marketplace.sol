// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Marketplace is Ownable {
    struct Listing {
        address nft;
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
    }

    uint256 public nextListingId = 1;
    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed listingId, address indexed nft, uint256 indexed tokenId, address seller, uint256 price);
    event Purchased(uint256 indexed listingId, address buyer);
    event Cancelled(uint256 indexed listingId);

    constructor() Ownable(msg.sender) {}

    function list(address nft, uint256 tokenId, uint256 price) external returns (uint256 listingId) {
        require(price > 0, "PRICE_ZERO");
        require(IERC721(nft).ownerOf(tokenId) == msg.sender, "NOT_OWNER");
        require(IERC721(nft).getApproved(tokenId) == address(this) || IERC721(nft).isApprovedForAll(msg.sender, address(this)), "NOT_APPROVED");

        listingId = nextListingId++;
        listings[listingId] = Listing({nft: nft, tokenId: tokenId, seller: msg.sender, price: price, active: true});
        emit Listed(listingId, nft, tokenId, msg.sender, price);
    }

    function buy(uint256 listingId) external payable {
        Listing storage l = listings[listingId];
        require(l.active, "NOT_ACTIVE");
        require(msg.value == l.price, "BAD_PRICE");

        l.active = false;
        IERC721(l.nft).safeTransferFrom(l.seller, msg.sender, l.tokenId);
        (bool ok, ) = payable(l.seller).call{value: msg.value}("");
        require(ok, "PAY_FAIL");
        emit Purchased(listingId, msg.sender);
    }

    function cancel(uint256 listingId) external {
        Listing storage l = listings[listingId];
        require(l.active, "NOT_ACTIVE");
        require(l.seller == msg.sender || msg.sender == owner(), "NOT_AUTH");
        l.active = false;
        emit Cancelled(listingId);
    }
}



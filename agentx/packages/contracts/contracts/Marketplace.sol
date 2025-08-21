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
    
    // Fee system
    uint256 public platformFeePercent = 1000; // 10% in basis points (10000 = 100%)
    address public feeRecipient;

    event Listed(uint256 indexed listingId, address indexed nft, uint256 indexed tokenId, address seller, uint256 price);
    event Purchased(uint256 indexed listingId, address buyer, uint256 platformFee);
    event Cancelled(uint256 indexed listingId);
    event FeeUpdated(uint256 newFeePercent, uint256 newListingFee);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address _feeRecipient) Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

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
        
        // Calculate platform fee (10%)
        uint256 platformFee = (l.price * platformFeePercent) / 10000;
        uint256 sellerAmount = l.price - platformFee;
        
        // Transfer NFT to buyer
        IERC721(l.nft).safeTransferFrom(l.seller, msg.sender, l.tokenId);
        
        // Pay seller (90%)
        if (sellerAmount > 0) {
            (bool sellerSuccess, ) = payable(l.seller).call{value: sellerAmount}("");
            require(sellerSuccess, "SELLER_PAY_FAIL");
        }
        
        // Pay platform fee (10%)
        if (platformFee > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: platformFee}("");
            require(feeSuccess, "FEE_PAY_FAIL");
        }
        
        emit Purchased(listingId, msg.sender, platformFee);
    }

    function cancel(uint256 listingId) external {
        Listing storage l = listings[listingId];
        require(l.active, "NOT_ACTIVE");
        require(l.seller == msg.sender || msg.sender == owner(), "NOT_AUTH");
        l.active = false;
        emit Cancelled(listingId);
    }
    
    // Admin functions
    function updatePlatformFee(uint256 _platformFeePercent) external onlyOwner {
        require(_platformFeePercent <= 2500, "FEE_TOO_HIGH"); // Max 25%
        platformFeePercent = _platformFeePercent;
        emit FeeUpdated(_platformFeePercent, 0);
    }
    
    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "ZERO_ADDRESS");
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }
    
    // Emergency withdraw function
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "WITHDRAW_FAILED");
    }
    
    // View functions
    function calculateFees(uint256 price) external view returns (uint256 platformFee, uint256 sellerAmount) {
        platformFee = (price * platformFeePercent) / 10000;
        sellerAmount = price - platformFee;
    }
}



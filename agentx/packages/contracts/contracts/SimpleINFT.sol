// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleINFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    
    // Simplified fee system
    uint256 public creationFee = 0.005 ether;
    address public feeRecipient;

    event AgentCreated(uint256 indexed tokenId, address indexed creator, string tokenURI);

    constructor(address _feeRecipient) ERC721("AgentX INFT", "AINFT") Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    function mint(string calldata tokenURI_) external payable returns (uint256 tokenId) {
        require(msg.value >= creationFee, "Insufficient fee");
        
        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        // Simplified fee transfer - only if fee > 0
        if (msg.value > 0 && feeRecipient != address(0)) {
            (bool success, ) = payable(feeRecipient).call{value: msg.value}("");
            require(success, "Fee transfer failed");
        }
        
        emit AgentCreated(tokenId, msg.sender, tokenURI_);
    }

    // Override functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // Admin functions
    function updateCreationFee(uint256 _newFee) external onlyOwner {
        creationFee = _newFee;
    }
    
    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        feeRecipient = _newRecipient;
    }
    
    function withdraw() external onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
}

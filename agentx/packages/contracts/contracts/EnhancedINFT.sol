// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EnhancedINFT
 * @notice Enhanced INFT implementation with AI agent capabilities
 * @dev Based on ERC-721 with additional features for AI agents
 */
contract EnhancedINFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;
    
    // Enhanced fee system
    uint256 public creationFee = 0.005 ether;
    address public feeRecipient;
    
    // AI Agent specific properties
    struct AgentData {
        string name;
        string description;
        string category;
        address creator;
        uint256 createdAt;
        uint256 usageCount;
        bool isActive;
        string computeModel; // 0G Compute model reference
        string storageHash; // 0G Storage hash
        string[] capabilities;
    }
    
    mapping(uint256 => AgentData) public agentData;
    mapping(address => uint256[]) public creatorAgents;
    
    // Usage tracking for revenue sharing
    mapping(uint256 => mapping(address => uint256)) public agentUsage;
    mapping(uint256 => uint256) public totalUsage;
    
    // Events
    event AgentCreated(
        uint256 indexed tokenId, 
        address indexed creator, 
        string name,
        string tokenURI,
        string storageHash
    );
    event AgentUsed(uint256 indexed tokenId, address indexed user, uint256 usageCount);
    event AgentStatusChanged(uint256 indexed tokenId, bool isActive);
    event CreationFeeUpdated(uint256 newFee);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address _feeRecipient) ERC721("AgentX Enhanced INFT", "AEINFT") Ownable(msg.sender) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice Simple mint function (compatible with existing interface)
     * @param tokenURI_ The metadata URI
     */
    function mint(string calldata tokenURI_) external payable returns (uint256 tokenId) {
        require(msg.value >= creationFee, "INSUFFICIENT_CREATION_FEE");
        
        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        // Send creation fee to fee recipient
        if (msg.value > 0) {
            (bool success, ) = payable(feeRecipient).call{value: msg.value}("");
            require(success, "FEE_TRANSFER_FAILED");
        }
        
        emit AgentCreated(tokenId, msg.sender, "Simple Agent", tokenURI_, tokenURI_);
    }

    /**
     * @notice Mint a new AI Agent INFT with enhanced metadata
     * @param tokenURI_ The metadata URI (0G Storage reference)
     * @param agentParams Packed agent parameters [name, description, category, computeModel, storageHash]
     * @param capabilities_ Array of agent capabilities
     */
    function mintAgent(
        string calldata tokenURI_,
        string[5] calldata agentParams, // [name, description, category, computeModel, storageHash]
        string[] calldata capabilities_
    ) external payable returns (uint256 tokenId) {
        require(msg.value >= creationFee, "INSUFFICIENT_CREATION_FEE");
        require(bytes(agentParams[0]).length > 0, "NAME_REQUIRED");
        require(bytes(agentParams[4]).length > 0, "STORAGE_HASH_REQUIRED");
        
        tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);
        
        // Store agent data
        agentData[tokenId] = AgentData({
            name: agentParams[0],
            description: agentParams[1],
            category: agentParams[2],
            creator: msg.sender,
            createdAt: block.timestamp,
            usageCount: 0,
            isActive: true,
            computeModel: agentParams[3],
            storageHash: agentParams[4],
            capabilities: capabilities_
        });
        
        // Track creator's agents
        creatorAgents[msg.sender].push(tokenId);
        
        // Send creation fee to fee recipient
        if (msg.value > 0) {
            (bool success, ) = payable(feeRecipient).call{value: msg.value}("");
            require(success, "FEE_TRANSFER_FAILED");
        }
        
        emit AgentCreated(tokenId, msg.sender, agentParams[0], tokenURI_, agentParams[4]);
    }

    /**
     * @notice Record usage of an AI agent (for revenue tracking)
     * @param tokenId The token ID of the agent
     */
    function recordUsage(uint256 tokenId) external {
        require(_exists(tokenId), "NONEXISTENT_TOKEN");
        require(agentData[tokenId].isActive, "AGENT_NOT_ACTIVE");
        
        agentUsage[tokenId][msg.sender]++;
        totalUsage[tokenId]++;
        agentData[tokenId].usageCount++;
        
        emit AgentUsed(tokenId, msg.sender, agentData[tokenId].usageCount);
    }

    /**
     * @notice Toggle agent active status (owner only)
     * @param tokenId The token ID of the agent
     * @param isActive New active status
     */
    function setAgentStatus(uint256 tokenId, bool isActive) external {
        require(_exists(tokenId), "NONEXISTENT_TOKEN");
        require(ownerOf(tokenId) == msg.sender, "NOT_OWNER");
        
        agentData[tokenId].isActive = isActive;
        emit AgentStatusChanged(tokenId, isActive);
    }

    /**
     * @notice Get agent capabilities
     * @param tokenId The token ID of the agent
     */
    function getAgentCapabilities(uint256 tokenId) external view returns (string[] memory) {
        require(_exists(tokenId), "NONEXISTENT_TOKEN");
        return agentData[tokenId].capabilities;
    }

    /**
     * @notice Get agents created by a specific address
     * @param creator The creator address
     */
    function getCreatorAgents(address creator) external view returns (uint256[] memory) {
        return creatorAgents[creator];
    }

    /**
     * @notice Get usage statistics for an agent
     * @param tokenId The token ID of the agent
     * @param user The user address (optional, use address(0) for total)
     */
    function getUsageStats(uint256 tokenId, address user) external view returns (uint256) {
        require(_exists(tokenId), "NONEXISTENT_TOKEN");
        
        if (user == address(0)) {
            return totalUsage[tokenId];
        } else {
            return agentUsage[tokenId][user];
        }
    }

    // Overrides required by Solidity
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
        emit CreationFeeUpdated(_newFee);
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

    // Internal function to check if token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}

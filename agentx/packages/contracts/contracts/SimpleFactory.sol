// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SimpleFactory
 * @notice Minimal Factory for testing
 */
contract SimpleFactory {
    address public marketplace;
    address public owner;
    uint256 public creationFee = 0.01 ether;
    
    // Track created agents (just addresses, no actual creation)
    address[] public allAgents;
    
    event AgentCreated(address indexed creator, string name);
    
    constructor(address marketplace_) {
        marketplace = marketplace_;
        owner = msg.sender;
    }
    
    /**
     * @notice Simulate agent creation without complex logic
     */
    function createAgent(string memory agentName_) external payable returns (uint256) {
        require(msg.value >= creationFee, "INSUFFICIENT_FEE");
        require(bytes(agentName_).length > 0, "NAME_REQUIRED");
        
        // Just store sender as "agent" address (no actual contract creation)
        allAgents.push(msg.sender);
        
        emit AgentCreated(msg.sender, agentName_);
        
        return allAgents.length - 1;
    }
    
    /**
     * @notice Get total number of agents
     */
    function getTotalAgents() external view returns (uint256) {
        return allAgents.length;
    }
    
    /**
     * @notice Get agent at index
     */
    function getAgentAt(uint256 index) external view returns (address) {
        require(index < allAgents.length, "INDEX_OUT_OF_BOUNDS");
        return allAgents[index];
    }
    
    // Admin functions
    function updateCreationFee(uint256 newFee) external {
        require(msg.sender == owner, "ONLY_OWNER");
        creationFee = newFee;
    }
}

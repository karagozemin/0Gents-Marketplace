// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentRegistry
 * @notice Minimal registry for AI agents. In later waves this will evolve to ERC-7857 INFT.
 */
contract AgentRegistry {
    struct Agent {
        address owner;
        string metadataURI; // points to storage config `/agents/{id}.json`
    }

    uint256 public totalAgents;
    mapping(uint256 => Agent) private _agents;

    event AgentCreated(uint256 indexed agentId, address indexed owner, string metadataURI);
    event AgentTransferred(uint256 indexed agentId, address indexed from, address indexed to);

    function create(string calldata metadataURI) external returns (uint256 agentId) {
        agentId = ++totalAgents;
        _agents[agentId] = Agent({owner: msg.sender, metadataURI: metadataURI});
        emit AgentCreated(agentId, msg.sender, metadataURI);
    }

    function ownerOf(uint256 agentId) public view returns (address) {
        return _agents[agentId].owner;
    }

    function metadataOf(uint256 agentId) external view returns (string memory) {
        return _agents[agentId].metadataURI;
    }

    function transfer(uint256 agentId, address to) external {
        address owner = _agents[agentId].owner;
        require(owner == msg.sender, "NOT_OWNER");
        require(to != address(0), "INVALID_TO");
        _agents[agentId].owner = to;
        emit AgentTransferred(agentId, owner, to);
    }
}



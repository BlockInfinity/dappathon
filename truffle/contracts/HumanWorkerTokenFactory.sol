pragma solidity ^0.4.11;

import "./HumanWorkerToken.sol";

contract HumanWorkerTokenFactory {

    address[] public contracts;
    string public proofOfIdentity;

    event HumanWorkerTokenCreated(address _workToken, address _from);

    function HumanWorkerTokenFactory(string _proofOfIdentity) {
    	proofOfIdentity = _proofOfIdentity;
    }

    function createHumanWorker(string _description) {
        address workToken = new HumanWorkerToken(_description);
        contracts.push(workToken);
        HumanWorkerTokenCreated(workToken, msg.sender);
    }

    function getContracts() constant returns(address[]) {
    	return contracts;
    }
    
}
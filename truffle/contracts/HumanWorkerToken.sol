pragma solidity ^0.4.11;

import "./HumanStandardToken.sol";

contract HumanWorkerToken is HumanStandardToken(2**256-1,"HumanWorkerToken",100,"HWT") {

	string public description; 
	address public owner; 
	
    // ####################### Constructor 
	function HumanWorkerToken(string _description) {
		description = _description;
		owner = msg.sender;
	}
	

}
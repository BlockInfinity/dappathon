pragma solidity ^0.4.11;

contract HumanWorkToken is HumanStandardToken() {


	struct Account {
 		uint balance;				// dividends that can de redeemed
	  	uint lastDividends;			// die gesamte Dividende zum Zeitpunkt des letzten Aufrufs vom updateAccount modifier 
	}
 
	mapping(address=>Account) accounts;
	uint public totalDividends;		// kumuliertes Gesamtvolumen der eingezahlten Dividenden
	uint256 leftAmount;

	// ####################### Events 
	event RefundedEvent(address _investor, uint _value);
	event WithdrawEvent(address _user, uint _amount);
	event DisburseEvent(address _energysupplier, address _estoken, uint256 _disburseAmount);
	
	// ####################### Modifiers

    modifier onlyIfClosedOrCapitalNotRaised()  {
    	if (this.value > minfundingGoal) {revert()}
        if ((block.number-initialBlock) < duration) {revert();}
        _;
    }

    modifier onlyOwner() {
    	if (msg.sender != owner) {revert();}
    	_;
    }

    // ####################### Constructor 
	function HumanWorkToken(uint256 _minfundingGoal uint8 _numberOfFundingRounds, uint256 _initialAmount, string _tokenName) HumanStandardToken(_numberOfTokens, _tokenName, 100,"HWT") {
		minfundingGoal = _minfundingGoal;
		leftAmount = _minfundingGoal;
		roundNo = 0; 
	}


	function addFundingRound(uint _toFund) onlyOwner() {
		if (leftAmount - _toFund < 0 ) {revert()}
		leftAmount = leftAmount - _toFund;
		fundingRounds.push(_toFund);
	}

	function refund() onlyIfClosedOrCapitalNotRaised()  {
		uint amount = (balances[msg.sender] * this.balance) / totalSupply;
		msg.sender.transfer(amount);
		RefundedEvent(msg.sender, amount)
	}

    // ####################### Functions for paying the investors 

	function disburse() payable {
	  	totalDividends += msg.value;
	}
	
	function dividendsOwing(address account) /*internal*/ returns(uint) {
		uint newDividends = totalDividends - accounts[account].lastDividends;
	  	return (balances[msg.sender] * newDividends) / totalSupply;
	}

	modifier updateAccount(address account) {
	  	uint owing = dividendsOwing(account);

	  	if (owing > 0) {
		   accounts[account].balance = accounts[account].balance + owing;
	       accounts[account].lastDividends = totalDividends;
	 	}							
	 	_;
	}

	function withdraw() updateAccount(msg.sender) returns(uint) {
		uint amount = accounts[msg.sender].balance;
		accounts[msg.sender].balance = 0;
		msg.sender.transfer(amount);
		return amount;
	}

    // ####################### Modified transfer Funktion 

    function transfer(address _to, uint256 _value) returns (bool success) {
    	
    	// transfer kann nur stattfinden, wenn alle Dividenden vom Eigentümer withdrawed wurden 
    	if (accounts[msg.sender].balance != 0) {revert()};

        //Default assumes totalSupply can't be over max (2^256 - 1).
        //If your token leaves out totalSupply and can issue more tokens as time goes on, you need to check if it doesn't wrap.
        //Replace the if with this one instead.
        //if (balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[msg.sender] >= _value && _value > 0) {
            balances[msg.sender] -= _value;
            balances[_to] += _value;
            
            // so wird verhindert dass der neue Anteilseigentümer Anteil von der kumulierten Gesamtdividende einfordert.
            accounts[_to].lastDividends = accounts[msg.sender].lastDividends; 
            
            Transfer(msg.sender, _to, _value);
            return true;
        } else { return false; }
    }

    function transferFrom(address _from, address _to, uint256 _value) returns (bool success) {

        // transfer kann nur stattfinden, wenn alle Dividenden vom Eigentümer withdrawed wurden 
    	if (accounts[msg.sender].balance != 0) {revert()};
        
        //same as above. Replace this line with the following if you want to protect against wrapping uints.
        //if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && balances[_to] + _value > balances[_to]) {
        if (balances[_from] >= _value && allowed[_from][msg.sender] >= _value && _value > 0) {
            balances[_to] += _value;
            balances[_from] -= _value;
            allowed[_from][msg.sender] -= _value;
            
            // so wird verhindert dass der neue Anteilseigentümer Anteil von der kumulierten Gesamtdividende einfordert.
            accounts[_to].lastDividends = accounts[_from].lastDividends;
            
            Transfer(_from, _to, _value);
            return true;
        } else { return false; }
    }

    // ####################### owner unlocks investments in contract by proofing that he has achieved the preset milestones. Oracles are used for verification.  

    // todo: implemenent conncetion to oracle  
    function triggerPayment(string hashOfDocument) {
    	if (roundNo == 0) {
    		owner.transfer(fundingRounds[roundNo])
    		roundNo = roundNo + 1;
    	} else {
        	// oraclize_query(hashOfDocument, contractText);
        	// for demonstration 
        	owner.transfer(fundingRounds[roundNo])
        	roundNo = roundNo + 1; 			
    	}
    }
    
    function __callback(bytes32 myid, string result) {
        // if oracle confirms 
        owner.transfer(fundingRounds[roundNo]);  
    }

}
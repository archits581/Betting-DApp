pragma solidity ^0.5.0;

// A simple smart contract
contract Betting {
    
    // Structure to model Teams.
    // id - unique id of the team
    // name - name of the team
    // bids - stores betting amount by the address
    // bidders - stores addresses of the bidders who have bid money on the team
    struct Team {
        uint id;
        string name;
        mapping(address => uint) bids; 
        address payable[] bidders;
    }

    // Two teams initially
    Team team0;
    Team team1; 
    
    // Empty array used in constructor
    address payable[] newArray;

    // Constructor function to initialize two teams.
    constructor (string memory name1, string memory name2) public {
        team0 = Team(0, name1, newArray);
        team1 = Team(1, name2, newArray);
    }

    // Function to get the team name.
    function getTeamName(uint _teamId) public returns(string memory) {
        if (_teamId == 0) {
            return team0.name;
        }
        return team1.name;
    }
    
    // Function to bid on either of the two teams.
    function bid(uint _teamId) public payable {

        if (_teamId == 0) {
            if (team0.bids[msg.sender] != 0) {
                team0.bids[msg.sender] = team0.bids[msg.sender] + msg.value;
            } else {
                team0.bids[msg.sender] = msg.value;
                team0.bidders.push(msg.sender);
            }
        } else {
            if(team1.bids[msg.sender] != 0) {
                team1.bids[msg.sender] = team1.bids[msg.sender] + msg.value;
            } else {
                team1.bids[msg.sender] = msg.value;
                team1.bidders.push(msg.sender);
            }
        }
    }


    function getTeamBids(uint _teamId) public returns(uint) {
        if (_teamId == 0) {
            return team0.bids[msg.sender];
        }
        return team1.bids[msg.sender];
    }
    
    
    // Function to send ether to bidders of the winning team. Takes in one argument - id of the winning team;
    // Calculation formula: (amountBid*totalAmountBid)/teamTotalBid;
    function getWinner(uint _teamId) public payable {
        uint total = address(this).balance;
        uint teamTotal = 0;
        uint length;
        uint i;
        uint amountToBeTransfered;
        
        // uint  toReturn;
        if(_teamId == 0){
            length = team0.bidders.length;
            i;
            for(i = 0; i<length; i++){
                teamTotal += team0.bids[ team0.bidders[i] ];
            }
            for(i = 0; i<length; i++){
                amountToBeTransfered = (team0.bids[ team0.bidders[i] ]*total)/teamTotal;
                address payable to = team0.bidders[i];
                to.transfer(amountToBeTransfered);
            }
            
        }else{
            length = team1.bidders.length;
            i;
            for(i = 0; i<length; i++){
                teamTotal += team1.bids[ team1.bidders[i] ];
            }
            for(i = 0; i<length; i++){
                amountToBeTransfered = (team0.bids[ team0.bidders[i] ]*total)/teamTotal;
                address payable to = team1.bidders[i];
                to.transfer(amountToBeTransfered);
            }
        }
    }    
}

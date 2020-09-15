pragma solidity ^0.4.17;

contract Lottery {
    
    address public creator;
    
    address[] public players;
    
    address public lastWinner;
    
    function Lottery() public {
        
        creator = msg.sender;
        
    }
    
    function enter() public payable {
        
        require(msg.value > 0.01 ether);
        
        players.push(msg.sender);
        
    }
    
    function playerList() public view returns (address[]) {
        
        return players;
        
    }
    

    function rand() private view returns (uint) {
        
        return uint(sha3(block.difficulty, now, players));
        
    }
    
    function chooseWinner() public creatorCall {
        
        uint idx = rand() % players.length;
        
        players[idx].transfer(address(this).balance);
        
        lastWinner = players[idx];
  
        players = new address[](0);
        
    }
    
    
    modifier creatorCall() {
        
        require(msg.sender == creator);
        _;
        
    }
}

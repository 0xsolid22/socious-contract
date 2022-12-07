// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KingOfTheFools is Ownable, ReentrancyGuard {
    address public king;
    uint public lastDeposit;

    error InsufficientFund();
    event TransferETH(address indexed recipient, uint indexed amount);

    function deposit() external payable nonReentrant {
        if (msg.value == 0 || lastDeposit * 3 > msg.value * 2) {
            revert InsufficientFund();
        }

        if (lastDeposit > 0) {
            _transferETH(king, msg.value);
        }

        lastDeposit = msg.value;
        king = msg.sender;
    }

    function emergencyWithdraw(uint256 amount) external onlyOwner {
        if (amount > address(this).balance) {
            revert InsufficientFund();
        }
        _transferETH(owner(), amount);
    }

    function _transferETH(address recipient, uint amount) internal {
        (bool sent, ) = recipient.call{value: amount}("");
        require(sent, "Failed to send ETH");

        emit TransferETH(recipient, amount);
    }
}

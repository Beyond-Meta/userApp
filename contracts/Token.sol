// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MetaToken", "mPOLYGON") {
        _mint(msg.sender, 10000 * 10 ** decimals());
    }

    // metaTX
    using ECDSA for bytes32;
    event METATX(address indexed delegate, bytes32 hash);

    function process(address _signer, bytes memory _sig, bytes32 _hash) private returns (bool) {
        emit METATX(msg.sender, _hash);
        return _hash.toEthSignedMessageHash().recover(_sig) == _signer;
    }

    function verify(
        address _signer,
        bytes memory _sig,
        uint256 _timeStamp,
        bytes memory _encodeWithSelector) internal returns (bool) {
        return process(
        _signer, _sig, keccak256(abi.encodePacked(_encodeWithSelector, _timeStamp))
        );
    }

    function transfer(bytes memory _sig, address _signer, address _recipient, uint _amount, uint _fee, uint256 _timeStamp) public returns (bool){
        require (verify(_signer, _sig, _timeStamp, abi.encodeWithSelector(bytes4(0xa9059cbb), _recipient, _amount)), "");
         _transfer(_signer, _msgSender(), _fee);
         _transfer(_signer, _recipient, _amount);
        return true;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyNFT is ERC721
// ,  Ownable 
{
    uint256 public nextTokenId;

    constructor(address _owner) ERC721("PropertyNFT", "PROP") 
    // Ownable(_owner)
    {
        
    }

    function mint(address to) external
    //  onlyOwner
     returns (uint256) {
        uint256 tokenId = nextTokenId;
        _safeMint(to, tokenId);
        nextTokenId++;
        return tokenId;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IPropertyNFT {
    function ownerOf(uint256 tokenId) external view returns (address);
}

contract Property {
    address public nftAddress;
    uint256 public tokenId;
    uint256 public pricePerDay;
    uint256 public deposit;
    string public metadata;
    bool public initialized;

    function initialize(
        address _nftAddress,
        uint256 _tokenId,
        uint256 _pricePerDay,
        uint256 _deposit,
        string memory _metadata
    ) external {
        require(!initialized, "Already initialized");
        initialized = true;
        
        nftAddress = _nftAddress;
        tokenId = _tokenId;
        pricePerDay = _pricePerDay;
        deposit = _deposit;
        metadata = _metadata;
    }

    function getOwner() public view returns (address) {
        return IPropertyNFT(nftAddress).ownerOf(tokenId);
    }

    function getPricePerDay() public view returns (uint256) {
        return pricePerDay;
    }

    function getDeposit() public view returns (uint256) {
        return deposit;
    }

    function updateTerms(
        uint256 _newPricePerDay,
        uint256 _newDeposit,
        string memory _newMetadata
    ) external 
    {
        require(msg.sender == getOwner(), "Only owner can update");
        pricePerDay = _newPricePerDay;
        deposit = _newDeposit;
        metadata = _newMetadata;
        emit TermsUpdated(_newPricePerDay, _newDeposit);
    }

    event TermsUpdated(uint256 newPricePerDay, uint256 newDeposit);
}
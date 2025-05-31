// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Property.sol";
import "./Agreement.sol";
import "./PropertyNFT.sol";

contract Manager {
    Property public implementationProperty;
    Agreement public implementationAgreement;
    PropertyNFT public propertyNFT;
    
    mapping(address => address[]) public propertyAgreements;
    address[] public propertiesList;

    constructor() {
        implementationProperty = new Property();
        implementationAgreement = new Agreement();
        propertyNFT = new PropertyNFT(address(this));
    }

    function createProperty(
        uint256 pricePerDay,
        uint256 deposit,
        string memory metadata
    ) external returns (address) {
        uint256 tokenId = propertyNFT.mint(msg.sender);
        address property = Clones.clone(address(implementationProperty));
        
        Property(property).initialize(
            address(propertyNFT),
            tokenId,
            pricePerDay,
            deposit,
            metadata
        );

        propertiesList.push(property);
        emit PropertyCreated(msg.sender, property);
        return property;
    }

    function createAgreement(
        address _property,
        uint256 _daysCount
    ) external payable returns (address) {
        require(_property != address(0), "Invalid property address");
        require(isPropertyExist(_property), "Property does not exist");
        
        uint256 _priceForDay = Property(_property).getPriceForDay();
        uint256 _deposit = Property(_property).getDeposit();
        address _landlord = Property(_property).getOwner();
        
        require(msg.sender != _landlord, "Landlord cannot rent own property");
        
        address agreement = Clones.clone(address(implementationAgreement));
        Agreement(agreement).initialize{value: msg.value}(
            _landlord,
            msg.sender,
            _property,
            _daysCount,
            _priceForDay,
            _deposit
        );

        propertyAgreements[_property].push(agreement);
        emit AgreementCreated(_property, agreement);
        return agreement;
    }

    function isPropertyExist(address _property) public view returns (bool) {
        for (uint i = 0; i < propertiesList.length; i++) {
            if (propertiesList[i] == _property) {
                return true;
            }
        }
        return false;
    }

    function getBalance(address _property) public view returns (uint256) {
        return _property.balance;

    }

    event PropertyCreated(address indexed owner, address property);
    event AgreementCreated(address indexed property, address agreement);
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./Property.sol";
// import "./Agreement.sol";
import "./PropertyNFT.sol";
import "./interfaces/IAgreement.sol";

contract Manager {
    Property public implementationProperty;
    IAgreement public implementationAgreement;
    PropertyNFT public propertyNFT;

    mapping(address => address[]) public propertyAgreements;
    address[] public propertiesList;

    constructor(Property property, IAgreement agreement) {
        // this realisation is used hardcode initializing of implementation contracts
        // But you can make it so that you can pass implementations as constructor arguments.

        implementationProperty = property;
        implementationAgreement = agreement;
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
    ) external payable {
        require(_property != address(0), "Invalid property address");
        require(isPropertyExist(_property), "Property does not exist");

        uint256 _pricePerDay = Property(_property).getPricePerDay();
        uint256 _deposit = Property(_property).getDeposit();
        address _landlord = Property(_property).getOwner();

        require(msg.sender != _landlord, "Landlord cannot rent own property");

        // emit message(Strings.toString(msg.value));

        uint256 requiredAmount = (_daysCount * _pricePerDay) + _deposit;
        address agreement = Clones.clone(address(implementationAgreement));

        if (msg.value > requiredAmount) {
            payable(msg.sender).transfer(msg.value - requiredAmount);
            // TO DO
            // emit IAgreement.ChangeReturned(agreement, msg.value - requiredAmount);
        }

        try
            IAgreement(agreement).initialize{value: requiredAmount}(
                _landlord,
                msg.sender,
                _property,
                _daysCount,
                _pricePerDay,
                _deposit
            )
        {
            propertyAgreements[_property].push(agreement);

            emit AgreementCreated(_property, agreement);
        } catch Error(string memory _msg) {
            emit _Error(_msg);
            revert(_msg);
        }
    }

    function getRentPayment(
        address _agreementAdr
    ) external payable returns (uint256) {
        return IAgreement(_agreementAdr).withdrawRentPayment(msg.sender);
    }

    function extendRent(
        address _agreementAdr,
        uint128 _additionalDays
    ) external payable {
        IAgreement(_agreementAdr).extendRent(msg.sender, _additionalDays);
    }

    function isPropertyExist(address _property) private view returns (bool) {
        for (uint i = 0; i < propertiesList.length; i++) {
            if (propertiesList[i] == _property) {
                return true;
            }
        }
        return false;
    }

    function cancelByTenant(address _agreement) public {
        IAgreement(_agreement).cancelByTenant(msg.sender);
    }

    function cancelByLandlord(address _agreement) public {
        IAgreement(_agreement).cancelByLandlord(msg.sender);
    }

    function getBalance(address _address) public view returns (uint256) {
        return _address.balance;
    }

    function getPropertiesListLength() public view returns (uint256) {
        return propertiesList.length;
    }

    event message(string mess);
    event _Error(string _mess);
    event PropertyCreated(address indexed owner, address property);
    event AgreementCreated(address indexed property, address agreement);
}

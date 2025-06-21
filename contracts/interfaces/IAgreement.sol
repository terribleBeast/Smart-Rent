// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAgreement {
    enum StatusRent { 
        Active, 
        Cancelled, // The rental is cancelled. It should be treated as a controversial situation.
        Finished, // The rental period has expired, but the deposit has not been withdrawn
        Completed // The rental is successful completed.

    }

    function initialize(
        address _landlord,
        address _tenant,
        address _property,
        uint256 _daysCount, 
        uint256 _priceForDay,
        uint256 _deposit
    ) external payable;

    function extendRent(uint256 _additionalDays) external payable;
    function cancelByLandlord() external;
    function cancelByTenant() external;
    // function withdrawRent() external;
    function returnDeposit() external;
    function getRentStatus() external view returns (StatusRent);
    function getBalance() external view returns (uint256);

    
    event RentExtended(address indexed tenant, uint256 newEndDate);
    event AgreementCancelled(address indexed by, string reason);
    event PaymentAccured(address _agreement, uint256 _sum);
    event PaymentOfRent(address _agreement, address _tenant, uint256 _deposit);
    event ExtendRent(address _tenant, address _property, uint256 _endRent);
    event ChangeReturned(address indexed recipient, uint256 amount);
}
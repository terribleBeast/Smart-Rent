// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IAgreement {
    enum Status { 
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
    function cancelRental() external;
    // function withdrawRent() external;
    function returnDeposit() external;
    function getStatus() external view returns (Status);
    function getBalance() external view returns (uint256);

    event RentExtended(address indexed tenant, uint256 newEndDate);
    event AgreementCancelled(address indexed by, string reason);
}
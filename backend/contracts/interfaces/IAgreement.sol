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

    function extendRent(address _sender, uint256 _additionalDays) external payable;

    function cancelByLandlord(address _sender) external;

    function cancelByTenant(address _sender) external;

    function withdrawRentPayment(address _sender) external payable returns (uint256);

    function returnDeposit(address _sender) external;

    function getRentStatus() external view returns (StatusRent);

    function getBalance() external view returns (uint256);

    enum UserState {
        Free,
        hasComplaints,
        agreesToCancellation
    }

    struct AgreementFeatures {
        uint256 startRent;
        uint256 endRent;
        StatusRent status;
    }

    struct PropertyFeatures {
        address addr;
        uint256 pricePerDay;
        uint256 deposit;
    }

    struct User {
        address addr;
        UserState state;
    }

    event RentExtended(address indexed tenant, uint256 newEndDate);
    event AgreementCancelled(address indexed by, string reason);
    event PaymentAccrued(address _agreement, uint256 _sum);
    event PaymentOfRent(address _agreement, address _tenant, uint256 _deposit);
    event ExtendRent(address _tenant, address _property, uint256 _endRent);
    event ChangeReturned(address indexed recipient, uint256 amount);
    event AgreementInitialized(
        address _landlord,
        address _tenant,
        address _property,
        uint256 _startRent,
        uint256 _endRent
    );
    event AgreementCancelled(address _whoCancelled, uint256 _timeCancelled);
    event WithdrawRentPayment(address indexed _landlord, address _agrAddress, uint256 _sum);
}

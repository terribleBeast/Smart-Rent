// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PropertyNFT.sol";

contract Agreement {
    address public landlord;
    address public tenant;

    uint256 public startRent;
    uint256 public endRent;

    address public property;
    uint256 public priceForDay;
    uint256 public deposit;

    bool public approvalLandlord = false;
    bool public approvalTenant = false;
    Status public status;

    bool public initialized;

    // Done
   function initialize(
        address _landlord,
        address _tenant,
        address _property,
        uint256 _daysCount,
        uint256 _priceForDay,
        uint256 _deposit
    ) external payable {
        require(!initialized, "Already initialized");

        emit message(Strings.toString(msg.value));
        emit message(Strings.toString(_daysCount * _priceForDay + _deposit));
    
        require(msg.value == _daysCount * _priceForDay + _deposit, 
        "Incorrect payment amount");
        require(_daysCount > 0, "Rent period must be positive");

        initialized = true;
        landlord = _landlord;
        tenant = _tenant;
        startRent = block.timestamp;
        endRent = startRent + _daysCount * 1 days;
        property = _property;
        priceForDay = _priceForDay;
        deposit = _deposit;
        status = Status.Active;

        emit AgreementInitialized(landlord, tenant, property, startRent, endRent);
        // emit PaymentReceived(msg.value);
    }
    // Done
    function extendedRent(uint256 _daysCount)
        public 
        involved
        timeWasUp
        isActive
    {
        require(_daysCount > 0, "_daysCount cannot be less than zero");

        endRent = block.timestamp + _daysCount * 24 hours;
        // payable(tenant).transfer(_daysCount * priceForDay);

        emit PaymentOfRent(
            address(this),
            tenant,
            _daysCount * priceForDay + deposit
        );
        emit ExtendedRent(tenant, property, endRent);
    }

    function cancelRental() public involved timeWasUp isActive {
        status = Status.Cancelled;

        if (msg.sender == landlord) {
            approvalLandlord = true;
        } else {
            approvalTenant = true;
        }

        emit AgreementCancelled(
            tenant,
            property,
            endRent,
            msg.sender == landlord ? "landlord" : "telnet"
        );
    }

    function getRentPayment() public view involved  {
        require(msg.sender == landlord, "Only landlords can get rent payment");

        // payable(landlord).transfer(
        //     ((block.timestamp - startRent) / 1 days) * priceForDay
        // );
    }

    function getApprovedLandlord() public view returns (bool) {
        return approvalLandlord;
    }

    function getApprovedTenant() public view returns (bool) {
        return approvalTenant;
    }

    function giveConsent() public involved {
        require(
            status == Status.Finished || status == Status.Cancelled,
            "The agreement has not been finalized or cancelled."
        );

        if (msg.sender == tenant) {
            approvalTenant = true;
        } else {
            approvalLandlord = true;
        }
    }

    //     function reportIssue()
    //     involved()
    //    {

    //     }

    //     function claimDeposit(params)
    //     involved()
    //     {
    //         require(
    //             status != Status.Completed && status._status != Status.Disputed
    //         );
    //         require(!approvalLandlord && !approvalTenant , "This action requires approval.");

    //}

    function getStatus() public view returns (Status) {
        return status;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    modifier involved() {
        require(
            msg.sender == landlord || msg.sender == tenant,
            "Only landlords or tenants can this action."
        );
        _;
    }

    modifier timeWasUp() {
        if (block.timestamp >= endRent) {
            status = Status.Finished;
        }
        _;
    }
    modifier isActive() {
        require(status == Status.Active, "The agreemet is not active.");
        _;
    }

    event AgreementInitialized(
        address _landlord,
        address _tenant,
        address _property,
        uint256 _startRent,
        uint256 _endRent
    );
    event AgreementCancelled(
        address _tenant,
        address _property,
        uint256 _endRent,
        string _whoCanselled
    );

    event PaymentOfRent(address _agreement, address _tenant, uint256 _deposit);
    event message(string mess);

    event ExtendedRent(address _tenant, address _property, uint256 _endRent);

    enum Status {
        Active,
        Cancelled,
        Finished,
        Completed
    }
}

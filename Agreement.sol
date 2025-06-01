// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "project/interfaces/IAgreement.sol";


contract Agreement is IAgreement{
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
    function initialize (
        address _landlord,
        address _tenant,
        address _property,
        uint256 _daysCount,
        uint256 _priceForDay,
        uint256 _deposit
    ) external payable override {
        // emit message(Strings.toString(msg.value));
        // emit message(Strings.toString(_daysCount * _priceForDay + _deposit));

        require(!initialized, "Already initialized");
        require(_daysCount > 0, "Rent period must be positive");
        uint256 requiredAmount = _daysCount * _priceForDay + _deposit;

        require(msg.value >= requiredAmount, "Incorrect payment amount");

        if (msg.value > requiredAmount) {
            uint256 change = msg.value - requiredAmount;
            payable(msg.sender).transfer(change);
            emit ChangeReturned(msg.sender, change);
        }

        initialized = true;
        landlord = _landlord;
        tenant = _tenant;
        startRent = block.timestamp;
        endRent = startRent + _daysCount * 1 days;
        property = _property;
        priceForDay = _priceForDay;
        deposit = _deposit;
        status = Status.Active;

        emit AgreementInitialized(
            landlord,
            tenant,
            property,
            startRent,
            endRent
        );
        
        emit PaymentAccured(address(this), requiredAmount);
    }

    // Done
    function extendRent(uint256 _additionalDays)
        public
        payable 
        override
        involved
        timeWasUp
        isActive
    {
        require(_additionalDays > 0, "_daysCount cannot be less than zero");

        uint256 requiredAmount =  _additionalDays * priceForDay;
        
        if (msg.value > requiredAmount) 
        {
            uint256 change = msg.value - requiredAmount;
            payable(msg.sender).transfer(change);
            emit ChangeReturned(msg.sender, change);
        }

        endRent = block.timestamp + _additionalDays * 1 days;

        emit ExtendRent(tenant, property, endRent);
    }

    function cancelRental() public override involved timeWasUp isActive {
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

    function getRentPayment() public view involved {
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

    function returnDeposit() external override {
        // require(!approvalLandlord && !approvalTenant , "This action requires approval.");
    }

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

    // something may to update
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

    event message(string mess);

    event PaymentAccured(address _agreement, uint256 _sum);
    event PaymentOfRent(address _agreement, address _tenant, uint256 _deposit);
    event ExtendRent(address _tenant, address _property, uint256 _endRent);
    event ChangeReturned(address indexed recipient, uint256 amount);

}

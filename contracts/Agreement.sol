// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IAgreement.sol";

contract Agreement is IAgreement {
    // parties of agreement
    User public landlord;
    User public tenant;

    AgreementFeatches public agrFeatches;

    PropertyFeatches public propFeatches;

    // for Clone
    bool public initialized;

    // Done
    function initialize(
        address _landlord,
        address _tenant,
        address _property,
        uint256 _daysCount,
        uint256 _pricePerDay,
        uint256 _deposit
    ) external payable override { 
        // emit message(Strings.toString(msg.value));
        // emit message(Strings.toString(_daysCount * _pricePerDay + _deposit));

        require(!initialized, "Already initialized");
        require(_daysCount > 0, "Rent period must be positive");
        uint256 requiredAmount = _daysCount * _pricePerDay + _deposit;

        require(msg.value >= requiredAmount, "Incorrect payment amount");

        if (msg.value > requiredAmount) {
            uint256 change = msg.value - requiredAmount;
            payable(msg.sender).transfer(change);
            emit ChangeReturned(msg.sender, change);
        }

        initialized = true;

        landlord = User({addr: _landlord, state: UserState.Free});

        tenant = User({addr: _tenant, state: UserState.Free});

        agrFeatches = AgreementFeatches({
            startRent: block.timestamp,
            endRent: block.timestamp + _daysCount * 1 days,
            status: StatusRent.Active
        });

        propFeatches = PropertyFeatches({
            addr: _property,
            pricePerDay: _pricePerDay,
            deposit: _deposit
        });

        emit AgreementInitialized(
            landlord.addr,
            tenant.addr,
            propFeatches.addr,
            agrFeatches.startRent,
            agrFeatches.endRent
        );

        emit PaymentAccured(address(this), requiredAmount);
    }

    // Done
    function extendRent(uint256 _additionalDays)
        public
        payable
        override
        OnlyTenat
        timeWasUp
        isActive
    {
        require(_additionalDays > 0, "_daysCount cannot be less than zero");
        require(
            msg.value >= propFeatches.pricePerDay * _additionalDays,
            "Incorrect payment amount"
        );

        uint256 requiredAmount = _additionalDays * propFeatches.pricePerDay;

        if (msg.value > requiredAmount) {
            uint256 change = msg.value - requiredAmount;
            payable(msg.sender).transfer(change);
            emit ChangeReturned(msg.sender, change);
        }

        agrFeatches.endRent += _additionalDays * 1 days;

        emit ExtendRent(
            tenant.addr,
            propFeatches.addr,
            agrFeatches.endRent
        );
    }

    // Done
    function cancelByTenant() external override OnlyTenat {
        tenant.state = UserState.hasComplaints;
        _cancelRental();

        emit AgreementCancelled(tenant.addr, block.timestamp);
    }

    // Done
    function cancelByLandlord() external override OnlyLandlord {
        landlord.state = UserState.hasComplaints;
        _cancelRental();

        emit AgreementCancelled(landlord.addr, block.timestamp);
    }

    // function mutualCancellation() external onlyParties nonReentrant
    // {
    // _cancelRental(CancellationType.MUTUAL, "Mutual agreement");
    // }

    // Done
    function _cancelRental() private timeWasUp isActive {
        agrFeatches.status = StatusRent.Cancelled;

        // A penalty processing logic can be added (e.g., if the tenant cancels the rental, 20% of the deposit will be automatically transfered to the landlord's account).
        payable(tenant.addr).transfer(propFeatches.deposit);
    }

    // function stopRental() {
    // }

    function getRentPayment() public payable OnlyLandlord 
    {
        require(agrFeatches.status != StatusRent.Active, "The agreement is active.");

        payable(landlord.addr).transfer(
            ((block.timestamp - agrFeatches.startRent) / 1 days) * propFeatches.pricePerDay
        );
    }

    function getLandlordStare() public view returns (UserState) {
        return landlord.state;
    }

    function getTenantState() public view returns (UserState) {
        return tenant.state;
    }



    function returnDeposit() external override {
        // require(!approvalLandlord && !approvalTenant , "This action requires approval.");
    }

    function getRentStatus() public view returns (StatusRent) {
        return agrFeatches.status;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // modifier onlyParties() {
    //     require(msg.sender == tenant || msg.sender == landlord);
    //     _;
    // }

    // something may to update
    modifier timeWasUp() {
        if (block.timestamp >= agrFeatches.endRent) {
            agrFeatches.status = StatusRent.Finished;
        }
        _;
    }

    modifier isActive() {
        require(agrFeatches.status == StatusRent.Active, "The agreemet is not active.");
        _;
    }

    modifier OnlyTenat() {
        require(msg.sender == tenant.addr, "Only tenants can this action.");
        _;
    }

    modifier OnlyLandlord() {
        require(msg.sender == landlord.addr, "Only landlord can this action.");
        _;
    }

    event AgreementInitialized(
        address _landlord,
        address _tenant,
        address _property,
        uint256 _startRent,
        uint256 _endRent
    );
    event AgreementCancelled(address _whoCanselled, uint256 _timeCanselled);

    // event message(string mess);

    // event PaymentAccured(address _agreement, uint256 _sum);
    // event PaymentOfRent(address _agreement, address _tenant, uint256 _deposit);
    // event ExtendRent(address _tenant, address _property, uint256 _endRent);
    // event ChangeReturned(address indexed recipient, uint256 amount);

    enum UserState {
        Free,
        hasComplaints,
        agreesToCancellation
    }

    struct AgreementFeatches {
        uint256 startRent;
        uint256 endRent;
        StatusRent status;
    }

    struct PropertyFeatches {
        address addr;
        uint256 pricePerDay;
        uint256 deposit;
    }

    struct User {
        address addr;
        UserState state;
    }
}

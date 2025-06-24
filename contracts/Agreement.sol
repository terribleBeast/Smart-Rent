// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IAgreement.sol";

contract Agreement is IAgreement {
    // parties of agreement
    User public landlord;
    User public tenant;

    AgreementFeatures public agrFeatures;

    PropertyFeatures public propFeatures;

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
    ) external payable {
        // emit message(Strings.toString(msg.value));
        // emit message(Strings.toString(_daysCount * _pricePerDay + _deposit));

        require(!initialized, "Already initialized");
        require(_daysCount > 0, "Rent period must be positive");
        uint256 requiredAmount = _daysCount * _pricePerDay + _deposit;

        if (msg.value < requiredAmount) {
            revert("Incorrect payment amount");
        }

        if (msg.value > requiredAmount) {
            uint256 change = msg.value - requiredAmount;
            payable(msg.sender).transfer(change);
            emit ChangeReturned(msg.sender, change);
        }

        initialized = true;

        landlord = User({addr: _landlord, state: UserState.Free});

        tenant = User({addr: _tenant, state: UserState.Free});

        agrFeatures = AgreementFeatures({
            startRent: block.timestamp,
            endRent: block.timestamp + _daysCount * 1 days,
            status: StatusRent.Active
        });

        propFeatures = PropertyFeatures({
            addr: _property,
            pricePerDay: _pricePerDay,
            deposit: _deposit
        });

        emit AgreementInitialized(
            landlord.addr,
            tenant.addr,
            propFeatures.addr,
            agrFeatures.startRent,
            agrFeatures.endRent
        );

        emit PaymentAccrued(address(this), requiredAmount);
    }

    // Done
    function extendRent(
        address _sender,
        uint256 _additionalDays
    ) public payable OnlyTenant(_sender) timeWasUp isActive {
        require(_additionalDays > 0, "_daysCount cannot be less than zero");
        require(
            msg.value >= propFeatures.pricePerDay * _additionalDays,
            "Incorrect payment amount"
        );

        uint256 requiredAmount = _additionalDays * propFeatures.pricePerDay;

        if (msg.value > requiredAmount) {
            uint256 change = msg.value - requiredAmount;
            payable(msg.sender).transfer(change);
            emit ChangeReturned(msg.sender, change);
        }

        agrFeatures.endRent += _additionalDays * 1 days;

        emit ExtendRent(tenant.addr, propFeatures.addr, agrFeatures.endRent);
    }

    // Done
    function cancelByTenant(address _sender) external OnlyTenant(_sender) {
        tenant.state = UserState.hasComplaints;
        _cancelRental();

        emit AgreementCancelled(tenant.addr, block.timestamp);
    }

    // Done
    function cancelByLandlord(address _sender) external OnlyLandlord(_sender) {
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
        agrFeatures.status = StatusRent.Cancelled;

        // A penalty processing logic can be added (e.g., if the tenant cancels the rental, 20% of the deposit will be automatically transferred to the landlord's account).
        payable(tenant.addr).transfer(propFeatures.deposit);
    }

    // function stopRental() {
    // }

    function withdrawRentPayment(
        address _sender
    ) external payable OnlyLandlord(_sender) timeWasUp returns (uint256) {
        require(
            agrFeatures.status != StatusRent.Active,
            "The agreement is active."
        );

        uint256 rentPayment = ((block.timestamp - agrFeatures.startRent) /
            1 days) * propFeatures.pricePerDay;

        payable(landlord.addr).transfer(rentPayment);

        emit WithdrawRentPayment(landlord.addr, address(this), rentPayment);
        return rentPayment;
    }

    function getLandlordState() public view returns (UserState) {
        return landlord.state;
    }

    function getTenantState() public view returns (UserState) {
        return tenant.state;
    }

    function returnDeposit(address _sender) external {
        // require(!approvalLandlord && !approvalTenant , "This action requires approval.");
    }

    function getRentStatus() public view returns (StatusRent) {
        return agrFeatures.status;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getPropertyFeatures()
        external
        view
        returns (PropertyFeatures memory)
    {
        return propFeatures;
    }

    // modifier onlyParties() {
    //     require(msg.sender == tenant || msg.sender == landlord);
    //     _;
    // }

    // something may to update
    modifier timeWasUp() {
        if (block.timestamp >= agrFeatures.endRent) {
            agrFeatures.status = StatusRent.Finished;
        }
        _;
    }

    modifier isActive() {
        require(
            agrFeatures.status == StatusRent.Active,
            "The agreement is not active."
        );
        _;
    }

    modifier OnlyTenant(address _sender) {
        require(_sender == tenant.addr, "Only tenants can this action.");
        _;
    }

    modifier OnlyLandlord(address _sender) {
        require(_sender == landlord.addr, "Only landlord can this action.");
        _;
    }

    // event message(string mess);

    // event PaymentAccrued(address _agreement, uint256 _sum);
    // event PaymentOfRent(address _agreement, address _tenant, uint256 _deposit);
    // event ExtendRent(address _tenant, address _property, uint256 _endRent);
    // event ChangeReturned(address indexed recipient, uint256 amount);
}

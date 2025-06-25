import { initManagerContract, loadUsers } from "./utils"


export class ContractAgreement {
    constructor(
        _property,
        _daysCount
    ) {
        this.property = _property,
        this.daysCount = _daysCount
}
}

export class ContractProperty {
    constructor(
        _pricePerDay,
        _deposit,
        _metadata
    ) {
        this.pricePerDay = _pricePerDay
        this.deposit = _deposit
        this.metadata = _metadata
    }
}

export const users = await loadUsers(3)

export const managerContract = initManagerContract()
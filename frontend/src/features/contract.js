import { managerContract } from "./entities";

export const createAgreement = async (
    ContractAgreement
) => {
    if (managerContract) {
        const tx = await managerContract.createAgreement(ContractAgreement);
        await tx.wait();
        console.log("Agreement created!");
    }
};

export const createProperty = async (pricePerDay, deposit, metadata) => {
    if (managerContract) {
        const tx = await managerContract.createProperty(pricePerDay, deposit, metadata);
        await tx.wait();
        console.log("Property created!");
    }
};

export const extendRent = async (_agreementAdr, _additionalDays, value) => {
    if (managerContract) {
        const tx = await managerContract.extendRent(_agreementAdr, _additionalDays, { value });
        await tx.wait();
        console.log("Rent extended!");
    }
};

// Отмена аренды арендодателем 
export const cancelByLandlord = async (_agreement) => {
    if (managerContract) {
        const tx = await managerContract.cancelByLandlord(_agreement);
        await tx.wait();
        console.log("Agreement cancelled by landlord!");
    }
};

// Отмена аренды арендатором 
export const cancelByTenant = async (_agreement) => {
    if (managerContract) {
        const tx = await managerContract.cancelByTenant(_agreement);
        await tx.wait();
        console.log("Agreement cancelled by tenant!");
    }
};

// Получить баланс 
export const getBalance = async (_address) => {
    if (managerContract) {
        return await managerContract.getBalance(_address);
    }
    return null;
};

// Получить длину списка недвижимости 
export const getPropertiesListLength = async () => {
    if (managerContract) {
        return await managerContract.getPropertiesListLength();
    }
    return null;
};

// Получить адрес property по индексу 
export const getPropertyByIndex = async (index) => {
    if (managerContract) {
        return await managerContract.propertiesList(index);
    }
    return null;
};

// Получить адрес контретного agreement, который относится к property, по индексу
export const getPropertyAgreement = async (property, idx) => {
    if (managerContract) {
        return await managerContract.propertyAgreements(property, idx);
    }
    return null;
};

// Получить сумму аренды
export const getRentPayment = async (_agreementAdr, value) => {
    if (managerContract) {
        const tx = await managerContract.getRentPayment(_agreementAdr, { value });
        await tx.wait();
        // Обычно payable view-функции не требуют tx.wait, но если функция что-то меняет, оставьте
        console.log("Rent payment received!");
    }
};
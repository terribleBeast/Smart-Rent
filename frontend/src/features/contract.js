export const createAgreement = async (
    ContractAgreement
) => {
    if (managerContract) {
        const tx = await managerContract.createAgreement(ContractAgreement);
        await tx.wait();
        console.log("Agreement created!");
    }
};
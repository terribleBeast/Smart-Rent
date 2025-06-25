import { ethers } from "ethers";
import ManagerABI from '../abis/Manager.json'; 
const provider = new ethers.JsonRpcProvider("http://localhost:8545");



export async function getBalance(address) {
  const balance = await provider.getBalance(address);
  return Number(ethers.formatEther(balance));
}

export async function getAccounts(count) {
    const accounts = await provider.listAccounts();
    const selected = accounts.slice(1, count+1); // for "manager" owner

    return Promise.all(
        selected.map(async (_account, ind) => ({
            name: `User ${ind+1}`,
            address: _account.address,
            balance: await getBalance(_account.address)
        }))
    );
}

export const loadUsers = async (count = 3) => {
  return await getAccounts(count);
};


export const initManagerContract = async () => {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0", // Получить после деплоя
        ManagerABI,
        signer
      );
      return contract
    };


export const users = await loadUsers(3)

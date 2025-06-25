import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

export const usersSlice = createSlice({
    name: 'users',
    initialState: {
        currUser: null,
        all: []
    },
    reducers: {
        toLog: (state, action) => {
            const idxUser = Number(action.payload.user.name.slice(5, 6))-1
            console.log(idxUser)
            state.currUser = idxUser
        },

        toUpdate: (state, action) => {
            state.all = action.payload; // payload — массив пользователей
        },
        toAddToBalance: (state, action) => {
            // Найти пользователя по имени и увеличить баланс
            const user = state.all.find(u => u.name === action.payload.name);
            if (user) {
                user.balance += action.payload.count;
            }
        },
        toDecreaseFromBalance: (state, action) => {
            // Найти пользователя по имени и уменьшить баланс
            const user = state.all.find(u => u.name === action.payload.name);
            if (user) {
                user.balance -= action.payload.count;
            }
        }
    }
})

export const selectUsersAll = (state) => state.users.all;
export const selectCurrUser = (state) => state.users.all[state.users.currUser]
export const { toLog, toUpdate, toAddToBalance, toDecreaseFromBalance } = usersSlice.actions;
export default usersSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name: 'user',
    initialState: {
        name: null,
        address: null,
        balance: 0
    },

    reducers: {
        toLogIn: (state, actions) => {
            state.name = actions.payload.name
            state.login = actions.payload.address
            state.balance = actions.payload.balance
        },

    }

})

export const selectUser = (state) => state.user 
export const selectUserAddress = (state) => state.user.address
export const selectUserBalance = (state) => state.user.balance;
export const {toLogIn } = userSlice.actions;

export default userSlice.reducer;
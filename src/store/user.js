import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    authUser: {},
};

export const slice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setAuthUser(state, action) {
            state.authUser = action.payload;
        },
        clearAuthUser(state) {
            state.authUser = initialState.authUser;
        }
    },
});

export const { setAuthUser, clearAuthUser } = slice.actions;

export default slice.reducer;

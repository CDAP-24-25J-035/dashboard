import { configureStore } from '@reduxjs/toolkit';
import userReducer from './user';

export function makeStore() {
    return configureStore({
        devTools: true,
        reducer: {
            user: userReducer,
        },
    });
}

const store = makeStore();

export default store;

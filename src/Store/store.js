import { configureStore } from "@reduxjs/toolkit";
import contractReducer from "../features/contractSlice";
export const store = configureStore({
  reducer: {
    contract: contractReducer,
  },
});

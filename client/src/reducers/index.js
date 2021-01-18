import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./authReducer";
import alertReducer from "./alertReducer";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "alert"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  alert: alertReducer,
});

export default persistReducer(persistConfig, rootReducer);

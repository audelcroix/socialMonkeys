import {
  SET_ALERT,
  SET_MULTIPLE_ALERT,
  REMOVE_ALERT,
  REMOVE_ALL_ALERTS,
} from "../actions/types";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  alerts: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ALERT:
      action.payload.id = uuidv4();

      return {
        ...state,
        alerts: [action.payload, ...state.alerts],
      };

    case SET_MULTIPLE_ALERT:
      action.payload.forEach((error) => {
        error.id = uuidv4();
      });

      return {
        ...state,
        alerts: [...action.payload, ...state.alerts],
      };

    case REMOVE_ALERT:
      return {
        ...state,
        alerts: state.alerts.filter((alert) => alert.id !== action.payload),
      };

    case REMOVE_ALL_ALERTS:
      return {
        ...state,
        alerts: [],
      };

    default:
      return state;
  }
};

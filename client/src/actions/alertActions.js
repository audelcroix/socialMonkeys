import {
  SET_ALERT,
  SET_MULTIPLE_ALERT,
  REMOVE_ALERT,
  REMOVE_ALL_ALERTS,
} from "../actions/types";

// Create SINGLE error
export const createAlert = (eventToAlert) => (dispatch) => {
  if (Array.isArray(eventToAlert)) {
    // This array should be treated by createMultipleAlert
    dispatch({
      type: SET_ALERT,
      payload: {
        msg: "Sorry, an error occured",
        type: "error",
        // id is added in the reducer so other action makers can display errors
      },
    });
  } else {
    dispatch({
      type: SET_ALERT,
      payload: {
        msg: eventToAlert.msg,
        type: eventToAlert.type,
        // id is added in the reducer so other action makers can display errors
      },
    });
  }
};

// Create MULTIPLE errors
export const createMultipleAlert = (eventsToAlert) => (dispatch) => {
  if (Array.isArray(eventsToAlert)) {
    const treatedErrors = eventsToAlert.map((error) => {
      return { msg: error.msg, type: "error" };
    });

    dispatch({
      type: SET_MULTIPLE_ALERT,
      payload: treatedErrors,
    });
  } else {
    // This array should be treated by createAlert

    dispatch({
      type: SET_ALERT,
      payload: {
        msg: "Sorry, an error occured",
        type: "error",
        // id is added in the reducer so other action makers can display errors
      },
    });
  }
};

// Delete ALL alerts
export const deleteAllAlerts = () => (dispatch) => {
  dispatch({ type: REMOVE_ALL_ALERTS });
};

// Remove an alert with its id
export const removeAlert = (id) => (dispatch) => {
  dispatch({ type: REMOVE_ALERT, payload: id });
};

import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import handle429 from "../utils/handle429";

import {
  SET_LOADING,
  LOGIN_SUCCESS,
  REGISTER_SUCCESS,
  USER_LOADED,
  AUTH_ERROR,
  LOGOUT,
  SET_NOTIFICATIONS,
  USER_UPDATE,
  USER_THEME_UPDATE,
  USER_AVATAR_UPDATE,
  SET_ALERT,
  SET_MULTIPLE_ALERT,
  REMOVE_ALL_ALERTS,
  ADD_FRIEND,
  REMOVE_FRIEND,
  REMOVE_FRIEND_REQUEST_NOTIFICATIONS,
  REMOVE_LIKE_NOTIFICATION,
} from "./types";

// For JSON
const config = {
  headers: {
    "Content-Type": "application/json",
  },
};

// On/Off loading
export const setLoading = (loadingMode = false) => (dispatch) => {
  if (typeof loadingMode !== "boolean") {
    loadingMode = false;
  }

  dispatch({ type: SET_LOADING, payload: loadingMode });
};

// Login user
export const login = (formData) => async (dispatch) => {
  try {
    const tokenRes = await axios.post("/api/users/login", formData, config);

    const token = tokenRes.data.token;

    dispatch({ type: LOGIN_SUCCESS, payload: token });

    setAuthToken(token);

    const userRes = await axios.get("/api/users/userinfo");

    dispatch({ type: REMOVE_ALL_ALERTS });

    dispatch({ type: USER_LOADED, payload: userRes.data });
  } catch (err) {
    handle429(err);

    if (err.response.data.msg) {
      // In case of a SINGLE error

      dispatch({
        type: SET_ALERT,
        payload: { msg: err.response.data.msg, type: "error" },
      });
    } else if (err.response.data.errors) {
      // In case of MULTIPLE errors

      const treatedErrors = err.response.data.errors.map((error) => {
        return { msg: error.msg, type: "error" };
      });

      dispatch({
        type: SET_MULTIPLE_ALERT,
        payload: treatedErrors,
      });
    }

    dispatch({
      type: AUTH_ERROR,
    });
  }
};

// Register a new user
export const register = (formData) => async (dispatch) => {
  try {
    const tokenRes = await axios.post("/api/users/register", formData, config);

    const token = tokenRes.data.token;

    dispatch({ type: REGISTER_SUCCESS, payload: token });

    setAuthToken(token);

    const userRes = await axios.get("/api/users/userinfo");

    dispatch({ type: REMOVE_ALL_ALERTS });

    dispatch({ type: USER_LOADED, payload: userRes.data });
  } catch (err) {
    handle429(err);

    if (err.response.data.msg) {
      // In case of a SINGLE error

      dispatch({
        type: SET_ALERT,
        payload: { msg: err.response.data.msg, type: "error" },
      });
    } else if (err.response.data.errors) {
      // In case of MULTIPLE errors

      const treatedErrors = err.response.data.errors.map((error) => {
        return { msg: error.msg, type: "error" };
      });

      dispatch({
        type: SET_MULTIPLE_ALERT,
        payload: treatedErrors,
      });
    }

    dispatch({
      type: AUTH_ERROR,
    });
  }
};

// Logout user
export const logout = () => (dispatch) => {
  dispatch({ type: REMOVE_ALL_ALERTS });
  dispatch({ type: LOGOUT });
};

// Update a username
export const updateUsername = (formData) => async (dispatch) => {
  try {
    const res = await axios.post("/api/users/updateusername", formData, config);

    dispatch({ type: USER_UPDATE, payload: res.data });
  } catch (err) {
    handle429(err);

    if (err.response.data.msg) {
      // In case of a SINGLE error

      dispatch({
        type: SET_ALERT,
        payload: { msg: err.response.data.msg, type: "error" },
      });
    } else if (err.response.data.errors) {
      // In case of MULTIPLE errors

      const treatedErrors = err.response.data.errors.map((error) => {
        return { msg: error.msg, type: "error" };
      });

      dispatch({
        type: SET_MULTIPLE_ALERT,
        payload: treatedErrors,
      });
    }
  }
};

// Update a user's theme
export const updateUserTheme = (formData) => async (dispatch) => {
  try {
    const res = await axios.post(
      "/api/users/updateusertheme",
      formData,
      config
    );

    dispatch({ type: USER_THEME_UPDATE, payload: res.data });
  } catch (err) {
    handle429(err);

    if (err.response.data.msg) {
      // In case of a SINGLE error

      dispatch({
        type: SET_ALERT,
        payload: { msg: err.response.data.msg, type: "error" },
      });
    } else if (err.response.data.errors) {
      // In case of MULTIPLE errors

      const treatedErrors = err.response.data.errors.map((error) => {
        return { msg: error.msg, type: "error" };
      });

      dispatch({
        type: SET_MULTIPLE_ALERT,
        payload: treatedErrors,
      });
    }
  }
};

// Update a user's avatar
export const updateUserAvatar = (formData) => async (dispatch) => {
  try {
    const newFormData = new FormData();

    newFormData.append("avatar", formData.avatar);

    dispatch(setLoading(true));

    const res = await axios.patch("/api/users/avatar", newFormData, config);

    dispatch({
      type: SET_ALERT,
      payload: { msg: "Upload Successful", type: "success" },
    });

    dispatch({ type: USER_AVATAR_UPDATE, payload: res.data.updatedUser });

    dispatch(setLoading(false));
  } catch (err) {
    handle429(err);

    if (err.response && err.response.status === 500) {
      dispatch({
        type: SET_ALERT,
        payload: {
          msg:
            "We are sorry, the server encountered an internal error during the upload",
          type: "error",
        },
      });
    } else {
      if (err.response.data.msg) {
        // In case of a SINGLE error

        dispatch({
          type: SET_ALERT,
          payload: {
            msg: err.response.data.msg,
            type: "error",
          },
        });
      } else if (err.response.data.errors) {
        // In case of MULTIPLE errors

        dispatch({
          type: SET_MULTIPLE_ALERT,
          payload: err.response.data.errors,
        });
      }
    }

    dispatch(setLoading(false));
  }
};

// Get a user's notifications
export const getUserNotifications = () => async (dispatch) => {
  try {
    const res = await axios.get("/api/users/mynotifications");

    const allNotifs = res.data.notifications;

    // possible types for a notification
    /* "like",
      "friend",

      // unused in current version but possible in the model
      "like_img",
      "like_comment",
      "friend_accept",
      "comment",
      "system", */

    let sortedNotifs = {
      likes: [],
      friends: [],
    };

    allNotifs.forEach((notif) => {
      if (notif.notifType === "friend" || notif.notifType === "friend_accept") {
        sortedNotifs.friends.push(notif);
      } else {
        sortedNotifs.likes.push(notif);
      }
    });

    // Sort notifications by date
    sortedNotifs.friends.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    sortedNotifs.likes.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

    dispatch({ type: SET_NOTIFICATIONS, payload: sortedNotifs });
  } catch (err) {
    handle429(err);

    dispatch({
      type: SET_ALERT,
      payload: {
        msg: err.response.data.msg || "We are sorry, an error occured",
        type: "error",
      },
    });
  }
};

// Add friend - triggered when friend request is accepted
export const addFriend = (friend) => (dispatch) => {
  // friend is an OBJECT, NOT AN ID

  dispatch({ type: ADD_FRIEND, payload: friend });
};

// Delete friend - triggered when friend request is declined
export const deleteFriend = (friendId) => (dispatch) => {
  // friendId is an ID, NOT AN OBJECT

  dispatch({ type: REMOVE_FRIEND, payload: friendId });
};

// Remove friend request notifications
export const removeFriendRequestNotifications = (notifAuthorId) => (
  dispatch
) => {
  dispatch({
    type: REMOVE_FRIEND_REQUEST_NOTIFICATIONS,
    payload: notifAuthorId,
  });
};

// Remove like notification
export const removeLikeNotification = (notifId) => (dispatch) => {
  dispatch({
    type: REMOVE_LIKE_NOTIFICATION,
    payload: notifId,
  });
};

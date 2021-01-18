import {
  SET_LOADING,
  LOGIN_SUCCESS,
  USER_LOADED,
  AUTH_ERROR,
  LOGOUT,
  SET_NOTIFICATIONS,
  USER_UPDATE,
  USER_THEME_UPDATE,
  USER_AVATAR_UPDATE,
  REGISTER_SUCCESS,
  ADD_FRIEND,
  REMOVE_FRIEND,
  REMOVE_FRIEND_REQUEST_NOTIFICATIONS,
  REMOVE_LIKE_NOTIFICATION,
} from "../actions/types";

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: false,
  user: null,
  notifications: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem("token", action.payload);

      return {
        ...state,
        loading: true,
      };

    case USER_UPDATE:
      return {
        ...state,
        user: action.payload.updatedUser,
      };

    case USER_THEME_UPDATE:
      return {
        ...state,
        user: { ...state.user, theme: action.payload.newTheme },
      };

    case USER_AVATAR_UPDATE:
      return {
        ...state,
        user: { ...state.user, avatar: action.payload.avatar },
      };

    case AUTH_ERROR:
    case LOGOUT:
      localStorage.removeItem("token");

      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
      };

    case USER_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
      };

    case SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload,
      };

    case REMOVE_FRIEND_REQUEST_NOTIFICATIONS:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          friends: state.notifications.friends.filter(
            (notif) => notif.author._id !== action.payload
          ),
        },
      };

    case REMOVE_LIKE_NOTIFICATION:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          likes: state.notifications.likes.filter(
            (notif) => notif._id !== action.payload
          ),
        },
      };

    case ADD_FRIEND:
      return {
        ...state,
        user: {
          ...state.user,
          friends: [action.payload, ...state.user.friends],
        },
      };

    case REMOVE_FRIEND:
      return {
        ...state,
        user: {
          ...state.user,
          friends: state.user.friends.filter(
            (friend) => friend._id !== action.payload
          ),
        },
      };

    default:
      return state;
  }
};

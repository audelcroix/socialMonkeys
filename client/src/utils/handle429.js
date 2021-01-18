import { store } from "../store";
import { SET_MULTIPLE_ALERT } from "../actions/types";

const handle429 = (error) => {
  if (error.response && error.response.status === 429) {
    store.dispatch({
      type: SET_MULTIPLE_ALERT,
      payload: [
        {
          type: "error",
          msg:
            "Too many requests have been posted for now for the limited capacity of this website's free hosting. Please try again later",
        },
        {
          type: "error",
          msg:
            "Trop de requetes ont été passées pour le moment pour les capacités limitées de l'hébergeur gratuit ce site web. Merci de réessayer plus tard",
        },
      ],
    });
  }
};

export default handle429;

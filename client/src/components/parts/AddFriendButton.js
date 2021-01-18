import React from "react";
import { useDispatch } from "react-redux";
import axios from "axios";

import handle429 from "../../utils/handle429";

import { createAlert } from "../../actions/alertActions";

const AddFriendButton = (props) => {
  const { targetId, username } = { ...props };

  const dispatch = useDispatch();

  const handleFriendRequestEmition = async () => {
    try {
      const res = await axios.post(`/api/friends/add/${targetId}`);

      dispatch(
        createAlert({
          type: "success",
          msg: `${username} will be notified about your request!`,
        })
      );
    } catch (err) {
      handle429(err);

      if (err.response) {
        dispatch(createAlert({ type: "error", msg: err.response.data.msg }));
      } else {
        dispatch(
          createAlert({ type: "error", msg: "Sorry, an error occured" })
        );
      }
    }
  };

  return (
    <div>
      <button
        className={"btn highlight btn-highlight"}
        onClick={handleFriendRequestEmition}
      >
        Send friend request to {username}
      </button>
    </div>
  );
};

export default AddFriendButton;

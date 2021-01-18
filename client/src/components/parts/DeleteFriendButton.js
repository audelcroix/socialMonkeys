import React from "react";
import { useDispatch } from "react-redux";

import axios from "axios";

import handle429 from "../../utils/handle429";

import { createAlert } from "../../actions/alertActions";
import { deleteFriend } from "../../actions/authActions";

const DeleteFriendButton = (props) => {
  const { friend } = { ...props };

  const dispatch = useDispatch();

  const removeFriend = async (friendId) => {
    try {
      const res = await axios.delete(`/api/friends/${friendId}`);

      if (res.status === 200) {
        // delete friend from local friends list
        dispatch(deleteFriend(friend._id));
      }
    } catch (err) {
      handle429(err);

      if (err.response && err.response.data) {
        dispatch(
          createAlert({
            msg: err.response.data.msg,
            type: "error",
          })
        );
      } else {
        dispatch(
          createAlert({
            msg: "We are sorry, an internal error occured",
            type: "error",
          })
        );
      }
    }
  };

  return (
    <div className='my-2'>
      <button
        className='btn highlight btn-highlight'
        onClick={() => {
          removeFriend(friend._id);
        }}
      >
        Remove {friend.username} from your friends
      </button>
    </div>
  );
};

export default DeleteFriendButton;

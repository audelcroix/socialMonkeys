import React from "react";

import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import handle429 from "../../utils/handle429";

import { createAlert } from "../../actions/alertActions";
import { removeLikeNotification } from "../../actions/authActions";

const NavbarLikesModal = () => {
  const { notifications } = useSelector((state) => state.auth);
  const likes = notifications.likes;

  const dispatch = useDispatch();

  const readNotification = async (notifId) => {
    try {
      const res = await axios.post(`/api/images/readnotification/${notifId}`);

      if (res.status === 200) {
        // remove notif from local list
        dispatch(removeLikeNotification(notifId));
      }
    } catch (err) {
      handle429(err);

      dispatch(
        createAlert({
          msg:
            err.response.data.msg || "We are sorry, an internal error occured",
          type: "error",
        })
      );
    }
  };

  return (
    <div
      className='modal fade'
      id='likesModal'
      tabIndex='-1'
      aria-labelledby='likesModalLabel'
      aria-hidden='true'
    >
      <div className='modal-dialog'>
        <div className='modal-content'>
          <div className='modal-header'>
            <button
              type='button'
              className='btn btn-tertiary'
              data-bs-dismiss='modal'
            >
              Close
            </button>
          </div>

          <div className='modal-body'>
            {likes && likes.length > 0 ? (
              likes.map((like) => {
                return (
                  <p className='h6' key={uuidv4()}>
                    <a
                      href={`/user/${like.author.slugUsername}`}
                      className='link'
                    >
                      {like.author.username}
                    </a>{" "}
                    has liked your {}
                    {` has liked your ${
                      like.associatedImage ? "picture." : "post."
                    }`}
                    <i
                      onClick={() => {
                        readNotification(like._id);
                      }}
                      title='Mark as read'
                      className='bi bi-bookmark-check-fill i-sm i-main'
                    ></i>
                  </p>
                );
              })
            ) : (
              <p className='h6 my-1'>No like currently</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarLikesModal;

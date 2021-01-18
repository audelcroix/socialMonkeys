import React from "react";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import handle429 from "../../utils/handle429";

import { createAlert, createMultipleAlert } from "../../actions/alertActions";
import {
  removeFriendRequestNotifications,
  addFriend,
} from "../../actions/authActions";

const NavbarFriendsModal = () => {
  const { notifications } = useSelector((state) => state.auth);
  const friends = notifications.friends;

  const dispatch = useDispatch();

  const acceptFriendRequest = async (notifId, friend) => {
    try {
      const res = await axios.post(`/api/friends/acceptfriend/${notifId}`);

      if (res.status === 200) {
        // add friend to local friends list
        dispatch(addFriend(friend));

        // remove friends requests from notifications
        dispatch(removeFriendRequestNotifications(friend._id));

        // display message
        dispatch(
          createAlert({
            msg: `You and ${friend.username} are now friends`,
            type: "success",
          })
        );
      }

      // add author to user's client side friends list
    } catch (err) {
      handle429(err);

      if (err.response.status === 500 || err.response.status === 404) {
        dispatch(
          createAlert({
            type: "error",
            msg: "We are sorry, the server encountered an internal error",
          })
        );
      } else {
        if (err.response.data.msg) {
          // In case of a SINGLE error

          dispatch(createAlert({ msg: err.response.data.msg, type: "error" }));
        } else if (err.response.data.errors) {
          // In case of MULTIPLE errors

          dispatch(createMultipleAlert(err.response.data.errors));
        }
      }
    }
  };

  const declineFriendRequest = async (notifId, friendId) => {
    try {
      const res = await axios.post(`/api/friends/declinefriend/${notifId}`);

      if (res.status === 200) {
        // remove friends requests from notifications
        dispatch(removeFriendRequestNotifications(friendId));
      }

      // add author to user's client side friends list
    } catch (err) {
      handle429(err);

      if (err.response.status === 400) {
        // remove friends requests from notifications
        dispatch(removeFriendRequestNotifications(friendId));
      }

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
      id='friendsModal'
      tabIndex='-1'
      aria-labelledby='friendsModalLabel'
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
            {friends && friends.length > 0 ? (
              friends.map((friend) => {
                return (
                  <div key={uuidv4()} className='mb-1'>
                    <p className='h6 d-inline'>
                      <a
                        href={`/user/${friend.author.slugUsername}`}
                        className='link'
                      >
                        {friend.author.username}
                      </a>{" "}
                      has sent you a friend request
                    </p>
                    <button
                      onClick={() => {
                        acceptFriendRequest(friend._id, friend.author);
                      }}
                      className='ut-ml-10 btn btn-sm btn-tertiary'
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        declineFriendRequest(friend._id, friend.author._id);
                      }}
                      className='ut-ml-10 btn btn-sm btn-highlight'
                    >
                      Decline
                    </button>
                  </div>
                );
              })
            ) : (
              <div className='mb-1'>
                <p className='h6'>No friend request currently</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarFriendsModal;

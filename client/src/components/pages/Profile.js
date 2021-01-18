import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { useSelector, useDispatch } from "react-redux";

import handle429 from "../../utils/handle429";

import {
  updateUsername,
  updateUserTheme,
  setLoading,
} from "../../actions/authActions";
import { createAlert } from "../../actions/alertActions";
import { updateUserAvatar } from "../../actions/authActions";

import Spinner from "../parts/Spinner";
import PostItem from "../parts/PostItem";
import ImageItem from "../parts/ImageItem";
import ProfileFriendBar from "../parts/ProfileFriendBar";
import AddFriendButton from "../parts/AddFriendButton";
import DeleteFriendButton from "../parts/DeleteFriendButton";

const Profile = (props) => {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // used by the useEffect hook
  const defineStatus = () => {
    if (activeProfile._id === user._id) {
      return "owner";
    } else {
      if (
        activeProfile.friends.some((friend) => {
          return friend._id === user._id;
        }) &&
        user.friends.some((friend) => {
          return friend._id === activeProfile._id;
        })
      ) {
        return "friend";
      } else {
        return "stranger";
      }
    }
  };

  const [activeProfile, setActiveProfile] = useState(user);
  const [usersContent, setUsersContent] = useState([]);
  const [updatedUsername, setUpdatedUsername] = useState("");
  const [updatedTheme, setUpdatedTheme] = useState(user.theme || "spring");
  const [newAvatar, setNewAvatar] = useState(null);

  const [userStatus, setUserStatus] = useState(defineStatus());
  const [pageParameters, setPageParameters] = useState({
    showAllFriends: false,
    showUpdateForm: false,
    showUpdateTheme: false,
    showUpdateAvatar: false,
  });

  const loadUsersPosts = async () => {
    try {
      const loadedPosts = await axios.get(
        `/api/users/myposts/${props.match.params.slugUsername}`
      );

      return { type: "success", content: loadedPosts.data.posts };
    } catch (err) {
      handle429(err);

      return { type: "error", msg: err.response.data.msg };
    }
  };

  const getUsersProfile = async () => {
    try {
      dispatch(setLoading(true));

      const relevantUser = await axios.get(
        `/api/users/${props.match.params.slugUsername}`
      );

      setActiveProfile(relevantUser.data.user);

      dispatch(setLoading(false));

      return { type: "success" };
    } catch (err) {
      handle429(err);

      if (err.response) {
        dispatch(createAlert({ type: "error", msg: err.response.data.msg }));
      } else {
        dispatch(
          createAlert({ type: "error", msg: "Sorry, an error occured" })
        );
      }

      props.history.push("/404");
    }
  };

  // load relevant user informations
  useEffect(() => {
    dispatch(setLoading(true));

    loadUsersPosts().then((result) => {
      if (result.type === "success") {
        setUsersContent(result);
      } else {
        dispatch(createAlert({ msg: result.msg, type: "error" }));
        props.history.push("/404");
      }

      if (user.slugUsername === props.match.params.slugUsername) {
        // stops loading if user is visiting their own profile and no ulterior request is required
        dispatch(setLoading(false));
      }
    });

    if (user.slugUsername !== props.match.params.slugUsername) {
      // load visited user's profile
      getUsersProfile();
    } else {
      setActiveProfile(user);
    }
  }, [props.match.params.slugUsername]);

  // Update owner, friend or not friend features
  useEffect(() => {
    setUserStatus(defineStatus());
  }, [activeProfile, user.friends]);

  // Delete a post or an image
  const deleteElement = (id) => {
    if (typeof id !== "undefined") {
      setUsersContent((prevContent) => {
        let refreshedContent = prevContent.content.filter((element) => {
          return element._id !== id;
        });

        return { type: "success", content: refreshedContent };
      });
    } else {
      dispatch(createAlert({ msg: "Sorry, an error occured", type: "error" }));
    }
  };

  const handleUpdateFormSubmit = (event) => {
    event.preventDefault();

    dispatch(updateUsername({ username: updatedUsername }));
  };

  const handleThemeFormSubmit = (event) => {
    event.preventDefault();

    dispatch(updateUserTheme({ newTheme: updatedTheme }));
  };

  const handleUpdateFormChange = (event) => {
    setUpdatedUsername(event.target.value);
  };

  const handleThemeFormChange = (event) => {
    setUpdatedTheme(event.target.value);
  };

  const handleAvatarChange = (event) => {
    setNewAvatar(event.target.files[0]);
  };

  const handleAvatarUpdateFormSubmit = (event) => {
    event.preventDefault();

    dispatch(updateUserAvatar({ avatar: newAvatar }));
  };

  return (
    <div className='row'>
      {loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <div className='col'></div>

          <div className='col-md-8 col-10'>
            <div className='text-center mt-4'>
              <img
                className={`profile-avatar ${
                  userStatus === "owner" && "profile-avatar-active"
                }`}
                alt={`${activeProfile.username}\'s avatar`}
                // distinguished so when avatar is updated, profile picture is also immediately updated
                src={
                  userStatus === "owner"
                    ? `/img/users/avatars/${user.avatar}`
                    : `/img/users/avatars/${activeProfile.avatar}`
                }
                title={
                  userStatus === "owner"
                    ? "Update your avatar"
                    : activeProfile.username
                }
                onClick={() => {
                  setPageParameters({
                    ...pageParameters,
                    showUpdateAvatar: true,
                  });
                }}
              />

              {/* UPDATE AVATAR */}
              {pageParameters.showUpdateAvatar && (
                <form onSubmit={handleAvatarUpdateFormSubmit} className='mt-4'>
                  <fieldset>
                    <div className='mb-3'>
                      <input
                        type='file'
                        className='form-control'
                        name='avatar'
                        aria-describedby='updateFormAvatarHelp'
                        onChange={handleAvatarChange}
                      />
                    </div>

                    <button type='submit' className='btn btn-highlight'>
                      Update your avatar
                    </button>
                  </fieldset>

                  <p
                    id='updateFormAvatarHelp'
                    className='form-text h5 hover-active-main'
                    onClick={() => {
                      setPageParameters({
                        ...pageParameters,
                        showUpdateAvatar: false,
                      });
                    }}
                  >
                    Close
                  </p>
                </form>
              )}
            </div>

            {/* UPDATE USERNAME */}
            {!pageParameters.showUpdateForm ? (
              <p
                className={`h3 my-3 ${
                  userStatus === "owner" && "hover-active-main"
                }`}
                title={userStatus === "owner" ? "Update your username" : null}
                onClick={() => {
                  if (userStatus === "owner") {
                    setPageParameters({
                      ...pageParameters,
                      showUpdateForm: true,
                    });
                  }
                }}
              >
                {activeProfile.username}
              </p>
            ) : (
              <form onSubmit={handleUpdateFormSubmit}>
                <div className='input-group my-3'>
                  <input
                    onChange={handleUpdateFormChange}
                    type='text'
                    placeholder='Update your username'
                    value={updatedUsername}
                    minLength='3'
                    name='username'
                    id='updateFormUsername'
                    className='form-control'
                    aria-describedby='updateFormUsernameHelp'
                  />

                  <button className='btn btn-main' type='submit'>
                    Change
                  </button>
                </div>

                <p
                  id='updateFormUsernameHelp'
                  className='form-text h5 hover-active-main'
                  onClick={() => {
                    setPageParameters({
                      ...pageParameters,
                      showUpdateForm: false,
                    });
                  }}
                >
                  Close
                </p>
              </form>
            )}

            {/* CHANGE THEME */}
            {userStatus === "owner" &&
              (!pageParameters.showUpdateTheme ? (
                <button
                  className={`btn btn-highlight h3 my-3`}
                  title={
                    userStatus === "owner" ? "Change your color theme" : null
                  }
                  onClick={() => {
                    if (userStatus === "owner") {
                      setPageParameters({
                        ...pageParameters,
                        showUpdateTheme: true,
                      });
                    }
                  }}
                >
                  Change Theme
                </button>
              ) : (
                <form onSubmit={handleThemeFormSubmit}>
                  <select
                    onChange={handleThemeFormChange}
                    value={updatedTheme}
                    className='form-select my-3'
                    aria-label='Change your color theme'
                  >
                    <option value='spring'>Spring</option>

                    <option value='summer'>Summer</option>

                    <option value='autumn'>Autumn</option>

                    <option value='winter'>Winter</option>
                  </select>

                  <div className='mb-3'>
                    <button
                      className='btn btn-tertiary btn-sm d-inline ut-mr-10'
                      type='submit'
                    >
                      Change
                    </button>

                    <p
                      id='updateFormThemeHelp'
                      className='form-text h5 hover-active-main d-inline'
                      onClick={() => {
                        setPageParameters({
                          ...pageParameters,
                          showUpdateTheme: false,
                        });
                      }}
                    >
                      Close
                    </p>
                  </div>
                </form>
              ))}

            {userStatus === "owner" || userStatus === "friend" ? (
              <ProfileFriendBar
                friends={activeProfile.friends}
                status={userStatus}
                activeUsername={activeProfile.username}
              />
            ) : (
              <AddFriendButton
                targetId={activeProfile._id}
                username={activeProfile.username}
              />
            )}

            {userStatus === "friend" && (
              <DeleteFriendButton friend={activeProfile} />
            )}

            <p className='h3 my-3'>{`${
              userStatus === "owner" ? "Your" : `${activeProfile.username}\'s`
            } activity`}</p>

            {usersContent &&
            usersContent.type === "success" &&
            usersContent.content.length > 0 ? (
              usersContent.content.map((element) => {
                if (element.image) {
                  return (
                    <ImageItem
                      key={uuidv4()}
                      id={element.id}
                      image={element}
                      onDelete={deleteElement}
                    />
                  );
                } else {
                  return (
                    <PostItem
                      key={uuidv4()}
                      id={element.id}
                      post={element}
                      onDelete={deleteElement}
                    />
                  );
                }
              })
            ) : (
              <h4>No post for this user yet</h4>
            )}
          </div>

          <div className='col'></div>
        </Fragment>
      )}
    </div>
  );
};

export default Profile;

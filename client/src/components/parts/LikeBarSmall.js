import React, { Fragment, useState } from "react";
import { useDispatch } from "react-redux";

import axios from "axios";
import Pluralize from "react-pluralize";

import handle429 from "../../utils/handle429";

import { createAlert } from "../../actions/alertActions";

const LikeBarSmall = (props) => {
  const { userId, type, item } = { ...props };

  const checkLikesId = item.likes.filter((likeAuthor) => {
    return likeAuthor === userId;
  });

  const [numberOfLikes, setNumberOfLikes] = useState(item.likes.length);
  const [hasLiked, setHasLiked] = useState(checkLikesId.length > 0);

  const dispatch = useDispatch();

  // UNIFIED POST/IMAGE LIKER
  const handleLike = async () => {
    try {
      const res = await axios.post(`/api/${type}/like/${item._id}`);

      if (res.status === 200) {
        setNumberOfLikes(numberOfLikes + 1);
      }

      setHasLiked(true);
    } catch (err) {
      handle429(err);

      if (err.response && err.response.data.msg) {
        dispatch(createAlert({ msg: err.response.data.msg, type: "error" }));
      } else {
        dispatch(
          createAlert({
            msg: "Sorry, an error occured during the liking process",
            type: "error",
          })
        );
      }
    }
  };

  // UNIFIED POST/IMAGE UNLIKER
  const handleUnlike = async () => {
    try {
      const res = await axios.delete(`/api/${type}/like/${item._id}`);

      if (res.status === 200) {
        setNumberOfLikes(numberOfLikes - 1);
      }

      setHasLiked(false);
    } catch (err) {
      handle429(err);

      if (err.response && err.response.data.msg) {
        dispatch(createAlert({ msg: err.response.data.msg, type: "error" }));
      } else {
        dispatch(
          createAlert({
            msg: "Sorry, an error occured during the liking process",
            type: "error",
          })
        );
      }
    }
  };

  return (
    <div className='d-inline-block ut-mr-10'>
      <small>
        <Pluralize singular={"like"} count={numberOfLikes} />
      </small>

      {hasLiked ? (
        <i
          onClick={handleUnlike}
          title='Unlike'
          className='bi bi-suit-heart-fill i-md i-main ut-ml-10'
        ></i>
      ) : (
        <i
          onClick={handleLike}
          title='Like'
          className='bi bi-suit-heart i-md i-main ut-ml-10'
        ></i>
      )}
    </div>
  );
};

export default LikeBarSmall;

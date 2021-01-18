import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import moment from "moment";
import axios from "axios";

import handle429 from "../../utils/handle429";

import { createAlert } from "../../actions/alertActions";
import { setLoading } from "../../actions/authActions";

import LikeBarSmall from "../parts/LikeBarSmall";

const PostItem = (props) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { post, onDelete } = { ...props };

  const deletePost = async () => {
    if (post.author._id === user._id) {
      try {
        dispatch(setLoading(true));

        const res = await axios.delete(`/api/posts/${post._id}`);

        dispatch(
          createAlert({
            msg: res.data.msg,
            type: "success",
          })
        );

        onDelete(post._id);

        dispatch(setLoading(false));
      } catch (err) {
        handle429(err);

        if (err.response && err.response.data.msg) {
          dispatch(
            createAlert({
              msg: err.response.data.msg,
              type: "error",
            })
          );
        } else {
          dispatch(
            createAlert({
              msg: "We are sorry, an error occured",
              type: "error",
            })
          );
        }
      }
    } else {
      dispatch(
        createAlert({
          msg: "You cannot delete a post that isn't yours",
          type: "error",
        })
      );
    }
  };

  return (
    <div className='card mb-4'>
      <div className='card-body'>
        <p className='card-text'>{post.content}</p>

        <div className='card-subtitle'></div>

        <LikeBarSmall type={"posts"} userId={user._id} item={post} />

        {post.author._id === user._id && (
          <i
            onClick={deletePost}
            title='Delete this post'
            className='bi bi-trash-fill i-md i-secondary'
          ></i>
        )}
      </div>

      <div className='card-footer bg-main'>
        <div className='row'>
          <div className='col-sm-6 col-12'>
            {post.edited ? (
              <small className='card-text'>
                Last edited {moment(post.dateEdited).format("LLLL")}, posted{" "}
                {moment(post.datePosted).format("LLLL")}
              </small>
            ) : (
              <small>Posted {moment(post.datePosted).format("LLLL")}</small>
            )}
          </div>

          <div className='col-sm-6 col-12'>
            <small className='card-text float-sm-end'>
              By{" "}
              <Link
                to={`/user/${post.author.slugUsername}`}
                className='link text-decoration-none'
              >
                {post.author.username}
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;

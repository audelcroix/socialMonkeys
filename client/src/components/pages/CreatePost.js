import React, { Fragment, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";

import handle429 from "../../utils/handle429";

import { setLoading } from "../../actions/authActions";
import { createAlert, createMultipleAlert } from "../../actions/alertActions";

import Spinner from "../parts/Spinner";

const CreatePost = (props) => {
  const { loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [postContent, setPostContent] = useState("");

  const createPost = async (post) => {
    // For JSON
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      dispatch(setLoading(true));

      const res = await axios.post("/api/posts", post, config);

      dispatch(createAlert({ msg: "Post created", type: "success" }));

      dispatch(setLoading(false));

      props.history.push(`/user/${user.slugUsername}`);
    } catch (err) {
      handle429(err);

      if (err.response && err.response.status === 500) {
        dispatch(
          createAlert({
            type: "error",
            msg:
              "We are sorry, the server encountered an internal error during the upload",
          })
        );
      } else {
        if (err.response.data.msg) {
          // In case of a SINGLE error

          dispatch(createAlert({ msg: err.response.data.msg, type: "error" }));
        } else if (err.response.data.errors) {
          // In case of MULTIPLE errors

          createMultipleAlert(err.response.data.errors);
        }
      }

      dispatch(setLoading(false));
    }
  };

  const handlePostSubmit = (event) => {
    event.preventDefault();

    createPost({ content: postContent });
  };

  const handlePostContent = (event) => {
    setPostContent(event.target.value);
  };

  useEffect(() => {
    dispatch(setLoading(false));
  }, []);

  return (
    <div className='row'>
      {loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <div className='col'></div>

          <div className='col-md-8 col-10'>
            <form onSubmit={handlePostSubmit} className='my-5 h5'>
              <fieldset>
                <div className='mb-3'>
                  <label htmlFor='postContent' className='form-label h5 mb-3'>
                    Write a post
                  </label>

                  {/* <input
                    onChange={handlePostContent}
                    type='text'
                    placeholder='Content...'
                    value={postContent}
                    name='content'
                    className='form-control'
                    id='postContent'
                  /> */}

                  <textarea
                    className='form-control'
                    rows='5'
                    onChange={handlePostContent}
                    placeholder='Write your message here.'
                    placeholder='Message...'
                    value={postContent}
                    name='content'
                    maxLength='1000'
                    id='postContent'
                  />
                </div>

                <button type='submit' className='btn btn-highlight'>
                  Publish
                </button>
              </fieldset>
            </form>
          </div>

          <div className='col'></div>
        </Fragment>
      )}
    </div>
  );
};

export default CreatePost;

import React, { Fragment, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import handle429 from "../../utils/handle429";

import { setLoading } from "../../actions/authActions";
import { createAlert, createMultipleAlert } from "../../actions/alertActions";

import Spinner from "../parts/Spinner";

const CreateImage = (props) => {
  const { loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [newImagePost, setNewImagePost] = useState({
    imagePost: null,
    description: "",
  });

  const uploadImagePost = async (image) => {
    // for json
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    try {
      const formData = new FormData();

      formData.append("imagePost", image.imagePost, image.imagePost.name);
      formData.append("description", image.description);

      dispatch(setLoading(true));

      const res = await axios.post("/api/images", formData, config);

      dispatch(createAlert({ type: "success", msg: "Upload Successful" }));

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

          dispatch(createMultipleAlert(err.response.data.errors));
        }
      }

      dispatch(setLoading(false));
    }
  };

  const handleImageSubmit = (event) => {
    event.preventDefault();

    if (!newImagePost.imagePost) {
      dispatch(createAlert({ msg: "No picture selected!", type: "error" }));
    } else {
      uploadImagePost(newImagePost);
    }
  };

  const handleChange = (event) => {
    setNewImagePost({ ...newImagePost, description: event.target.value });
  };

  const handleImageChange = (event) => {
    setNewImagePost({ ...newImagePost, imagePost: event.target.files[0] });
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
            <form onSubmit={handleImageSubmit}>
              <fieldset>
                <div className='mb-3'>
                  <label
                    htmlFor='imageDescription'
                    className='form-label h5 mt-3'
                  >
                    Post an image
                  </label>

                  <textarea
                    className='form-control'
                    rows='5'
                    onChange={handleChange}
                    placeholder='Write your description here.'
                    placeholder='Description...'
                    value={newImagePost.description}
                    name='description'
                    maxLength='1000'
                    id='imageDescription'
                  />
                </div>

                <div className='mb-3'>
                  <input
                    type='file'
                    className='form-control'
                    name='imagePost'
                    onChange={handleImageChange}
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

export default CreateImage;

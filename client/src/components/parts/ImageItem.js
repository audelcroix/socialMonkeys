import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import moment from "moment";
import axios from "axios";

import handle429 from "../../utils/handle429";

import { createAlert } from "../../actions/alertActions";
import { setLoading } from "../../actions/authActions";

import LikeBarSmall from "../parts/LikeBarSmall";

const ImageItem = (props) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const { image, onDelete } = { ...props };

  const deleteImage = async () => {
    if (image.author._id === user._id) {
      try {
        dispatch(setLoading(true));

        const res = await axios.delete(`/api/images/${image._id}`);

        dispatch(
          createAlert({
            msg: res.data.msg,
            type: "success",
          })
        );

        onDelete(image._id);

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
          msg: "You cannot delete an image that isn't yours",
          type: "error",
        })
      );
    }
  };

  return (
    <div className='card mb-4'>
      <Link to={`/image/${image._id}`}>
        <img
          className='card-img-top'
          alt={`An image by ${image.author.username}`}
          src={`/img/users/posts/${image.image}`}
        />
      </Link>

      <div className='card-body'>
        <LikeBarSmall type={"images"} userId={user._id} item={image} />

        {image.author._id === user._id && (
          <i
            onClick={deleteImage}
            title='Delete this image'
            className='bi bi-trash-fill i-md i-secondary'
          ></i>
        )}
      </div>

      <div className='card-footer bg-main'>
        <div className='row'>
          <div className='col-sm-6 col-12'>
            {image.edited ? (
              <small>
                Last edited {moment(image.dateEdited).format("LLLL")}, posted{" "}
                {moment(image.datePosted).format("LLLL")}
              </small>
            ) : (
              <small>Posted {moment(image.datePosted).format("LLLL")}</small>
            )}
          </div>

          <div className='col-sm-6 col-12'>
            <small className='card-text float-sm-end'>
              By{" "}
              <Link
                to={`/user/${image.author.slugUsername}`}
                className='link text-decoration-none'
              >
                {image.author.username}
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageItem;

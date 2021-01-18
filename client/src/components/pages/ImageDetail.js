import React, { Fragment, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment";

import handle429 from "../../utils/handle429";

import { setLoading } from "../../actions/authActions";
import { createAlert } from "../../actions/alertActions";

import Spinner from "../parts/Spinner";
import LikeBarSmall from "../parts/LikeBarSmall";

const ImageDetail = (props) => {
  const { loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [displayedImage, setDisplayedImage] = useState(null);
  const [numberOfLikes, setNumberOfLikes] = useState(0);

  useEffect(() => {
    const getRelevantImage = async () => {
      try {
        dispatch(setLoading(true));

        const res = await axios.get(
          `/api/images/${props.match.params.imageId}`
        );

        setDisplayedImage(res.data.image);
        setNumberOfLikes(res.data.image.likes.length);

        dispatch(setLoading(false));
      } catch (err) {
        handle429(err);

        if (err.status === 500) {
          createAlert({
            type: "error",
            msg: "We are sorry, an internal error happened",
          });

          dispatch(setLoading(false));
        } else {
          if (err.response.data.msg) {
            createAlert({ type: "error", msg: err.response.data.msg });
            setLoading(false);
          }
        }

        props.history.push("/404");
      }
    };

    getRelevantImage();

    // eslint-disable-next-line
  }, []);

  return (
    <div className='row'>
      {loading ? (
        <Spinner />
      ) : displayedImage ? (
        <Fragment>
          <div className='col'></div>

          <div className='col-10'>
            <div className='w-100 text-center'>
              <img
                src={`/img/users/posts/${displayedImage.image}`}
                alt={`${displayedImage._id}-by-${displayedImage.author.username}`}
                className='img-detail my-3 mx-auto img-fluid'
              />
            </div>

            <div className='cartel mb-4'>
              <Link
                className='h5 d-block link text-decoration-none'
                to={`/user/${displayedImage.author.slugUsername}`}
              >
                By {displayedImage.author.username}
              </Link>

              <LikeBarSmall
                type={"images"}
                userId={user._id}
                item={displayedImage}
              />

              <p className='border rounded mb-3 p-3'>
                {displayedImage.description}
              </p>

              {displayedImage.edited ? (
                <small className='card-text'>
                  Last edited {moment(displayedImage.dateEdited).format("LLLL")}
                  , posted {moment(displayedImage.datePosted).format("LLLL")}
                </small>
              ) : (
                <small>
                  Posted {moment(displayedImage.datePosted).format("LLLL")}
                </small>
              )}
            </div>
          </div>

          <div className='col'></div>
        </Fragment>
      ) : (
        <h1>Error</h1>
      )}
    </div>
  );
};

export default ImageDetail;

import React, { useEffect, useState, Fragment } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import handle429 from "../../utils/handle429";

import { useSelector, useDispatch } from "react-redux";
import { setLoading } from "../../actions/authActions";
import { createAlert } from "../../actions/alertActions";

import Spinner from "../parts/Spinner";
import PostItem from "../parts/PostItem";
import ImageItem from "../parts/ImageItem";

const Home = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [usersNewsFeed, setUsersNewsFeed] = useState([]);

  // load authenticated users's newsfeed
  useEffect(() => {
    const loadUsersNewsFeed = async () => {
      try {
        dispatch(setLoading(true));

        const newsFeed = await axios.get("/api/users/newsfeed");

        setUsersNewsFeed(newsFeed.data.results);
      } catch (err) {
        dispatch(createAlert({ msg: err.response.data.msg, type: "error" }));

        handle429(err);
      }

      dispatch(setLoading(false));
    };

    loadUsersNewsFeed();
  }, []);

  return (
    <div className='row'>
      {loading ? (
        <Spinner />
      ) : isAuthenticated ? (
        <Fragment>
          <div className='col'></div>

          <div className='col-md-8 col-10'>
            <p className='h3 my-3'>NewsFeed</p>

            {usersNewsFeed && usersNewsFeed.length > 0 ? (
              usersNewsFeed.map((element) => {
                if (element.image) {
                  return (
                    <ImageItem key={uuidv4()} id={element.id} image={element} />
                  );
                } else {
                  return (
                    <PostItem key={uuidv4()} id={element.id} post={element} />
                  );
                }
              })
            ) : (
              <h4>No post relevant for your account</h4>
            )}
          </div>

          <div className='col'></div>
        </Fragment>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Home;

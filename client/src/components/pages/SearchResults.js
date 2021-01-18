import React, { Fragment, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import handle429 from "../../utils/handle429";

import { setLoading } from "../../actions/authActions";
import { createAlert } from "../../actions/alertActions";

import SearchResultItem from "../parts/SearchResultItem";
import Spinner from "../parts/Spinner";

const SearchResults = (props) => {
  const match = props.match.params.query;

  const { loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [results, setResults] = useState([]);

  useEffect(() => {
    dispatch(setLoading(true));

    const searchQuery = async () => {
      try {
        const res = await axios.post("/api/users/search", {
          query: match || "test",
        });

        setResults(res.data.queryResults);

        dispatch(setLoading(false));
      } catch (err) {
        handle429(err);

        if (err.response) {
          dispatch(createAlert({ msg: err.response.data.msg, type: "error" }));
        } else {
          dispatch(
            createAlert({ msg: "Sorry, an error occured", type: "error" })
          );
        }
      }
    };

    searchQuery();
    // eslint-disable-next-line
  }, [props.match.params.query]);

  return (
    <div className='row mb-3'>
      {loading ? (
        <Spinner />
      ) : (
        <Fragment>
          <div className='col'></div>
          <div className='col-md-7 col-10'>
            <div>
              <p className='h5 my-3'>{`Search results for \"${match}\":`}</p>

              <div className='row row-cols-1 row-cols-md-3 row-cols-sm-2 row-cols-xl-4 g-3'>
                {results.length > 0 ? (
                  results.map((result) => {
                    return <SearchResultItem key={uuidv4()} result={result} />;
                  })
                ) : (
                  <div className='col w-100'>
                    <p className='h5'>No result for this term</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='col'></div>
        </Fragment>
      )}
    </div>
  );
};

export default SearchResults;

import React, { useState, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createAlert } from "../../actions/alertActions";

const SearchBar = (props) => {
  const dispatch = useDispatch();
  const [queriedText, setQueriedText] = useState("");

  const handleQueryChange = (event) => {
    setQueriedText(event.target.value);
  };

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    try {
      props.history.push(`/search/${queriedText}`);
    } catch (err) {
      dispatch(createAlert({ msg: "Sorry, an error occured", type: "error" }));
    }
  };

  return (
    <Fragment>
      <form className='d-flex' onSubmit={handleSearchSubmit}>
        <input
          onChange={handleQueryChange}
          className='form-control me-2'
          placeholder='Search for friends'
          type='search'
          value={queriedText}
          name='query'
          aria-label='Search'
        />

        <button className='btn btn-highlight' type='submit'>
          Search
        </button>
      </form>
    </Fragment>
  );
};

export default withRouter(SearchBar);

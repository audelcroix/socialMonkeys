import React from "react";
import { Link } from "react-router-dom";

const SearchResultItem = (props) => {
  const { result } = { ...props };

  return (
    <div className='col'>
      <div className='card text-center bg-main'>
        <Link
          to={`/user/${result.slugUsername}`}
          className='link text-decoration-none'
        >
          <img
            className={"search-list-avatar mt-3"}
            alt={`${result.username}\'s avatar`}
            src={`/img/users/avatars/${result.avatar}`}
          />

          <div className='card-body'>
            <h5 className='card-title'>{result.username}</h5>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SearchResultItem;

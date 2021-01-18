import React, { useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { getUserNotifications, logout } from "../../actions/authActions";

import SearchBar from "./SearchBar";
import NavbarFriendsModal from "./NavbarFriendsModal";
import NavbarLikesModal from "./NavbarLikesModal";

const Navbar = () => {
  const { isAuthenticated, user, notifications } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    isAuthenticated && dispatch(getUserNotifications());
  }, [isAuthenticated]);

  const logOut = () => {
    dispatch(logout());
  };

  return (
    <nav className='navbar navbar-expand-lg bg-main'>
      <div className='container-fluid'>
        <Link to='/' className='navbar-brand'>
          Social<span className='navbar-title'>Monkeys</span>
        </Link>

        <button
          className='navbar-toggler custom-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarSupportedContent'
          aria-controls='navbarSupportedContent'
          aria-expanded='false'
          aria-label='Toggle navigation'
          title='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div className='collapse navbar-collapse' id='navbarSupportedContent'>
          <ul className='navbar-nav me-auto mb-2 mb-lg-0'>
            {isAuthenticated && (
              <Fragment>
                <li className='nav-item'>
                  <Link to='/' className='nav-link'>
                    NewsFeed
                  </Link>
                </li>

                <li className='nav-item'>
                  <Link to={`/user/${user.slugUsername}`} className='nav-link'>
                    {user.username}
                  </Link>
                </li>

                <li className='nav-item'>
                  <Link to='/post' className='nav-link'>
                    Write
                  </Link>
                </li>

                <li className='nav-item'>
                  <Link to='/image' className='nav-link'>
                    Show
                  </Link>
                </li>
              </Fragment>
            )}

            <li className='nav-item'>
              <Link to='/about' className='nav-link'>
                About
              </Link>
            </li>

            <li className='nav-item'>
              {isAuthenticated ? (
                <Link to='/login' className='nav-link' onClick={logOut}>
                  Logout
                </Link>
              ) : (
                <Link to='/login' className='nav-link'>
                  Login
                </Link>
              )}
            </li>

            {!isAuthenticated && (
              <li className='nav-item'>
                <Link to='/register' className='nav-link'>
                  Register
                </Link>
              </li>
            )}

            {isAuthenticated && (notifications.friends || notifications.likes) && (
              <li className='nav-item dropdown'>
                <a
                  className='nav-link dropdown-toggle'
                  href='#'
                  id='navbarDropdown'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  Notifications
                  {notifications.friends.length + notifications.likes.length >
                    0 &&
                    ` (${
                      notifications.friends.length + notifications.likes.length
                    })`}
                </a>
                <ul className='dropdown-menu' aria-labelledby='navbarDropdown'>
                  <li>
                    <p
                      className='dropdown-item'
                      data-bs-toggle='modal'
                      data-bs-target='#likesModal'
                    >
                      Likes : {notifications.likes.length}
                    </p>
                  </li>

                  <li>
                    <hr className='dropdown-divider' />
                  </li>

                  <li>
                    <p
                      className='dropdown-item'
                      data-bs-toggle='modal'
                      data-bs-target='#friendsModal'
                    >
                      Friends : {notifications.friends.length}
                    </p>
                  </li>
                </ul>
              </li>
            )}
          </ul>
          {isAuthenticated && <SearchBar />}
        </div>
      </div>

      <NavbarLikesModal />
      <NavbarFriendsModal />
    </nav>
  );
};

export default Navbar;

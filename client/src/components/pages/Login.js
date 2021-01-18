import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { login } from "../../actions/authActions";
import { createAlert } from "../../actions/alertActions";

const Login = (props) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const emailIsValid = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // redirect to homepage when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      props.history.push("/");
    }
  }, [isAuthenticated, props.history]);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const { email, password } = user;

  const handleFormChange = (event) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    if (!emailIsValid(email)) {
      dispatch(createAlert({ msg: "Email is invalid", type: "error" }));
    } else if (password === "") {
      dispatch(createAlert({ msg: "Password is required", type: "error" }));
    } else if (password.length < 8) {
      dispatch(
        createAlert({
          msg: "Passwords are 8 characters long at least",
          type: "error",
        })
      );
    } else {
      dispatch(
        login({
          email,
          password,
        })
      );
    }
  };

  return (
    <div className='row'>
      <div className='col'></div>

      <div className='col-md-7 col-10'>
        <div>
          <legend>Account Login</legend>

          <form onSubmit={handleFormSubmit} className='mb-3' noValidate>
            <div className='mb-3'>
              <label htmlFor='loginFormEmail' className='form-label'>
                Email address
              </label>

              <input
                type='email'
                name='email'
                value={email}
                onChange={handleFormChange}
                className='form-control w-md-50'
                id='loginFormEmail'
              />
            </div>

            <div className='mb-3'>
              <label htmlFor='loginFormPassword' className='form-label'>
                Password
              </label>

              <input
                type='password'
                name='password'
                value={password}
                onChange={handleFormChange}
                className='form-control'
                id='loginFormPassword'
              />
            </div>

            <button
              type='submit'
              className='btn btn-highlight text-decoration-none'
            >
              Login
            </button>
          </form>

          <small>
            You do not have an account yet?{" "}
            <Link to={"/register"} className='link'>
              Register
            </Link>
          </small>
        </div>
      </div>

      <div className='col'></div>
    </div>
  );
};

export default Login;

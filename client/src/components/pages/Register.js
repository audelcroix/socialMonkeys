import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { createAlert } from "../../actions/alertActions";
import { register } from "../../actions/authActions";

const Register = (props) => {
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
    username: "",
  });

  const { email, password, username } = user;

  const handleFormChange = (event) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    if (username.length < 3) {
      dispatch(
        createAlert({
          msg: "Usernames must be 3 characters long at least",
          type: "error",
        })
      );
    } else if (!emailIsValid(email)) {
      dispatch(createAlert({ msg: "Email is invalid", type: "error" }));
    } else if (password === "") {
      dispatch(createAlert({ msg: "Password is required", type: "error" }));
    } else if (password.length < 8) {
      dispatch(
        createAlert({
          msg: "Passwords must be 8 characters long at least",
          type: "error",
        })
      );
    } else {
      dispatch(
        register({
          username,
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
          <legend>Create your account</legend>

          <form className='mb-3' onSubmit={handleFormSubmit} noValidate>
            <div className='mb-3'>
              <label htmlFor='formUsername' className='form-label'>
                Username
              </label>

              <input
                type='text'
                name='username'
                value={username}
                onChange={handleFormChange}
                className='form-control w-md-50'
                id='formUsername'
                minLength='3'
              />
            </div>

            <div className='mb-3'>
              <label htmlFor='formEmail' className='form-label'>
                Email
              </label>

              <input
                type='email'
                name='email'
                value={email}
                onChange={handleFormChange}
                className='form-control'
                id='formEmail'
              />
            </div>

            <div className='mb-3'>
              <label htmlFor='formPassword'>Password</label>
              <input
                type='password'
                name='password'
                value={password}
                onChange={handleFormChange}
                className='form-control'
                id='formPassword'
                minLength='8'
              />
            </div>

            <button type='submit' className='btn btn-highlight'>
              Register
            </button>
          </form>

          <small>
            Already have an account?{" "}
            <Link to={"/login"} className='link text-decoration-none'>
              Login
            </Link>
          </small>
        </div>
      </div>

      <div className='col'></div>
    </div>
  );
};

export default Register;

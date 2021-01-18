import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import { setLoading } from "../../actions/authActions";

const About = () => {
  const dispatch = useDispatch();

  const [activePanel, setActivePanel] = useState("en");

  useEffect(() => {
    dispatch(setLoading(false));
  }, []);

  return (
    <div className='row'>
      <div className='col'></div>

      <div className='col-md-6 col-sm-8 col-10'>
        <div className='card text-center mt-5'>
          <div className='card-header bg-main'>
            <ul className='nav nav-tabs card-header-tabs'>
              <li
                className='nav-item'
                onClick={() => {
                  setActivePanel("en");
                }}
              >
                <p
                  className={`nav-link ${
                    activePanel !== "en" && "btn-highlight"
                  }`}
                  aria-current='true'
                >
                  English
                </p>
              </li>

              <li
                className='nav-item'
                onClick={() => {
                  setActivePanel("fr");
                }}
              >
                <p
                  className={`nav-link ${
                    activePanel !== "fr" && "btn-highlight"
                  }`}
                >
                  Français
                </p>
              </li>
            </ul>
          </div>

          <div className={` ${activePanel !== "en" && "d-none"}`}>
            <div className='card-body'>
              <p className='h4 card-title'>About</p>

              <p className='card-text'>
                This website is a MERN Stack demonstration project by{" "}
                <a href='https://audelcroix.com' className='link'>
                  Aurélien Delcroix
                </a>
                . No actual use intended.
              </p>
            </div>

            <ul className='list-group list-group-flush'>
              <li className='list-group-item'>
                <p className='card-subtitle h6'>Technologies used:</p>
              </li>
              <li className='list-group-item'>React.js Redux Bootstrap 5</li>
              <li className='list-group-item'>Node.js MongoDB Mongoose</li>
            </ul>

            <div className='card-footer bg-main'>Created January 2021</div>
          </div>

          <div className={` ${activePanel !== "fr" && "d-none"}`}>
            <div className='card-body'>
              <p className='h4 card-title'>&#192; propos</p>

              <p className='card-text'>
                Ce site internet est un projet de démonstration utilisant le
                stack MERN réalisé par{" "}
                <a href='https://audelcroix.com'>Aurélien Delcroix</a>. Aucun
                usage réel de ce site internet n'est prévu.
              </p>
            </div>

            <ul className='list-group list-group-flush'>
              <li className='list-group-item'>
                <p className='card-subtitle h6'>Technologies utilisées:</p>
              </li>
              <li className='list-group-item'>React.js Redux Bootstrap 5</li>
              <li className='list-group-item'>Node.js MongoDB Mongoose</li>
            </ul>

            <div className='card-footer bg-main'>Créé en janvier 2021</div>
          </div>
        </div>
      </div>

      <div className='col'></div>
    </div>
  );
};

export default About;

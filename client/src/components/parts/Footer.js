import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className='footer bg-main'>
      <p className='text-center fs-6 p-2 pt-4'>
        <Link to={"/about"} className='text-decoration-none link'>
          SocialMonkeys
        </Link>{" "}
        is a demonstration website using React.js, Bootstrap 5, Redux, Node.js
        and Mongoose by{" "}
        <a href='https://audelcroix.com/' className='link'>
          Aurélien Delcroix
        </a>
      </p>
    </footer>
  );
};

export default Footer;

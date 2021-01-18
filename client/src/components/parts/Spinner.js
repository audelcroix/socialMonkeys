import React from "react";

const Spinner = () => {
  return (
    <div className='d-flex justify-content-center'>
      <div
        className='spinner-grow mt-5 spinner'
        style={{ width: "6rem", height: "6rem" }}
        role='status'
      >
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  );
};

export default Spinner;

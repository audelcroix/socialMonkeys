import React from "react";
import { useDispatch } from "react-redux";

const AlertItem = (props) => {
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(props.removeAlert(props.id));
  };

  return (
    <p className={`alert-msg-${props.type} mb-1`} onClick={handleDelete}>
      {props.msg}
    </p>
  );
};

export default AlertItem;

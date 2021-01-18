import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { v4 as uuidv4 } from "uuid";
import AlertItem from "./AlertItem";

import { removeAlert, deleteAllAlerts } from "../../actions/alertActions";

const AlertBar = () => {
  const { alerts } = useSelector((state) => state.alert);
  const dispatch = useDispatch();

  return (
    <div className='alert-bar w-100'>
      {alerts.length > 0 && (
        <p
          onClick={() => {
            dispatch(deleteAllAlerts());
          }}
          className='my-0'
        >
          Remove all alerts
        </p>
      )}

      {alerts.map((alert) => {
        return (
          <AlertItem
            key={uuidv4()}
            id={alert.id}
            msg={alert.msg}
            type={alert.type}
            removeAlert={removeAlert}
          />
        );
      })}
    </div>
  );
};

export default AlertBar;
